-- Security hardening migration
-- 1) Idempotent unique index for payments.razorpay_payment_id to prevent duplicate recordings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'uniq_payments_razorpay_payment_id'
  ) THEN
    CREATE UNIQUE INDEX uniq_payments_razorpay_payment_id ON public.payments (razorpay_payment_id);
  END IF;
END$$;

-- 2) Remove recursive/overlapping user_roles policy that can cause recursion
DROP POLICY IF EXISTS "Admins and role owners can SELECT" ON public.user_roles;
