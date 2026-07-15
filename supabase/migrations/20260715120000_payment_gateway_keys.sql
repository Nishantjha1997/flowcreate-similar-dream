-- Admin-manageable payment gateway credentials, mirroring the existing
-- ai_api_keys pattern. Lets Razorpay/Stripe keys be added via the Admin
-- dashboard instead of requiring `supabase secrets set` + a redeploy.
-- Edge functions check this table first and fall back to env vars if no
-- active row exists for a provider (see supabase/functions/_shared/paymentKeyManager.ts).

CREATE TABLE public.payment_gateway_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT UNIQUE NOT NULL CHECK (provider IN ('razorpay', 'stripe')),
  key_id TEXT,        -- Razorpay key_id, or Stripe publishable key
  key_secret TEXT,    -- Razorpay key_secret, or Stripe secret key
  webhook_secret TEXT,
  is_live BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_used TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_gateway_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can manage payment gateway keys" ON public.payment_gateway_keys
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TRIGGER update_payment_gateway_keys_updated_at
  BEFORE UPDATE ON public.payment_gateway_keys
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
