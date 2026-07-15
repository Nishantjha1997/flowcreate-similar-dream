-- Create is_super_admin function for checking website admin status
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$;

-- Super admin can SELECT all organizations
CREATE POLICY "Super admins can view all organizations"
ON public.organizations
FOR SELECT
USING (is_super_admin());

-- Super admin can manage all organizations
CREATE POLICY "Super admins can manage all organizations"
ON public.organizations
FOR ALL
USING (is_super_admin());

-- Super admin can SELECT all jobs
CREATE POLICY "Super admins can view all jobs"
ON public.jobs
FOR SELECT
USING (is_super_admin());

-- Super admin can manage all jobs
CREATE POLICY "Super admins can manage all jobs"
ON public.jobs
FOR ALL
USING (is_super_admin());

-- Super admin can SELECT all job applications
CREATE POLICY "Super admins can view all applications"
ON public.job_applications
FOR SELECT
USING (is_super_admin());

-- Super admin can manage all job applications
CREATE POLICY "Super admins can manage all applications"
ON public.job_applications
FOR ALL
USING (is_super_admin());

-- Super admin can SELECT all organization members
CREATE POLICY "Super admins can view all org members"
ON public.organization_members
FOR SELECT
USING (is_super_admin());

-- Super admin can manage all organization members
CREATE POLICY "Super admins can manage all org members"
ON public.organization_members
FOR ALL
USING (is_super_admin());

-- Super admin can SELECT all interviews
CREATE POLICY "Super admins can view all interviews"
ON public.interviews
FOR SELECT
USING (is_super_admin());

-- Super admin can manage all interviews
CREATE POLICY "Super admins can manage all interviews"
ON public.interviews
FOR ALL
USING (is_super_admin());

-- Super admin can SELECT all job offers
CREATE POLICY "Super admins can view all job offers"
ON public.job_offers
FOR SELECT
USING (is_super_admin());

-- Super admin can manage all job offers
CREATE POLICY "Super admins can manage all job offers"
ON public.job_offers
FOR ALL
USING (is_super_admin());

-- Super admin can SELECT all pipeline stages
CREATE POLICY "Super admins can view all pipeline stages"
ON public.pipeline_stages
FOR SELECT
USING (is_super_admin());

-- Super admin can manage all pipeline stages
CREATE POLICY "Super admins can manage all pipeline stages"
ON public.pipeline_stages
FOR ALL
USING (is_super_admin());

-- Super admin can SELECT all ATS activities
CREATE POLICY "Super admins can view all ats activities"
ON public.ats_activities
FOR SELECT
USING (is_super_admin());

-- Super admin can manage all ATS activities
CREATE POLICY "Super admins can manage all ats activities"
ON public.ats_activities
FOR ALL
USING (is_super_admin());

-- Super admin can SELECT all departments
CREATE POLICY "Super admins can view all departments"
ON public.departments
FOR SELECT
USING (is_super_admin());

-- Super admin can manage all departments
CREATE POLICY "Super admins can manage all departments"
ON public.departments
FOR ALL
USING (is_super_admin());

-- Super admin can SELECT all talent pools
CREATE POLICY "Super admins can view all talent pools"
ON public.talent_pools
FOR SELECT
USING (is_super_admin());

-- Super admin can manage all talent pools
CREATE POLICY "Super admins can manage all talent pools"
ON public.talent_pools
FOR ALL
USING (is_super_admin());

-- Super admin can SELECT all talent pool candidates
CREATE POLICY "Super admins can view all talent pool candidates"
ON public.talent_pool_candidates
FOR SELECT
USING (is_super_admin());

-- Super admin can manage all talent pool candidates
CREATE POLICY "Super admins can manage all talent pool candidates"
ON public.talent_pool_candidates
FOR ALL
USING (is_super_admin());