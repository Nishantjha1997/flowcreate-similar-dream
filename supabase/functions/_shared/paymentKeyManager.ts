import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export interface PaymentGatewayKeys {
  keyId: string | null;
  keySecret: string | null;
  webhookSecret: string | null;
  isLive: boolean;
}

// Mirrors _shared/aiKeyManager.ts: checks the admin-manageable
// payment_gateway_keys table first (added via Admin > Payments), falling
// back to env-var secrets (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET /
// RAZORPAY_WEBHOOK_SECRET, or the Stripe equivalents) when no active row
// exists for the provider yet.
export async function getPaymentGatewayKeys(
  supabaseUrl: string,
  serviceRoleKey: string,
  provider: 'razorpay' | 'stripe'
): Promise<PaymentGatewayKeys> {
  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { data, error } = await supabase
      .from('payment_gateway_keys')
      .select('key_id, key_secret, webhook_secret, is_live')
      .eq('provider', provider)
      .eq('is_active', true)
      .maybeSingle();

    if (!error && data && data.key_secret) {
      await supabase
        .from('payment_gateway_keys')
        .update({ last_used: new Date().toISOString() })
        .eq('provider', provider);

      return {
        keyId: data.key_id,
        keySecret: data.key_secret,
        webhookSecret: data.webhook_secret,
        isLive: data.is_live,
      };
    }
  } catch (error) {
    console.error(`[PaymentKeyManager] Error reading DB key for ${provider}:`, error);
  }

  const envPrefix = provider === 'razorpay' ? 'RAZORPAY' : 'STRIPE';
  return {
    keyId: Deno.env.get(`${envPrefix}_KEY_ID`) ?? null,
    keySecret: Deno.env.get(`${envPrefix}_KEY_SECRET`) ?? Deno.env.get('STRIPE_SECRET_KEY') ?? null,
    webhookSecret: Deno.env.get(`${envPrefix}_WEBHOOK_SECRET`) ?? null,
    isLive: false,
  };
}
