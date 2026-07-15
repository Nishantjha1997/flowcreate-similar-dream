// stripe-webhook
// Webhook-driven subscription lifecycle for Stripe.
//
// Verifies the Stripe signature over the RAW request body, records the event
// in webhook_events for idempotency (duplicate deliveries return 200 and do
// nothing), then updates subscriptions / payments / invoices / notifications.
//
// Handled events:
//   checkout.session.completed   -> activate plan (subscription or lifetime)
//   customer.subscription.updated-> status/period sync (incl. cancel_at_period_end)
//   customer.subscription.deleted-> downgrade to free
//   invoice.paid                 -> renewal: extend period, record payment+invoice
//   invoice.payment_failed       -> mark past_due, notify user
//
// Secrets: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
// Deploy:  supabase functions deploy stripe-webhook --no-verify-jwt
//          (Stripe cannot send a Supabase JWT; auth is the signature check.)
// Register the endpoint in Stripe Dashboard -> Developers -> Webhooks:
//   https://<project-ref>.functions.supabase.co/stripe-webhook

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.25.0?target=denonext'

const cryptoProvider = Stripe.createSubtleCryptoProvider()

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

function adminClient(): SupabaseClient {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )
}

async function notify(
  admin: SupabaseClient,
  userId: string,
  type: string,
  title: string,
  body: string
) {
  const { error } = await admin.from('notifications').insert({
    user_id: userId,
    type,
    title,
    body,
  })
  if (error) console.error('notification insert failed:', error.message)
}

async function findUserBySubscription(
  admin: SupabaseClient,
  stripeSubscriptionId: string,
  stripeCustomerId?: string | null
): Promise<string | null> {
  const { data } = await admin
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_subscription_id', stripeSubscriptionId)
    .maybeSingle()
  if (data?.user_id) return data.user_id
  if (stripeCustomerId) {
    const { data: byCustomer } = await admin
      .from('subscriptions')
      .select('user_id')
      .eq('stripe_customer_id', stripeCustomerId)
      .maybeSingle()
    if (byCustomer?.user_id) return byCustomer.user_id
  }
  return null
}

