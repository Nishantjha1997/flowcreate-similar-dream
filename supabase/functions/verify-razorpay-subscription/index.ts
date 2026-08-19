import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.0';
import { getPaymentGatewayKeys } from '../_shared/paymentKeyManager.ts';
import { notifyUser } from '../_shared/notify.ts';

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

function validId(value: unknown, prefix: string): value is string {
  return typeof value === 'string' && new RegExp(`^${prefix}[A-Za-z0-9_]+$`).test(value);
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function hmacHex(secret: string, value: string) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value));
  return Array.from(new Uint8Array(signature)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const token = req.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');
    if (!token) return json({ error: 'Unauthorized' }, 401);
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    const { data: userData, error: userError } = await admin.auth.getUser(token);
    const user = userData.user;
    if (userError || !user) return json({ error: 'Unauthorized' }, 401);
    const body = await req.json().catch(() => ({}));
    const paymentId = body?.razorpay_payment_id;
    const subscriptionId = body?.razorpay_subscription_id;
    const signature = body?.razorpay_signature;
    if (!validId(paymentId, 'pay_') || !validId(subscriptionId, 'sub_') || typeof signature !== 'string' || !/^[a-f0-9]{64}$/i.test(signature)) {
      return json({ error: 'Invalid subscription verification payload' }, 400);
    }

    const { data: checkout } = await admin.from('razorpay_subscription_checkouts')
      .select('*, subscription_plans(slug,price_inr,price_usd,billing_interval)')
      .eq('razorpay_subscription_id', subscriptionId).eq('user_id', user.id).maybeSingle();
    if (!checkout) return json({ error: 'Subscription checkout is not owned by this account' }, 403);
    const { keyId, keySecret } = await getPaymentGatewayKeys(SUPABASE_URL, SERVICE_ROLE_KEY, 'razorpay');
    if (!keyId || !keySecret) return json({ error: 'Payment service not configured' }, 503);
    const expected = await hmacHex(keySecret, `${paymentId}|${subscriptionId}`);
    if (!timingSafeEqual(expected.toLowerCase(), signature.toLowerCase())) return json({ error: 'Payment verification failed' }, 400);

    const auth = `Basic ${btoa(`${keyId}:${keySecret}`)}`;
    const [subscriptionResponse, paymentResponse] = await Promise.all([
      fetch(`https://api.razorpay.com/v1/subscriptions/${subscriptionId}`, { headers: { Authorization: auth } }),
      fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, { headers: { Authorization: auth } }),
    ]);
    if (!subscriptionResponse.ok || !paymentResponse.ok) return json({ error: 'Unable to verify payment with Razorpay' }, 502);
    const remoteSubscription = await subscriptionResponse.json();
    const payment = await paymentResponse.json();
    if (payment.status !== 'captured' && payment.status !== 'authorized') return json({ error: 'Subscription payment is not authorized' }, 400);
    if (remoteSubscription.id !== subscriptionId) return json({ error: 'Subscription mismatch' }, 400);

    const planType = checkout.subscription_plans?.slug;
    if (planType !== 'monthly' && planType !== 'yearly') {
      return json({ error: 'Subscription plan is invalid' }, 400);
    }
    if (Number(payment.amount) !== Number(checkout.amount) || payment.currency !== checkout.currency) {
      return json({ error: 'Subscription amount does not match the selected plan' }, 400);
    }
    const now = new Date();
    const start = remoteSubscription.current_start ? new Date(remoteSubscription.current_start * 1000) : now;
    const end = remoteSubscription.current_end
      ? new Date(remoteSubscription.current_end * 1000)
      : new Date(now.getTime() + (planType === 'yearly' ? 365 : 30) * 86400000);
    // Razorpay spells this lifecycle state `cancelled`; keep the local
    // provider-neutral status as `canceled` for compatibility with Stripe and
    // the existing subscriptions table values.
    const allowedStatuses = new Set(['active', 'trialing', 'past_due', 'canceled', 'cancelled', 'expired']);
    const normalizedProviderStatus = remoteSubscription.status === 'cancelled' ? 'canceled' : remoteSubscription.status;
    const localStatus = allowedStatuses.has(remoteSubscription.status) ? normalizedProviderStatus : 'active';
    const isPremium = !['canceled', 'expired'].includes(localStatus);
    const { data: localSubscription, error: subscriptionError } = await admin.from('subscriptions').upsert({
      user_id: user.id, is_premium: isPremium, plan_type: planType, plan_id: checkout.plan_id,
      provider: 'razorpay', razorpay_customer_id: remoteSubscription.customer_id ?? null,
      razorpay_payment_id: paymentId, razorpay_subscription_id: subscriptionId, razorpay_plan_id: remoteSubscription.plan_id ?? null,
      status: localStatus,
      provider_status: remoteSubscription.status, current_period_start: start.toISOString(),
      current_period_end: end.toISOString(), updated_at: now.toISOString(),
    }, { onConflict: 'user_id' }).select('id').single();
    if (subscriptionError || !localSubscription) throw subscriptionError ?? new Error('Subscription update failed');

    const { error: paymentError } = await admin.from('payments').upsert({
      user_id: user.id, subscription_id: localSubscription.id, provider: 'razorpay',
      razorpay_payment_id: paymentId, razorpay_subscription_id: subscriptionId,
      amount: payment.amount ?? checkout.amount, currency: payment.currency ?? checkout.currency,
      status: payment.status, payment_method: payment.method ?? null,
    }, { onConflict: 'razorpay_payment_id' });
    if (paymentError) throw paymentError;
    await admin.from('razorpay_subscription_checkouts')
      .update({ status: isPremium ? 'active' : 'cancelled' })
      .eq('id', checkout.id);
    if (isPremium) {
      const notification = await notifyUser(admin, {
        user_id: user.id, type: 'billing_payment_success', title: 'Subscription activated',
        body: `Your MakeCV ${planType} subscription is active.`, action_url: '/account', send_email: true,
      });
      if (!notification.success) console.error('subscription notification failed', notification.error);
    }
    return json({ success: true, subscription_id: subscriptionId, status: localStatus, is_premium: isPremium });
  } catch (error) {
    console.error('verify-razorpay-subscription failed', error);
    return json({ error: 'Internal server error' }, 500);
  }
});
