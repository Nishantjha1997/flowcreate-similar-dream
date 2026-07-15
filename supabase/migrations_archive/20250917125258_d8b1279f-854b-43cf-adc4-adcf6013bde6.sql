-- Add INSERT policy for payments table to allow admin/service role to create payment records
-- This is needed for the payment verification edge function to work properly
CREATE POLICY "payments_admin_insert" 
ON public.payments 
FOR INSERT 
WITH CHECK (is_admin());

-- Add a comment explaining the policy
COMMENT ON POLICY "payments_admin_insert" ON public.payments IS 
'Allows admins and service role (used by edge functions) to insert payment records during payment processing';