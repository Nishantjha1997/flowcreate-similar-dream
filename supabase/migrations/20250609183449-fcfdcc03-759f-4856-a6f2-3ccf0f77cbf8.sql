
-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can insert their own subscription" ON public.subscriptions;

-- First, let's ensure the admin account has premium access
-- Insert or update the subscription for nishantjha31@gmail.com
INSERT INTO public.subscriptions (user_id, is_premium, created_at, updated_at)
SELECT 
  id,
  true,
  now(),
  now()
FROM auth.users 
WHERE email = 'nishantjha31@gmail.com'
ON CONFLICT (user_id) 
DO UPDATE SET 
  is_premium = true,
  updated_at = now();

-- Create RLS policies for subscriptions table to allow admins to manage all subscriptions
CREATE POLICY "Admins can view all subscriptions" 
  ON public.subscriptions 
  FOR SELECT 
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all subscriptions" 
  ON public.subscriptions 
  FOR UPDATE 
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert all subscriptions" 
  ON public.subscriptions 
  FOR INSERT 
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Allow users to view their own subscription
CREATE POLICY "Users can view their own subscription" 
  ON public.subscriptions 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Allow users to insert their own subscription
CREATE POLICY "Users can insert their own subscription" 
  ON public.subscriptions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Enable RLS on subscriptions table
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
