-- Harden payments table policies explicitly without enabling user writes
-- Ensure RLS is enabled (idempotent)
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Clean up existing admin update/delete policies if any to avoid duplicates
DROP POLICY IF EXISTS "payments_admin_update" ON public.payments;
DROP POLICY IF EXISTS "payments_admin_delete" ON public.payments;

-- Explicit admin-only UPDATE policy
CREATE POLICY "payments_admin_update"
  ON public.payments
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Explicit admin-only DELETE policy
CREATE POLICY "payments_admin_delete"
  ON public.payments
  FOR DELETE
  TO authenticated
  USING (is_admin());

-- Note: We intentionally do NOT create INSERT policies for clients.
-- Inserts/updates should be performed by trusted server context (edge functions with service role),
-- and regular users keep read-only access to their own records via existing SELECT policies.