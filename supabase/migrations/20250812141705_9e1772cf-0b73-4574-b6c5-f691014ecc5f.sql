
-- 1) Harden subscriptions RLS: remove user-write policies and duplicates, keep only owner read and admin write

-- Drop existing permissive/duplicate policies on subscriptions
DROP POLICY IF EXISTS "Admins can insert all subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Admins can manage all subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Admins can update all subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Owner or Admin can DELETE" ON public.subscriptions;
DROP POLICY IF EXISTS "Owner or Admin can INSERT" ON public.subscriptions;
DROP POLICY IF EXISTS "Owner or Admin can SELECT" ON public.subscriptions;
DROP POLICY IF EXISTS "Owner or Admin can UPDATE" ON public.subscriptions;
DROP POLICY IF EXISTS "Owner or Admin can delete subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Owner or Admin can insert subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Owner or Admin can select subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Owner or Admin can update subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can delete their own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can insert their own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can manage their own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.subscriptions;

-- Ensure RLS is enabled
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Minimal, safe policies
CREATE POLICY "subscriptions_owner_select"
  ON public.subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "subscriptions_admin_select"
  ON public.subscriptions
  FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "subscriptions_admin_insert"
  ON public.subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "subscriptions_admin_update"
  ON public.subscriptions
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "subscriptions_admin_delete"
  ON public.subscriptions
  FOR DELETE
  TO authenticated
  USING (is_admin());



-- 2) Harden payments RLS: remove permissive ALL policy; allow only owner/admin SELECT

-- Drop permissive policy
DROP POLICY IF EXISTS "Service role can manage payments" ON public.payments;

-- Ensure RLS is enabled
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Keep/ensure safe read-only policies
DROP POLICY IF EXISTS "Users can view their own payments" ON public.payments;

CREATE POLICY "payments_owner_select"
  ON public.payments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "payments_admin_select"
  ON public.payments
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- Note: No INSERT/UPDATE/DELETE policies for clients.
-- Edge functions using the service role bypass RLS to write payments.



-- 3) Set search_path = public on SECURITY DEFINER functions to avoid search path hijacking

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$function$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$function$;

CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT role FROM public.user_roles
  WHERE user_roles.user_id = get_user_role.user_id
  LIMIT 1;
$function$;

CREATE OR REPLACE FUNCTION public.update_profiles_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.calculate_profile_completeness(profile_data jsonb)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  total_fields INTEGER := 15;
  completed_fields INTEGER := 0;
BEGIN
  IF profile_data->>'full_name' IS NOT NULL AND profile_data->>'full_name' != '' THEN
    completed_fields := completed_fields + 1;
  END IF;
  IF profile_data->>'email' IS NOT NULL AND profile_data->>'email' != '' THEN
    completed_fields := completed_fields + 1;
  END IF;
  IF profile_data->>'phone' IS NOT NULL AND profile_data->>'phone' != '' THEN
    completed_fields := completed_fields + 1;
  END IF;
  IF profile_data->>'professional_summary' IS NOT NULL AND profile_data->>'professional_summary' != '' THEN
    completed_fields := completed_fields + 1;
  END IF;
  IF jsonb_array_length(COALESCE(profile_data->'technical_skills', '[]'::jsonb)) > 0 THEN
    completed_fields := completed_fields + 1;
  END IF;
  IF jsonb_array_length(COALESCE(profile_data->'work_experience', '[]'::jsonb)) > 0 THEN
    completed_fields := completed_fields + 1;
  END IF;
  IF jsonb_array_length(COALESCE(profile_data->'education', '[]'::jsonb)) > 0 THEN
    completed_fields := completed_fields + 1;
  END IF;
  RETURN (completed_fields * 100 / total_fields);
END;
$function$;

CREATE OR REPLACE FUNCTION public.sync_resume_to_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  resume_data JSONB;
  profile_exists BOOLEAN;
BEGIN
  resume_data := NEW.resume_data;
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE user_id = NEW.user_id) INTO profile_exists;

  IF NOT profile_exists THEN
    INSERT INTO public.profiles (
      user_id, full_name, email, phone, address, linkedin_url, website_url,
      professional_summary, technical_skills, work_experience, education, projects, last_resume_sync
    ) VALUES (
      NEW.user_id,
      resume_data->'personal'->>'name',
      resume_data->'personal'->>'email',
      resume_data->'personal'->>'phone',
      resume_data->'personal'->>'address',
      resume_data->'personal'->>'linkedin',
      resume_data->'personal'->>'website',
      resume_data->'personal'->>'summary',
      COALESCE(resume_data->'skills', '[]'::jsonb),
      COALESCE(resume_data->'experience', '[]'::jsonb),
      COALESCE(resume_data->'education', '[]'::jsonb),
      COALESCE(resume_data->'projects', '[]'::jsonb),
      now()
    );
  ELSE
    UPDATE public.profiles
    SET last_resume_sync = now(), updated_at = now()
    WHERE user_id = NEW.user_id
      AND auto_sync_enabled = true
      AND (last_resume_sync IS NULL OR last_resume_sync < NEW.updated_at);
  END IF;

  RETURN NEW;
END;
$function$;
