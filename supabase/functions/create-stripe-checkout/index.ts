// create-stripe-checkout
// Creates a Stripe Checkout Session for a Resume Builder plan.
// Pricing is read from subscription_plans (server-side source of truth) —
// the client only ever sends a planType slug, never an amount.
//
// Request:  POST { planType: 'monthly' | 'yearly' | 'lifetime', successUrl?, cancelUrl? }
// Response: { url: string }  (redirect the browser to this URL)
//
// Secrets: STRIPE_SECRET_KEY, SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
// Deploy:  supabase functions deploy create-stripe-checkout

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.25.0?target=denonext'
import { checkRateLimit, rateLimitResponse } from '../_shared/rateLimiter.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60_000;

const RECURRING_INTERVALS: Record<string, 'month' | 'year'> = {
  month: 'month',
  year: 'year',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeKey) return json({ error: 'Stripe is not configured' }, 500)

    // --- Authenticate caller ---
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return json({ error: 'Unauthorized' }, 401)

    const supabaseAnon = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )
    const token = authHeader.replace('Bearer ', '')
    const { data: userData, error: userError } = await supabaseAnon.auth.getUser(token)
    if (userError || !userData?.user) return json({ error: 'Unauthorized' }, 401)
    const user = userData.user

    if (!checkRateLimit(`stripe-checkout:${user.id}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS)) {
      return rateLimitResponse(corsHeaders)
    }

    // --- Validate plan against the DB (never trust client amounts) ---
    const { planType, successUrl, cancelUrl } = await req.json()
    if (typeof planType !== 'string') return json({ error: 'Invalid planType' }, 400)

    const admin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    const { data: plan, error: planError } = await admin
      .from('subscription_plans')
      .select('*')
      .eq('product', 'resume')
      .eq('slug', planType)
      .eq('is_active', true)
      .single()
    if (planError || !plan || plan.billing_interval === 'free' || plan.price_usd <= 0) {
      return json({ error: 'Invalid or unavailable plan' }, 400)
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' })

    // --- Reuse the Stripe customer if we have one ---
    const { data: existingSub } = await admin
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .maybeSingle()

    let customerId = existingSub?.stripe_customer_id ?? undefined
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        metadata: { user_id: user.id },
      })
      customerId = customer.id
    }

    const origin = req.headers.get('origin') ?? Deno.env.get('SITE_URL') ?? ''
    const isRecurring = plan.billing_interval in RECURRING_INTERVALS

    // Prefer a pre-created Stripe Price; fall back to inline price_data.
    const lineItem = plan.stripe_price_id
      ? { price: plan.stripe_price_id, quantity: 1 }
      : {
          price_data: {
            currency: 'usd',
            unit_amount: plan.price_usd,
            product_data: { name: `FlowCreate ${plan.name}` },
            ...(isRecurring
              ? { recurring: { interval: RECURRING_INTERVALS[plan.billing_interval] } }
              : {}),
          },
          quantity: 1,
        }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: isRecurring ? 'subscription' : 'payment',
      line_items: [lineItem],
      client_reference_id: user.id,
      metadata: { user_id: user.id, plan_slug: plan.slug },
      ...(isRecurring
        ? { subscription_data: { metadata: { user_id: user.id, plan_slug: plan.slug } } }
        : { payment_intent_data: { metadata: { user_id: user.id, plan_slug: plan.slug } } }),
      success_url: successUrl ?? `${origin}/account?checkout=success`,
      cancel_url: cancelUrl ?? `${origin}/pricing?checkout=cancelled`,
    })

    return json({ url: session.url })
  } catch (error) {
    console.error('create-stripe-checkout error:', error)
    return json({ error: 'Failed to create checkout session' }, 500)
  }
})
