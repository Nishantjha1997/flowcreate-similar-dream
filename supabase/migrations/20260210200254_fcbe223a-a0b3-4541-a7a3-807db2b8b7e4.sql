-- Fix 1: Set search_path on functions missing it
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_ats_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Fix 2: Harden overly permissive RLS INSERT policies

-- Organizations: require authenticated user
DROP POLICY IF EXISTS "Anyone can create an organization" ON public.organizations;
CREATE POLICY "Authenticated users can create organizations"
ON public.organizations
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Job applications: only allow submissions to published jobs
DROP POLICY IF EXISTS "Anyone can submit applications" ON public.job_applications;
CREATE POLICY "Anyone can submit applications to published jobs"
ON public.job_applications
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.jobs
    WHERE jobs.id = job_id AND jobs.status = 'published'
  )
);

-- Analytics events: require non-empty event_name
DROP POLICY IF EXISTS "Anyone can insert analytics" ON public.analytics_events;
CREATE POLICY "Anyone can insert analytics events"
ON public.analytics_events
FOR INSERT
WITH CHECK (
  event_name IS NOT NULL AND length(trim(event_name)) > 0
);