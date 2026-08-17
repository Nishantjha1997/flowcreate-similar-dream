import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';
import { checkRateLimit, rateLimitResponse } from '../_shared/rateLimiter.ts';
import { getPaymentGatewayKeys } from '../_shared/paymentKeyManager.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
});

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const token = req.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');
    if (!token) return json({ error: 'Unauthorized' }, 401);
    const authClient = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY') ?? '');
    const { data: userData, error: userError } = await authClient.auth.getUser(token);
    const user = userData.user;
    if (userError || !user) return json({ error: 'Unauthorized' }, 401);

    const rl = await checkRateLimit(`razorpay-subscription:${user.id}`, 5, 60_000);
    if (!rl.allowed) return rateLimitResponse(corsHeaders, rl.resetAt);

    const body = await req.json().catch(() => ({}));
    const planType = body?.planType;
    const currency = body?.currency === 'USD' ? 'USD' : 'INR';
    if (planType !== 'monthly' && planType !== 'yearly') return json({ error: 'Only monthly and yearly plans are recurring subscriptions' }, 400);

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    const { data: plan, error: planError } = await admin
      .from('subscription_plans')
      .select('id,name,slug,price_inr,price_usd,billing_interval,razorpay_plan_id,razorpay_plan_id_usd')
      .eq('product', 'resume').eq('slug', planType).eq('is_active', true).maybeSingle();
    if (planError || !plan) return json({ error: 'Plan is not configured' }, 500);

    const envPlanKey = `RAZORPAY_${planType.toUpperCase()}_PLAN_ID_${currency}`;
    const razorpayPlanId = (currency === 'USD' ? plan.razorpay_plan_id_usd : plan.razorpay_plan_id)
      ?? Deno.env.get(envPlanKey);
    const amount = currency === 'USD' ? plan.price_usd : plan.price_inr;
    if (!razorpayPlanId || !amount) {
      return json({ error: `Razorpay ${currency} plan is not configured yet. Add the plan ID in the server catalog.` }, 503);
    }
    const { keyId, keySecret } = await getPaymentGatewayKeys(SUPABASE_URL, SERVICE_ROLE_KEY, 'razorpay');
    if (!keyId || !keySecret) return json({ error: 'Payment service not configured' }, 503);

    const response = await fetch('https://api.razorpay.com/v1/subscriptions', {
      method: 'POST',
      headers: { Authorization: `Basic ${btoa(`${keyId}:${keySecret}`)}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        plan_id: razorpayPlanId,
        total_count: planType === 'monthly' ? 120 : 10,
        customer_notify: 1,
        notes: { user_id: user.id, plan_type: planType, currency, makecv_plan_id: plan.id },
      }),
    });
    if (!response.ok) {
      console.error('Razorpay subscription create failed', response.status, await response.text());
      return json({ error: 'Failed to create subscription' }, 502);
    }
    const subscription = await response.json();
    const { error: insertError } = await admin.from('razorpay_subscription_checkouts').insert({
      user_id: user.id, plan_id: plan.id, razorpay_subscription_id: subscription.id,
      currency, amount, status: 'created',
    });
    if (insertError) {
      console.error('Subscription checkout ledger insert failed', insertError);
      return json({ error: 'Failed to store subscription checkout' }, 500);
    }
    return json({
      subscription_id: subscription.id, key_id: keyId, currency, amount,
      plan_type: planType, name: plan.name,
    });
  } catch (error) {
    console.error('create-razorpay-subscription failed', error);
    return json({ error: 'Internal server error' }, 500);
  }
});
