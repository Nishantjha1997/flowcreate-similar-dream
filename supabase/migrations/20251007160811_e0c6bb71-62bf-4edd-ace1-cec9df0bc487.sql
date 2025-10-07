-- ATS System Database Schema
-- Organizations table for multi-tenant support
CREATE TABLE public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  industry TEXT,
  company_size TEXT,
  logo_url TEXT,
  website_url TEXT,
  description TEXT,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Organization members (HR team members)
CREATE TABLE public.organization_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'hiring_manager', 'recruiter', 'interviewer', 'viewer')),
  department TEXT,
  invited_by UUID,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

-- Departments within organizations
CREATE TABLE public.departments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id, name)
);

-- Job postings
CREATE TABLE public.jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT,
  responsibilities TEXT,
  location TEXT,
  job_type TEXT CHECK (job_type IN ('full_time', 'part_time', 'contract', 'internship', 'freelance')),
  experience_level TEXT CHECK (experience_level IN ('entry', 'mid', 'senior', 'lead', 'executive')),
  salary_min INTEGER,
  salary_max INTEGER,
  salary_currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'closed', 'archived')),
  hiring_managers UUID[] DEFAULT '{}',
  recruiters UUID[] DEFAULT '{}',
  settings JSONB DEFAULT '{}'::jsonb,
  published_at TIMESTAMP WITH TIME ZONE,
  closed_at TIMESTAMP WITH TIME ZONE,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Custom pipeline stages for each job
CREATE TABLE public.pipeline_stages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  stage_order INTEGER NOT NULL,
  is_default BOOLEAN DEFAULT false,
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(job_id, stage_order)
);

