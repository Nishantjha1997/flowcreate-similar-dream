-- Add INSERT policy for subscriptions table to allow users to create their own subscriptions
-- This is needed for users to create subscriptions during payment processing
CREATE POLICY "subscriptions_user_insert" 
ON public.subscriptions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Add a comment explaining the policy
COMMENT ON POLICY "subscriptions_user_insert" ON public.subscriptions IS 
'Allows users to insert their own subscription records during payment processing';