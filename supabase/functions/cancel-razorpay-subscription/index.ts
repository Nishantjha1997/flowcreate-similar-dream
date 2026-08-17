import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.0';
import { getPaymentGatewayKeys } from '../_shared/paymentKeyManager.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const token = req.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');
    if (!token) return json({ error: 'Unauthorized' }, 401);
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    const { data: userData } = await admin.auth.getUser(token);
    if (!userData.user) return json({ error: 'Unauthorized' }, 401);
    const body = await req.json().catch(() => ({}));
    const cancelAtCycleEnd = body?.cancel_at_cycle_end !== false;
    const { data: subscription } = await admin.from('subscriptions').select('id,razorpay_subscription_id,status').eq('user_id', userData.user.id).maybeSingle();
    if (!subscription?.razorpay_subscription_id) return json({ error: 'No Razorpay subscription found' }, 404);
    const { keyId, keySecret } = await getPaymentGatewayKeys(SUPABASE_URL, SERVICE_ROLE_KEY, 'razorpay');
    if (!keyId || !keySecret) return json({ error: 'Payment service not configured' }, 503);
    const response = await fetch(`https://api.razorpay.com/v1/subscriptions/${subscription.razorpay_subscription_id}/cancel`, {
      method: 'POST', headers: { Authorization: `Basic ${btoa(`${keyId}:${keySecret}`)}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ cancel_at_cycle_end: cancelAtCycleEnd }),
    });
    if (!response.ok) return json({ error: 'Razorpay could not cancel the subscription' }, 502);
    const now = new Date().toISOString();
    const { error: updateError } = await admin.from('subscriptions').update({
      cancel_at_period_end: cancelAtCycleEnd,
      cancellation_requested_at: now,
      provider_status: cancelAtCycleEnd ? 'active' : 'cancelled',
      status: cancelAtCycleEnd ? 'active' : 'canceled',
      updated_at: now,
    }).eq('id', subscription.id);
    if (updateError) {
      console.error('Local subscription cancellation update failed', updateError);
      return json({ error: 'Subscription was cancelled remotely but local status could not be updated' }, 500);
    }
    return json({ success: true, cancel_at_cycle_end: cancelAtCycleEnd });
  } catch (error) {
    console.error('cancel-razorpay-subscription failed', error);
    return json({ error: 'Internal server error' }, 500);
  }
});
