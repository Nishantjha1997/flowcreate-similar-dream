// razorpay-webhook
// Server-to-server subscription lifecycle for Razorpay (complements the
// existing client-initiated verify-razorpay-payment flow, and closes its
// replay hole: a payment id that already extended a subscription is never
// applied twice).
//
// Verifies the X-Razorpay-Signature (HMAC-SHA256 of the RAW body with
// RAZORPAY_WEBHOOK_SECRET, constant-time compare), records the event in
// webhook_events for idempotency, then applies effects.
//
// Handled events:
//   payment.captured -> activate/extend plan (guarded against replays),
//                       record payment, notify user
//   payment.failed   -> notify user
//
// Secrets: RAZORPAY_WEBHOOK_SECRET, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
// Deploy:  supabase functions deploy razorpay-webhook --no-verify-jwt
// Register in Razorpay Dashboard -> Settings -> Webhooks:
//   https://<project-ref>.functions.supabase.co/razorpay-webhook
//   (enable payment.captured and payment.failed)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getPaymentGatewayKeys } from '../_shared/paymentKeyManager.ts'
import { notifyUser } from '../_shared/notify.ts'

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

async function hmacHex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message))
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  const ab = new TextEncoder().encode(a)
  const bb = new TextEncoder().encode(b)
  let diff = 0
  for (let i = 0; i < ab.length; i++) diff |= ab[i] ^ bb[i]
  return diff === 0
}