serve(async (req) => {
  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
  if (!stripeKey || !webhookSecret) return json({ error: 'Not configured' }, 500)

  const signature = req.headers.get('stripe-signature')
  if (!signature) return json({ error: 'Missing signature' }, 400)

  const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' })
  const rawBody = await req.text()

  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(
      rawBody,
      signature,
      webhookSecret,
      undefined,
      cryptoProvider
    )
  } catch (err) {
    console.error('Signature verification failed:', err)
    return json({ error: 'Invalid signature' }, 400)
  }

  const admin = adminClient()

  // --- Idempotency: successful deliveries are processed exactly once.
  // Duplicates of processed/in-flight events return 200 with no effects;
  // retries of FAILED events are allowed through to re-process.
  const { error: insertError } = await admin.from('webhook_events').insert({
    provider: 'stripe',
    event_id: event.id,
    event_type: event.type,
    payload: event as unknown as Record<string, unknown>,
  })
  if (insertError) {
    if (insertError.code === '23505') {
      const { data: prior } = await admin
        .from('webhook_events')
        .select('status')
        .eq('provider', 'stripe')
        .eq('event_id', event.id)
        .single()
      if (prior?.status !== 'failed') {
        return json({ received: true, duplicate: true })
      }
      await admin
        .from('webhook_events')
        .update({ status: 'received', error: null })
        .eq('provider', 'stripe')
        .eq('event_id', event.id)
    } else {
      console.error('webhook_events insert failed:', insertError.message)
      return json({ error: 'Storage failure' }, 500)
    }
  }

  const markEvent = async (status: 'processed' | 'failed', errMsg?: string) => {
    await admin
      .from('webhook_events')
      .update({ status, error: errMsg ?? null, processed_at: new Date().toISOString() })
      .eq('provider', 'stripe')
      .eq('event_id', event.id)
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.user_id ?? session.client_reference_id
        const planSlug = session.metadata?.plan_slug ?? 'monthly'
        if (!userId) throw new Error('checkout.session.completed without user_id metadata')

        const isLifetime = session.mode === 'payment'
        const now = new Date()
        let periodEnd: Date | null = null
        if (!isLifetime) {
          periodEnd = new Date(now)
          if (planSlug === 'yearly') periodEnd.setFullYear(periodEnd.getFullYear() + 1)
          else periodEnd.setMonth(periodEnd.getMonth() + 1)
        }

        const { error } = await admin.from('subscriptions').upsert(
          {
            user_id: userId,
            is_premium: true,
            plan_type: planSlug,
            provider: 'stripe',
            stripe_customer_id: (session.customer as string) ?? null,
            stripe_subscription_id: (session.subscription as string) ?? null,
            status: 'active',
            cancel_at_period_end: false,
            current_period_start: now.toISOString(),
            current_period_end: periodEnd?.toISOString() ?? null,
            updated_at: now.toISOString(),
          },
          { onConflict: 'user_id' }
        )
        if (error) throw error

        // Record the payment only for one-time (lifetime) purchases here;
        // subscription charges arrive via invoice.paid and are recorded there
        // (recording both would duplicate the first month's charge).
        if (isLifetime && session.amount_total != null) {
          const { error: payError } = await admin.from('payments').upsert(
            {
              user_id: userId,
              provider: 'stripe',
              stripe_payment_intent_id: (session.payment_intent as string) ?? null,
              stripe_checkout_session_id: session.id,
              amount: session.amount_total,
              currency: (session.currency ?? 'usd').toUpperCase(),
              status: 'succeeded',
              payment_method: 'card',
            },
            { onConflict: 'stripe_payment_intent_id', ignoreDuplicates: true }
          )
          if (payError) console.error('payment record failed:', payError.message)
        }

        await notify(
          admin, userId, 'billing_payment_success',
          'Payment successful',
          `Your ${planSlug} plan is now active. Welcome to FlowCreate Pro!`
        )
        break
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const userId =
          sub.metadata?.user_id ??
          (await findUserBySubscription(admin, sub.id, sub.customer as string))
        if (!userId) throw new Error(`No local subscription for ${sub.id}`)

        const statusMap: Record<string, { status: string; is_premium: boolean }> = {
          active: { status: 'active', is_premium: true },
          trialing: { status: 'trialing', is_premium: true },
          past_due: { status: 'past_due', is_premium: true }, // grace; cron expires later
          unpaid: { status: 'canceled', is_premium: false },
          canceled: { status: 'canceled', is_premium: false },
          incomplete_expired: { status: 'canceled', is_premium: false },
        }
        const mapped = statusMap[sub.status] ?? { status: 'active', is_premium: true }

        const { error } = await admin
          .from('subscriptions')
          .update({
            ...mapped,
            stripe_subscription_id: sub.id,
            cancel_at_period_end: sub.cancel_at_period_end,
            current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
            current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId)
        if (error) throw error
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const userId =
          sub.metadata?.user_id ??
          (await findUserBySubscription(admin, sub.id, sub.customer as string))
        if (!userId) throw new Error(`No local subscription for ${sub.id}`)

        const { error } = await admin
          .from('subscriptions')
          .update({
            is_premium: false,
            status: 'canceled',
            cancel_at_period_end: false,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId)
        if (error) throw error

        await notify(
          admin, userId, 'billing_subscription_canceled',
          'Subscription ended',
          'Your Pro subscription has ended. Your resumes are safe — resubscribe anytime.'
        )
        break
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice
        const subId = invoice.subscription as string | null
        if (!subId) break // one-time payment invoices handled at checkout
        const userId = await findUserBySubscription(admin, subId, invoice.customer as string)
        if (!userId) throw new Error(`No local subscription for invoice ${invoice.id}`)

        const periodEnd = invoice.lines?.data?.[0]?.period?.end
        const { error } = await admin
          .from('subscriptions')
          .update({
            is_premium: true,
            status: 'active',
            current_period_end: periodEnd
              ? new Date(periodEnd * 1000).toISOString()
              : null,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId)
        if (error) throw error

        const { error: payError } = await admin.from('payments').upsert(
          {
            user_id: userId,
            provider: 'stripe',
            stripe_payment_intent_id: (invoice.payment_intent as string) ?? null,
            amount: invoice.amount_paid,
            currency: (invoice.currency ?? 'usd').toUpperCase(),
            status: 'succeeded',
            payment_method: 'card',
          },
          { onConflict: 'stripe_payment_intent_id', ignoreDuplicates: true }
        )
        if (payError) console.error('payment record failed:', payError.message)

        const { error: invError } = await admin.from('invoices').insert({
          user_id: userId,
          amount: invoice.subtotal ?? invoice.amount_paid,
          tax_amount: invoice.tax ?? 0,
          total_amount: invoice.amount_paid,
          currency: (invoice.currency ?? 'usd').toUpperCase(),
          status: 'paid',
          pdf_url: invoice.invoice_pdf ?? null,
          paid_at: new Date().toISOString(),
        })
        if (invError) console.error('invoice record failed:', invError.message)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const subId = invoice.subscription as string | null
        if (!subId) break
        const userId = await findUserBySubscription(admin, subId, invoice.customer as string)
        if (!userId) break

        const { error } = await admin
          .from('subscriptions')
          .update({ status: 'past_due', updated_at: new Date().toISOString() })
          .eq('user_id', userId)
        if (error) throw error

        await notify(
          admin, userId, 'billing_payment_failed',
          'Payment failed',
          'We could not process your subscription payment. Please update your payment method to keep Pro access.'
        )
        break
      }

      default:
        // Unhandled event types are recorded and acknowledged.
        break
    }

    await markEvent('processed')
    return json({ received: true })
  } catch (err) {
    console.error(`stripe-webhook ${event.type} failed:`, err)
    await markEvent('failed', err instanceof Error ? err.message : String(err))
    // Non-2xx so Stripe retries; retries of 'failed' events re-process (see
    // idempotency block above).
    return json({ error: 'Processing failed' }, 500)
  }
})