-- Job applications
CREATE TABLE public.job_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  candidate_email TEXT NOT NULL,
  candidate_name TEXT NOT NULL,
  candidate_phone TEXT,
  candidate_linkedin TEXT,
  resume_url TEXT,
  resume_id UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
  cover_letter TEXT,
  application_data JSONB DEFAULT '{}'::jsonb,
  current_stage_id UUID REFERENCES public.pipeline_stages(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewing', 'interview', 'offer', 'hired', 'rejected', 'withdrawn')),
  source TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  tags TEXT[] DEFAULT '{}',
  ai_match_score INTEGER CHECK (ai_match_score >= 0 AND ai_match_score <= 100),
  ai_summary TEXT,
  assigned_to UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Application reviews and feedback
CREATE TABLE public.application_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES public.job_applications(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  recommendation TEXT CHECK (recommendation IN ('strong_yes', 'yes', 'maybe', 'no', 'strong_no')),
  criteria_scores JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Interview scheduling
CREATE TABLE public.interviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES public.job_applications(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  interview_type TEXT CHECK (interview_type IN ('phone', 'video', 'onsite', 'technical', 'behavioral', 'panel')),
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  location TEXT,
  meeting_link TEXT,
  interviewers UUID[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
  feedback TEXT,
  notes TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Job offers
CREATE TABLE public.job_offers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES public.job_applications(id) ON DELETE CASCADE,
  job_title TEXT NOT NULL,
  salary_amount INTEGER NOT NULL,
  salary_currency TEXT NOT NULL DEFAULT 'USD',
  benefits TEXT,
  start_date DATE,
  offer_letter_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired', 'withdrawn')),
  sent_at TIMESTAMP WITH TIME ZONE,
  responded_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activity log for audit trail
CREATE TABLE public.ats_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Talent pools for future opportunities
CREATE TABLE public.talent_pools (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Talent pool candidates
CREATE TABLE public.talent_pool_candidates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  talent_pool_id UUID NOT NULL REFERENCES public.talent_pools(id) ON DELETE CASCADE,
  application_id UUID REFERENCES public.job_applications(id) ON DELETE SET NULL,
  candidate_email TEXT NOT NULL,
  candidate_name TEXT NOT NULL,
  notes TEXT,
  added_by UUID NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ats_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.talent_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.talent_pool_candidates ENABLE ROW LEVEL SECURITY;

-- Helper function to check org membership
CREATE OR REPLACE FUNCTION is_org_member(org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id = org_id AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check org role
CREATE OR REPLACE FUNCTION has_org_role(org_id UUID, required_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id = org_id 
    AND user_id = auth.uid()
    AND role = required_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for organizations
CREATE POLICY "Org members can view their organization"
  ON public.organizations FOR SELECT
  USING (is_org_member(id));

CREATE POLICY "Org owners can update their organization"
  ON public.organizations FOR UPDATE
  USING (has_org_role(id, 'owner'));

CREATE POLICY "Anyone can create an organization"
  ON public.organizations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Org owners can delete their organization"
  ON public.organizations FOR DELETE
  USING (has_org_role(id, 'owner'));

-- RLS Policies for organization_members
CREATE POLICY "Org members can view team members"
  ON public.organization_members FOR SELECT
  USING (is_org_member(organization_id));

CREATE POLICY "Org admins can manage team members"
  ON public.organization_members FOR ALL
  USING (has_org_role(organization_id, 'owner') OR has_org_role(organization_id, 'admin'));

-- RLS Policies for departments
CREATE POLICY "Org members can view departments"
  ON public.departments FOR SELECT
  USING (is_org_member(organization_id));

CREATE POLICY "Org admins can manage departments"
  ON public.departments FOR ALL
  USING (has_org_role(organization_id, 'owner') OR has_org_role(organization_id, 'admin'));

-- RLS Policies for jobs
CREATE POLICY "Org members can view jobs"
  ON public.jobs FOR SELECT
  USING (is_org_member(organization_id));

CREATE POLICY "Hiring managers and recruiters can create jobs"
  ON public.jobs FOR INSERT
  WITH CHECK (is_org_member(organization_id));

CREATE POLICY "Job creators can update jobs"
  ON public.jobs FOR UPDATE
  USING (is_org_member(organization_id));

CREATE POLICY "Org admins can delete jobs"
  ON public.jobs FOR DELETE
  USING (has_org_role(organization_id, 'owner') OR has_org_role(organization_id, 'admin'));

-- RLS Policies for pipeline_stages
CREATE POLICY "Org members can view pipeline stages"
  ON public.pipeline_stages FOR SELECT
  USING (EXISTS (SELECT 1 FROM jobs WHERE id = job_id AND is_org_member(organization_id)));

CREATE POLICY "Org members can manage pipeline stages"
  ON public.pipeline_stages FOR ALL
  USING (EXISTS (SELECT 1 FROM jobs WHERE id = job_id AND is_org_member(organization_id)));

-- RLS Policies for job_applications
CREATE POLICY "Org members can view applications"
  ON public.job_applications FOR SELECT
  USING (EXISTS (SELECT 1 FROM jobs WHERE id = job_id AND is_org_member(organization_id)));

CREATE POLICY "Anyone can submit applications"
  ON public.job_applications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Org members can update applications"
  ON public.job_applications FOR UPDATE
  USING (EXISTS (SELECT 1 FROM jobs WHERE id = job_id AND is_org_member(organization_id)));

-- RLS Policies for application_reviews
CREATE POLICY "Org members can view reviews"
  ON public.application_reviews FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM job_applications ja
    JOIN jobs j ON ja.job_id = j.id
    WHERE ja.id = application_id AND is_org_member(j.organization_id)
  ));

CREATE POLICY "Org members can create reviews"
  ON public.application_reviews FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM job_applications ja
    JOIN jobs j ON ja.job_id = j.id
    WHERE ja.id = application_id AND is_org_member(j.organization_id)
  ));

-- RLS Policies for interviews
CREATE POLICY "Org members can manage interviews"
  ON public.interviews FOR ALL
  USING (EXISTS (
    SELECT 1 FROM job_applications ja
    JOIN jobs j ON ja.job_id = j.id
    WHERE ja.id = application_id AND is_org_member(j.organization_id)
  ));

-- RLS Policies for job_offers
CREATE POLICY "Org members can manage offers"
  ON public.job_offers FOR ALL
  USING (EXISTS (
    SELECT 1 FROM job_applications ja
    JOIN jobs j ON ja.job_id = j.id
    WHERE ja.id = application_id AND is_org_member(j.organization_id)
  ));

-- RLS Policies for ats_activities
CREATE POLICY "Org members can view activities"
  ON public.ats_activities FOR SELECT
  USING (is_org_member(organization_id));

CREATE POLICY "Org members can create activities"
  ON public.ats_activities FOR INSERT
  WITH CHECK (is_org_member(organization_id));

-- RLS Policies for talent_pools
CREATE POLICY "Org members can manage talent pools"
  ON public.talent_pools FOR ALL
  USING (is_org_member(organization_id));

-- RLS Policies for talent_pool_candidates
CREATE POLICY "Org members can manage talent pool candidates"
  ON public.talent_pool_candidates FOR ALL
  USING (EXISTS (
    SELECT 1 FROM talent_pools
    WHERE id = talent_pool_id AND is_org_member(organization_id)
  ));

-- Create indexes for better performance
CREATE INDEX idx_org_members_user ON public.organization_members(user_id);
CREATE INDEX idx_org_members_org ON public.organization_members(organization_id);
CREATE INDEX idx_jobs_org ON public.jobs(organization_id);
CREATE INDEX idx_jobs_status ON public.jobs(status);
CREATE INDEX idx_applications_job ON public.job_applications(job_id);
CREATE INDEX idx_applications_status ON public.job_applications(status);
CREATE INDEX idx_applications_email ON public.job_applications(candidate_email);
CREATE INDEX idx_activities_org ON public.ats_activities(organization_id);
CREATE INDEX idx_activities_created ON public.ats_activities(created_at DESC);

-- Trigger for updating updated_at timestamps
CREATE OR REPLACE FUNCTION update_ats_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION update_ats_updated_at();

CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION update_ats_updated_at();

CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON public.job_applications
  FOR EACH ROW EXECUTE FUNCTION update_ats_updated_at();

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.application_reviews
  FOR EACH ROW EXECUTE FUNCTION update_ats_updated_at();

CREATE TRIGGER update_interviews_updated_at
  BEFORE UPDATE ON public.interviews
  FOR EACH ROW EXECUTE FUNCTION update_ats_updated_at();

CREATE TRIGGER update_offers_updated_at
  BEFORE UPDATE ON public.job_offers
  FOR EACH ROW EXECUTE FUNCTION update_ats_updated_at();