serve(async (req) => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  const { webhookSecret } = await getPaymentGatewayKeys(supabaseUrl, serviceRoleKey, 'razorpay')
  if (!webhookSecret) return json({ error: 'Not configured' }, 500)

  const signature = req.headers.get('x-razorpay-signature')
  if (!signature) return json({ error: 'Missing signature' }, 400)

  const rawBody = await req.text()
  const expected = await hmacHex(webhookSecret, rawBody)
  if (!timingSafeEqual(expected, signature)) {
    console.error('Razorpay signature verification failed')
    return json({ error: 'Invalid signature' }, 400)
  }

  let payload: Record<string, unknown>
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return json({ error: 'Invalid JSON' }, 400)
  }

  const eventType = String(payload.event ?? '')
  // x-razorpay-event-id uniquely identifies a delivery attempt chain.
  const eventId = req.headers.get('x-razorpay-event-id') ?? `synthetic:${eventType}:${
    // deno-lint-ignore no-explicit-any
    (payload as any)?.payload?.payment?.entity?.id ?? crypto.randomUUID()
  }`

  const admin = createClient(supabaseUrl, serviceRoleKey)

  // --- Idempotency (same protocol as stripe-webhook) ---
  const { error: insertError } = await admin.from('webhook_events').insert({
    provider: 'razorpay',
    event_id: eventId,
    event_type: eventType,
    payload,
  })
  if (insertError) {
    if (insertError.code === '23505') {
      const { data: prior } = await admin
        .from('webhook_events')
        .select('status')
        .eq('provider', 'razorpay')
        .eq('event_id', eventId)
        .single()
      if (prior?.status !== 'failed') return json({ received: true, duplicate: true })
      await admin
        .from('webhook_events')
        .update({ status: 'received', error: null })
        .eq('provider', 'razorpay')
        .eq('event_id', eventId)
    } else {
      console.error('webhook_events insert failed:', insertError.message)
      return json({ error: 'Storage failure' }, 500)
    }
  }

  const markEvent = async (status: 'processed' | 'failed', errMsg?: string) => {
    await admin
      .from('webhook_events')
      .update({ status, error: errMsg ?? null, processed_at: new Date().toISOString() })
      .eq('provider', 'razorpay')
      .eq('event_id', eventId)
  }

  try {
    switch (eventType) {
      case 'subscription.authenticated':
      case 'subscription.activated':
      case 'subscription.charged':
      case 'subscription.pending':
      case 'subscription.halted':
      case 'subscription.cancelled':
      case 'subscription.completed': {
        // Subscription events are the source of truth for recurring plans.
        // They are correlated to the server-created checkout ledger rather
        // than trusting a browser-supplied user id.
        // deno-lint-ignore no-explicit-any
        const subscription = (payload as any)?.payload?.subscription?.entity
        if (!subscription?.id) throw new Error(`${eventType} without subscription entity`)
        const { data: checkout } = await admin.from('razorpay_subscription_checkouts')
          .select('user_id,plan_id,status')
          .eq('razorpay_subscription_id', subscription.id)
          .maybeSingle()
        const userId = checkout?.user_id ?? subscription.notes?.user_id
        if (!userId) throw new Error(`subscription ${subscription.id} has no checkout owner`)
        const statusMap: Record<string, string> = {
          'subscription.authenticated': 'active',
          'subscription.activated': 'active',
          'subscription.charged': 'active',
          'subscription.pending': 'past_due',
          'subscription.halted': 'past_due',
          'subscription.cancelled': 'canceled',
          'subscription.completed': 'expired',
        }
        const localStatus = statusMap[eventType]
        const premium = !['canceled', 'expired'].includes(localStatus)
        const start = subscription.current_start ? new Date(subscription.current_start * 1000).toISOString() : null
        const end = subscription.current_end ? new Date(subscription.current_end * 1000).toISOString() : null
        const { data: localSub, error: subError } = await admin.from('subscriptions').upsert({
          user_id: userId,
          plan_id: checkout?.plan_id ?? null,
          plan_type: subscription.notes?.plan_type ?? 'monthly',
          is_premium: premium,
          provider: 'razorpay',
          razorpay_subscription_id: subscription.id,
          razorpay_plan_id: subscription.plan_id ?? null,
          status: localStatus,
          provider_status: subscription.status ?? eventType,
          current_period_start: start,
          current_period_end: end,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' }).select('id').single()
        if (subError) throw subError

        // Every recurring charge is a separate financial record. The unique
        // payment id and webhook event ledger make retries harmless.
        // deno-lint-ignore no-explicit-any
        const payment = (payload as any)?.payload?.payment?.entity
        if (payment?.id && localSub?.id) {
          const { error: paymentError } = await admin.from('payments').upsert({
            user_id: userId,
            subscription_id: localSub.id,
            provider: 'razorpay',
            razorpay_payment_id: payment.id,
            razorpay_subscription_id: subscription.id,
            amount: payment.amount ?? 0,
            currency: payment.currency ?? 'INR',
            status: payment.status ?? (eventType === 'subscription.charged' ? 'captured' : eventType),
            payment_method: payment.method ?? null,
          }, { onConflict: 'razorpay_payment_id', ignoreDuplicates: true })
          if (paymentError) throw paymentError
        }
        if (checkout) {
          const checkoutStatus = localStatus === 'active' ? 'active' : localStatus === 'canceled' ? 'cancelled' : localStatus === 'expired' ? 'completed' : 'failed'
          await admin.from('razorpay_subscription_checkouts').update({ status: checkoutStatus }).eq('razorpay_subscription_id', subscription.id)
        }
        break
      }

      case 'payment.captured': {
        // deno-lint-ignore no-explicit-any
        const payment = (payload as any)?.payload?.payment?.entity
        if (!payment?.id) throw new Error('payment.captured without payment entity')

        const userId: string | undefined = payment.notes?.user_id
        const planType: string = payment.notes?.plan_type ?? 'monthly'
        const expectedAmount = Number(payment.notes?.expected_amount ?? NaN)
        if (!userId) throw new Error(`payment ${payment.id} has no user_id in notes`)
        if (!['monthly', 'yearly', 'lifetime'].includes(planType)) {
          throw new Error(`payment ${payment.id} has invalid plan_type '${planType}'`)
        }
        if (Number.isFinite(expectedAmount) && payment.amount !== expectedAmount) {
          throw new Error(
            `payment ${payment.id} amount ${payment.amount} != expected ${expectedAmount}`
          )
        }

        // Replay guard: if this payment id already produced a captured
        // payments row, the subscription was already extended (either by
        // verify-razorpay-payment or by a previous webhook) — record nothing.
        const { data: existingPayment } = await admin
          .from('payments')
          .select('id')
          .eq('razorpay_payment_id', payment.id)
          .maybeSingle()
        if (existingPayment) {
          await markEvent('processed')
          return json({ received: true, alreadyApplied: true })
        }

        const now = new Date()
        const periodEnd = new Date(now)
        if (planType === 'yearly') periodEnd.setFullYear(periodEnd.getFullYear() + 1)
        else if (planType === 'lifetime') periodEnd.setFullYear(periodEnd.getFullYear() + 100)
        else periodEnd.setMonth(periodEnd.getMonth() + 1)

        const { error: subError } = await admin.from('subscriptions').upsert(
          {
            user_id: userId,
            is_premium: true,
            plan_type: planType,
            provider: 'razorpay',
            razorpay_customer_id: payment.customer_id ?? null,
            razorpay_payment_id: payment.id,
            status: 'active',
            current_period_start: now.toISOString(),
            current_period_end: periodEnd.toISOString(),
            updated_at: now.toISOString(),
          },
          { onConflict: 'user_id' }
        )
        if (subError) throw subError

        const { error: payError } = await admin.from('payments').upsert(
          {
            user_id: userId,
            provider: 'razorpay',
            razorpay_payment_id: payment.id,
            razorpay_order_id: payment.order_id ?? null,
            amount: payment.amount,
            currency: payment.currency ?? 'INR',
            status: payment.status ?? 'captured',
            payment_method: payment.method ?? null,
          },
          { onConflict: 'razorpay_payment_id', ignoreDuplicates: true }
        )
        if (payError) throw payError

        const notifyResult = await notifyUser(admin, {
          user_id: userId,
          type: 'billing_payment_success',
          title: 'Payment successful',
          body: `Your ${planType} plan is now active. Welcome to MakeCV Pro!`,
          action_url: '/account',
          send_email: true,
        })
        if (!notifyResult.success) console.error('notification failed:', notifyResult.error)
        break
      }

      case 'payment.failed': {
        // deno-lint-ignore no-explicit-any
        const payment = (payload as any)?.payload?.payment?.entity
        const userId: string | undefined = payment?.notes?.user_id
        if (userId) {
          const notifyResult = await notifyUser(admin, {
            user_id: userId,
            type: 'billing_payment_failed',
            title: 'Payment failed',
            body: 'Your payment could not be processed. No amount was charged — please try again.',
            action_url: '/pricing',
            send_email: true,
          })
          if (!notifyResult.success) console.error('notification failed:', notifyResult.error)
        }
        break
      }

      default:
        // Unhandled events are recorded and acknowledged.
        break
    }

    await markEvent('processed')
    return json({ received: true })
  } catch (err) {
    console.error(`razorpay-webhook ${eventType} failed:`, err)
    await markEvent('failed', err instanceof Error ? err.message : String(err))
    return json({ error: 'Processing failed' }, 500)
  }
})
