# FlowCreate (ResumeForge) — Complete Implementation Plan
## New Supabase Setup & SaaS Shipping Strategy

> **Project**: FlowCreate / ResumeForge  
> **Type**: Resume Builder + Applicant Tracking System (ATS)  
> **Stack**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Supabase, Razorpay, Google Gemini AI  
> **Status**: Database disconnected — needs full Supabase rebuild + SaaS hardening

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Current Architecture](#2-current-architecture)
3. [Phase 1: Supabase Database Rebuild](#3-phase-1-supabase-database-rebuild)
4. [Phase 2: SaaS Readiness Analysis](#4-phase-2-saas-readiness-analysis)
5. [Phase 3: New Tables & Schema for SaaS](#5-phase-3-new-tables--schema-for-saas)
6. [Phase 4: SaaS Pricing Model](#6-phase-4-saas-pricing-model)
7. [Phase 5: Execution Timeline](#7-phase-5-execution-timeline)
8. [Edge Functions Reference](#8-edge-functions-reference)
9. [Environment Variables](#9-environment-variables)
10. [Verification Plan](#10-verification-plan)
11. [Open Questions & Decisions](#11-open-questions--decisions)

---

## 1. Project Overview

FlowCreate is a full-stack platform with **two core products**:

### Product A: Resume Builder
- 7+ professionally designed templates (Modern, Classic, Creative, Technical, Professional, Minimalist, Executive)
- Real-time preview with customization (colors, fonts, spacing, layout)
- Drag-and-drop section reordering
- AI-powered content suggestions via Google Gemini (premium)
- PDF resume parsing & data extraction (premium)
- PDF export via html2canvas + jspdf
- Profile-to-resume sync with auto-save
- Free tier limited to 1 saved resume

### Product B: Applicant Tracking System (ATS)
- Multi-tenant organization management with role-based access (owner, admin, hiring_manager, recruiter, interviewer, viewer)
- Job posting management (draft → published → closed)
- Kanban-style application pipeline with customizable stages
- AI match scoring (0-100) for candidates
- Interview scheduling with feedback
- Job offer management
- Talent pools & candidate discovery
- Public job board & application forms

### Shared Infrastructure
- Supabase Auth (email/password)
- Role-based access control (admin, moderator, user)
- Razorpay payment integration (5 pricing tiers)
- Admin dashboard (16 components: user mgmt, analytics, templates, content, security, AI keys)
- Light/Dark mode + Neo-Brutalism design mode
- Docker deployment (multi-stage: Node → Nginx)

---

## 2. Current Architecture

### Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS, shadcn/ui (Radix primitives) |
| State | TanStack React Query, React Context |
| Routing | react-router-dom v6 (33 routes, all lazy-loaded) |
| Backend | Supabase (PostgreSQL, Auth, Edge Functions, Realtime) |
| Payments | Razorpay (Indian payment gateway) |
| AI | Google Gemini (via Supabase Edge Functions) |
| PDF | html2canvas + jspdf |
| Charts | Recharts |
| Forms | react-hook-form + zod |
| Deployment | Docker (Node.js builder → Nginx) |

### Route Map (33 routes)

**Public/Marketing**: `/`, `/templates`, `/examples`, `/features`, `/pricing`, `/about`, `/terms`, `/privacy`, `/refund-policy`, `/shipping-policy`

**Auth**: `/login`, `/register`, `/forgot-password`

**App**: `/resume-builder`, `/account`, `/account/settings`, `/admin`

**ATS (14 routes)**: `/ats`, `/ats/login`, `/ats/signup`, `/ats/onboarding`, `/ats/dashboard`, `/ats/jobs`, `/ats/jobs/new`, `/ats/jobs/:jobId`, `/ats/applications/:applicationId`, `/ats/settings`, `/ats/jobs/browse`, `/ats/apply/:jobId`, `/ats/talent-pools`, `/ats/candidates`

### Custom Hooks (26 total)
`useAuth`, `useUserProfile`, `useRazorpayPayment`, `usePremiumStatus`, `useResumeData`, `useResumeSave`, `useResumeLimit`, `useResumeHandlers`, `useResumeProfileSync`, `useTemplates`, `useAIEnhancements`, `useAIApiKeys`, `useAutoSave`, `usePDFGenerator`, `useDesignMode`, `useAdminStatus`, `useAdminATSStats`, `useAdminOrganizations`, `useAllMembers`, `useProfileValidation`, `useScrollAnimation`, `useSectionManagement`, `usePerformanceOptimization`, `use-mobile`, `use-toast`, `useUserProfiles`

---

## 3. Phase 1: Supabase Database Rebuild

### Step 1 — Create New Supabase Project
- Create a new project via Supabase Dashboard or CLI
- Region: `ap-south-1` (Mumbai) recommended for Indian user base
- Retrieve: **Project URL**, **Anon Key**, **Service Role Key**

### Step 2 — Consolidated Migration

Apply ONE consolidated migration (instead of replaying the original 20 incremental migrations). This is the **complete schema** to recreate:

---

### Enum Types

```sql
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
```

---

### Table Creation Order (Dependency-Safe)

| Order | Table | Foreign Key Dependencies |
|-------|-------|--------------------------|
| 1 | `profiles` | — |
| 2 | `resumes` | — |
| 3 | `subscriptions` | — |
| 4 | `user_roles` | — |
| 5 | `usage_limits` | — |
| 6 | `analytics_events` | — |
| 7 | `ai_api_keys` | — |
| 8 | `ai_token_usage` | — |
| 9 | `site_settings` | — |
| 10 | `resume_templates` | — |
| 11 | `payments` | → `subscriptions` |
| 12 | `organizations` | — |
| 13 | `organization_members` | → `organizations` |
| 14 | `departments` | → `organizations` |
| 15 | `jobs` | → `organizations`, `departments` |
| 16 | `pipeline_stages` | → `jobs` |
| 17 | `job_applications` | → `jobs`, `resumes`, `pipeline_stages` |
| 18 | `application_reviews` | → `job_applications` |
| 19 | `interviews` | → `job_applications` |
| 20 | `job_offers` | → `job_applications` |
| 21 | `ats_activities` | → `organizations` |
| 22 | `talent_pools` | → `organizations` |
| 23 | `talent_pool_candidates` | → `talent_pools`, `job_applications` |

---

### Complete Table Schemas

#### Table 1: `profiles`
```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  date_of_birth DATE,
  address TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT,
  linkedin_url TEXT,
  website_url TEXT,
  github_url TEXT,
  portfolio_url TEXT,
  avatar_url TEXT,
  professional_summary TEXT,
  current_position TEXT,
  industry TEXT,
  experience_level TEXT,  -- 'entry', 'mid', 'senior', 'executive'
  technical_skills JSONB DEFAULT '[]',
  soft_skills JSONB DEFAULT '[]',
  languages JSONB DEFAULT '[]',
  work_experience JSONB DEFAULT '[]',
  education JSONB DEFAULT '[]',
  projects JSONB DEFAULT '[]',
  certifications JSONB DEFAULT '[]',
  achievements JSONB DEFAULT '[]',
  volunteer_experience JSONB DEFAULT '[]',
  profile_completeness INTEGER DEFAULT 0,  -- 0-100
  last_resume_sync TIMESTAMPTZ,
  auto_sync_enabled BOOLEAN DEFAULT true,
  is_discoverable BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### Table 2: `resumes`
```sql
CREATE TABLE public.resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  resume_data JSONB NOT NULL,
  template_id TEXT DEFAULT 'modern',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### Table 3: `subscriptions`
```sql
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL,
  is_premium BOOLEAN DEFAULT false,
  plan_type TEXT DEFAULT 'monthly',
  razorpay_customer_id TEXT,
  razorpay_payment_id TEXT,
  status TEXT DEFAULT 'active',
  expires_at TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### Table 4: `user_roles`
```sql
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role app_role NOT NULL
);
```

#### Table 5: `usage_limits`
```sql
CREATE TABLE public.usage_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  resumes_created INTEGER DEFAULT 0,
  ai_requests INTEGER DEFAULT 0,
  templates_used TEXT[],
  last_reset_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### Table 6: `analytics_events`
```sql
CREATE TABLE public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL,
  event_properties JSONB,
  user_id UUID,
  session_id TEXT,
  page_url TEXT,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### Table 7: `ai_api_keys`
```sql
CREATE TABLE public.ai_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  provider TEXT CHECK (provider IN ('openai', 'gemini', 'deepseek')),
  key TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  is_primary BOOLEAN DEFAULT false,
  is_fallback BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  last_used TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### Table 8: `ai_token_usage`
```sql
CREATE TABLE public.ai_token_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL,
  total_tokens INTEGER DEFAULT 0,
  tokens_today INTEGER DEFAULT 0,
  tokens_this_month INTEGER DEFAULT 0,
  cost_estimate DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### Table 9: `site_settings`
```sql
CREATE TABLE public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### Table 10: `resume_templates`
```sql
CREATE TABLE public.resume_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  template_key TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  preview_url TEXT,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  is_ats_optimized BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### Table 11: `payments`
```sql
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  subscription_id UUID REFERENCES public.subscriptions(id),
  razorpay_payment_id TEXT NOT NULL,
  razorpay_order_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'INR',
  status TEXT NOT NULL,
  payment_method TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE UNIQUE INDEX uniq_payments_razorpay_payment_id ON public.payments(razorpay_payment_id);
```

#### Table 12: `organizations`
```sql
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  industry TEXT,
  company_size TEXT,
  logo_url TEXT,
  website_url TEXT,
  description TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### Table 13: `organization_members`
```sql
CREATE TABLE public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT CHECK (role IN ('owner', 'admin', 'hiring_manager', 'recruiter', 'interviewer', 'viewer')),
  department TEXT,
  invited_by UUID,
  joined_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, user_id)
);
CREATE INDEX idx_org_members_user ON public.organization_members(user_id);
CREATE INDEX idx_org_members_org ON public.organization_members(organization_id);
```

#### Table 14: `departments`
```sql
CREATE TABLE public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, name)
);
```

#### Table 15: `jobs`
```sql
CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
  status TEXT CHECK (status IN ('draft', 'published', 'active', 'paused', 'closed', 'archived')) DEFAULT 'draft',
  hiring_managers UUID[] DEFAULT '{}',
  recruiters UUID[] DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  published_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_jobs_org ON public.jobs(organization_id);
CREATE INDEX idx_jobs_status ON public.jobs(status);
```

#### Table 16: `pipeline_stages`
```sql
CREATE TABLE public.pipeline_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  stage_order INTEGER NOT NULL,
  is_default BOOLEAN DEFAULT false,
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(job_id, stage_order)
);
```

#### Table 17: `job_applications`
```sql
CREATE TABLE public.job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  candidate_email TEXT NOT NULL,
  candidate_name TEXT NOT NULL,
  candidate_phone TEXT,
  candidate_linkedin TEXT,
  resume_url TEXT,
  resume_id UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
  cover_letter TEXT,
  application_data JSONB DEFAULT '{}',
  current_stage_id UUID REFERENCES public.pipeline_stages(id) ON DELETE SET NULL,
  status TEXT CHECK (status IN ('new', 'reviewing', 'interview', 'offer', 'hired', 'rejected', 'withdrawn')) DEFAULT 'new',
  source TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  tags TEXT[] DEFAULT '{}',
  ai_match_score INTEGER CHECK (ai_match_score >= 0 AND ai_match_score <= 100),
  ai_summary TEXT,
  assigned_to UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_applications_job ON public.job_applications(job_id);
CREATE INDEX idx_applications_status ON public.job_applications(status);
CREATE INDEX idx_applications_email ON public.job_applications(candidate_email);
```

#### Table 18: `application_reviews`
```sql
CREATE TABLE public.application_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.job_applications(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  recommendation TEXT CHECK (recommendation IN ('strong_yes', 'yes', 'maybe', 'no', 'strong_no')),
  criteria_scores JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### Table 19: `interviews`
```sql
CREATE TABLE public.interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.job_applications(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  interview_type TEXT CHECK (interview_type IN ('phone', 'video', 'onsite', 'technical', 'behavioral', 'panel')),
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  location TEXT,
  meeting_link TEXT,
  interviewers UUID[] DEFAULT '{}',
  status TEXT CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')) DEFAULT 'scheduled',
  feedback TEXT,
  notes TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### Table 20: `job_offers`
```sql
CREATE TABLE public.job_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.job_applications(id) ON DELETE CASCADE,
  job_title TEXT NOT NULL,
  salary_amount INTEGER NOT NULL,
  salary_currency TEXT DEFAULT 'USD',
  benefits TEXT,
  start_date DATE,
  offer_letter_url TEXT,
  status TEXT CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired', 'withdrawn')) DEFAULT 'draft',
  sent_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### Table 21: `ats_activities`
```sql
CREATE TABLE public.ats_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_activities_org ON public.ats_activities(organization_id);
CREATE INDEX idx_activities_created ON public.ats_activities(created_at DESC);
```

#### Table 22: `talent_pools`
```sql
CREATE TABLE public.talent_pools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### Table 23: `talent_pool_candidates`
```sql
CREATE TABLE public.talent_pool_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  talent_pool_id UUID NOT NULL REFERENCES public.talent_pools(id) ON DELETE CASCADE,
  application_id UUID REFERENCES public.job_applications(id) ON DELETE SET NULL,
  candidate_email TEXT NOT NULL,
  candidate_name TEXT NOT NULL,
  notes TEXT,
  added_by UUID NOT NULL,
  added_at TIMESTAMPTZ DEFAULT now()
);
```

---

### View: `discoverable_candidates`
```sql
CREATE VIEW public.discoverable_candidates WITH (security_invoker = on) AS
SELECT
  id, user_id, full_name, current_position, industry, experience_level,
  professional_summary, technical_skills, soft_skills,
  city, state, country,
  education, work_experience, certifications, projects, languages,
  avatar_url, linkedin_url, github_url, portfolio_url,
  profile_completeness, created_at, updated_at
FROM public.profiles
WHERE is_discoverable = true AND full_name IS NOT NULL AND full_name != '';
```

---

### Functions (11 total)

```sql
-- 1. Role check
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM user_roles WHERE user_id = _user_id AND role = _role);
$$;

-- 2. Admin check
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin');
$$;

-- 3. Super admin (alias)
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin');
$$;

-- 4. Get user role
CREATE OR REPLACE FUNCTION public.get_user_role(p_user_id UUID)
RETURNS app_role LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT role FROM user_roles WHERE user_id = p_user_id LIMIT 1;
$$;

-- 5. Org member check
CREATE OR REPLACE FUNCTION public.is_org_member(p_org_id UUID)
RETURNS BOOLEAN LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM organization_members WHERE organization_id = p_org_id AND user_id = auth.uid());
END;
$$;

-- 6. Org role check
CREATE OR REPLACE FUNCTION public.has_org_role(p_org_id UUID, p_required_role TEXT)
RETURNS BOOLEAN LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_id = p_org_id AND user_id = auth.uid()
    AND role IN ('owner', p_required_role)
  );
END;
$$;

-- 7. Generic updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 8. ATS updated_at trigger
CREATE OR REPLACE FUNCTION public.update_ats_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 9. Profiles updated_at trigger
CREATE OR REPLACE FUNCTION public.update_profiles_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 10. Profile completeness calculator
CREATE OR REPLACE FUNCTION public.calculate_profile_completeness(profile_data JSONB)
RETURNS INTEGER LANGUAGE plpgsql IMMUTABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  completeness INTEGER := 0;
  total_fields INTEGER := 12;
  filled_fields INTEGER := 0;
BEGIN
  IF profile_data->>'full_name' IS NOT NULL AND profile_data->>'full_name' != '' THEN filled_fields := filled_fields + 1; END IF;
  IF profile_data->>'email' IS NOT NULL AND profile_data->>'email' != '' THEN filled_fields := filled_fields + 1; END IF;
  IF profile_data->>'phone' IS NOT NULL AND profile_data->>'phone' != '' THEN filled_fields := filled_fields + 1; END IF;
  IF profile_data->>'professional_summary' IS NOT NULL AND profile_data->>'professional_summary' != '' THEN filled_fields := filled_fields + 1; END IF;
  IF profile_data->>'current_position' IS NOT NULL AND profile_data->>'current_position' != '' THEN filled_fields := filled_fields + 1; END IF;
  IF profile_data->>'industry' IS NOT NULL AND profile_data->>'industry' != '' THEN filled_fields := filled_fields + 1; END IF;
  IF jsonb_array_length(COALESCE(profile_data->'technical_skills', '[]'::jsonb)) > 0 THEN filled_fields := filled_fields + 1; END IF;
  IF jsonb_array_length(COALESCE(profile_data->'work_experience', '[]'::jsonb)) > 0 THEN filled_fields := filled_fields + 1; END IF;
  IF jsonb_array_length(COALESCE(profile_data->'education', '[]'::jsonb)) > 0 THEN filled_fields := filled_fields + 1; END IF;
  IF jsonb_array_length(COALESCE(profile_data->'projects', '[]'::jsonb)) > 0 THEN filled_fields := filled_fields + 1; END IF;
  IF jsonb_array_length(COALESCE(profile_data->'certifications', '[]'::jsonb)) > 0 THEN filled_fields := filled_fields + 1; END IF;
  IF profile_data->>'linkedin_url' IS NOT NULL AND profile_data->>'linkedin_url' != '' THEN filled_fields := filled_fields + 1; END IF;
  completeness := (filled_fields * 100) / total_fields;
  RETURN completeness;
END;
$$;

-- 11. Resume-to-profile sync trigger
CREATE OR REPLACE FUNCTION public.sync_resume_to_profile()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO profiles (user_id, updated_at)
  VALUES (NEW.user_id, now())
  ON CONFLICT (user_id) DO UPDATE
  SET last_resume_sync = now(), updated_at = now();
  RETURN NEW;
END;
$$;
```

---

### Triggers (12 total)

```sql
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_profiles_updated_at();
CREATE TRIGGER sync_resume_to_profile_trigger AFTER INSERT OR UPDATE ON resumes FOR EACH ROW EXECUTE FUNCTION sync_resume_to_profile();
CREATE TRIGGER update_ai_api_keys_updated_at BEFORE UPDATE ON ai_api_keys FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_token_usage_updated_at BEFORE UPDATE ON ai_token_usage FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_ats_updated_at();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION update_ats_updated_at();
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON job_applications FOR EACH ROW EXECUTE FUNCTION update_ats_updated_at();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON application_reviews FOR EACH ROW EXECUTE FUNCTION update_ats_updated_at();
CREATE TRIGGER update_interviews_updated_at BEFORE UPDATE ON interviews FOR EACH ROW EXECUTE FUNCTION update_ats_updated_at();
CREATE TRIGGER update_offers_updated_at BEFORE UPDATE ON job_offers FOR EACH ROW EXECUTE FUNCTION update_ats_updated_at();
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON site_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_resume_templates_updated_at BEFORE UPDATE ON resume_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

### RLS Policies (All Tables)

> **All tables have RLS enabled.** Below is the complete policy set.

#### `profiles`
```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (is_admin());
CREATE POLICY "Admins can update all profiles" ON profiles FOR UPDATE USING (is_admin());
CREATE POLICY "Org members can view discoverable candidates" ON profiles FOR SELECT USING (
  is_discoverable = true AND EXISTS (SELECT 1 FROM organization_members WHERE user_id = auth.uid())
);
```

#### `resumes`
```sql
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own resumes" ON resumes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own resumes" ON resumes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own resumes" ON resumes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own resumes" ON resumes FOR DELETE USING (auth.uid() = user_id);
```

#### `subscriptions`
```sql
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subscriptions_owner_select" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "subscriptions_admin_select" ON subscriptions FOR SELECT USING (is_admin());
CREATE POLICY "subscriptions_admin_insert" ON subscriptions FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "subscriptions_admin_update" ON subscriptions FOR UPDATE USING (is_admin());
CREATE POLICY "subscriptions_admin_delete" ON subscriptions FOR DELETE USING (is_admin());
```

#### `user_roles`
```sql
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own role" ON user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON user_roles FOR ALL USING (is_admin());
```

#### `usage_limits`
```sql
ALTER TABLE usage_limits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own limits" ON usage_limits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own limits" ON usage_limits FOR UPDATE USING (auth.uid() = user_id);
```

#### `analytics_events`
```sql
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert analytics events" ON analytics_events FOR INSERT WITH CHECK (
  event_name IS NOT NULL AND length(trim(event_name)) > 0
);
CREATE POLICY "Admins can view analytics" ON analytics_events FOR SELECT USING (is_admin());
```

#### `payments`
```sql
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "payments_owner_select" ON payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "payments_admin_select" ON payments FOR SELECT USING (is_admin());
CREATE POLICY "payments_admin_insert" ON payments FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "payments_admin_update" ON payments FOR UPDATE USING (is_admin());
CREATE POLICY "payments_admin_delete" ON payments FOR DELETE USING (is_admin());
```

#### `ai_api_keys`
```sql
ALTER TABLE ai_api_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Only admins can manage AI API keys" ON ai_api_keys FOR ALL USING (is_admin());
```

#### `ai_token_usage`
```sql
ALTER TABLE ai_token_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Only admins can view AI token usage" ON ai_token_usage FOR ALL USING (is_admin());
```

#### `site_settings`
```sql
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read whitelisted settings" ON site_settings FOR SELECT USING (
  setting_key IN ('design_mode', 'theme', 'language', 'public_features') OR is_admin()
);
CREATE POLICY "Only admins can modify settings" ON site_settings FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Only admins can update settings" ON site_settings FOR UPDATE USING (is_admin());
CREATE POLICY "Only admins can delete settings" ON site_settings FOR DELETE USING (is_admin());
```

#### `resume_templates`
```sql
ALTER TABLE resume_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active templates" ON resume_templates FOR SELECT USING (is_active = true OR is_admin());
CREATE POLICY "Admins can manage templates" ON resume_templates FOR ALL USING (is_admin());
```

#### `organizations`
```sql
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members can view their organization" ON organizations FOR SELECT USING (is_org_member(id));
CREATE POLICY "Org owners can update their organization" ON organizations FOR UPDATE USING (has_org_role(id, 'owner'));
CREATE POLICY "Authenticated users can create organizations" ON organizations FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Org owners can delete their organization" ON organizations FOR DELETE USING (has_org_role(id, 'owner'));
CREATE POLICY "Super admins can view all organizations" ON organizations FOR SELECT USING (is_super_admin());
CREATE POLICY "Super admins can manage all organizations" ON organizations FOR ALL USING (is_super_admin());
```

#### `organization_members`
```sql
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members can view team members" ON organization_members FOR SELECT USING (is_org_member(organization_id));
CREATE POLICY "Org admins can manage team members" ON organization_members FOR ALL USING (has_org_role(organization_id, 'admin'));
CREATE POLICY "Super admins can view all org members" ON organization_members FOR SELECT USING (is_super_admin());
CREATE POLICY "Super admins can manage all org members" ON organization_members FOR ALL USING (is_super_admin());
```

#### `departments`
```sql
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members can view departments" ON departments FOR SELECT USING (is_org_member(organization_id));
CREATE POLICY "Org admins can manage departments" ON departments FOR ALL USING (has_org_role(organization_id, 'admin'));
CREATE POLICY "Super admins can view all departments" ON departments FOR SELECT USING (is_super_admin());
CREATE POLICY "Super admins can manage all departments" ON departments FOR ALL USING (is_super_admin());
```

#### `jobs`
```sql
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members can view jobs" ON jobs FOR SELECT USING (is_org_member(organization_id));
CREATE POLICY "Org members can create jobs" ON jobs FOR INSERT WITH CHECK (is_org_member(organization_id));
CREATE POLICY "Org members can update jobs" ON jobs FOR UPDATE USING (is_org_member(organization_id));
CREATE POLICY "Org admins can delete jobs" ON jobs FOR DELETE USING (has_org_role(organization_id, 'admin'));
CREATE POLICY "Anyone can view published jobs" ON jobs FOR SELECT USING (status IN ('published', 'active'));
CREATE POLICY "Super admins can manage all jobs" ON jobs FOR ALL USING (is_super_admin());
```

#### `pipeline_stages`
```sql
ALTER TABLE pipeline_stages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members can view pipeline stages" ON pipeline_stages FOR SELECT USING (
  EXISTS (SELECT 1 FROM jobs WHERE jobs.id = pipeline_stages.job_id AND is_org_member(jobs.organization_id))
);
CREATE POLICY "Org members can manage pipeline stages" ON pipeline_stages FOR ALL USING (
  EXISTS (SELECT 1 FROM jobs WHERE jobs.id = pipeline_stages.job_id AND is_org_member(jobs.organization_id))
);
```

#### `job_applications`
```sql
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can apply to published jobs" ON job_applications FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM jobs WHERE jobs.id = job_applications.job_id AND jobs.status IN ('published', 'active'))
);
CREATE POLICY "Org members can view applications" ON job_applications FOR SELECT USING (
  EXISTS (SELECT 1 FROM jobs WHERE jobs.id = job_applications.job_id AND is_org_member(jobs.organization_id))
);
CREATE POLICY "Org members can update applications" ON job_applications FOR UPDATE USING (
  EXISTS (SELECT 1 FROM jobs WHERE jobs.id = job_applications.job_id AND is_org_member(jobs.organization_id))
);
CREATE POLICY "Super admins can manage all applications" ON job_applications FOR ALL USING (is_super_admin());
```

#### `application_reviews`, `interviews`, `job_offers`, `ats_activities`, `talent_pools`, `talent_pool_candidates`
```sql
-- Pattern: Org members can view/manage via join to jobs/organization
-- Super admins can manage all
-- (Same pattern as job_applications — org membership checked via parent table join)
```

---

### Seed Data: Resume Templates (20 templates)

```sql
INSERT INTO resume_templates (name, template_key, category, description, is_active, is_featured, is_ats_optimized) VALUES
('Modern Professional', 'modern', 'Professional', 'Clean modern design with a professional touch', true, true, true),
('Classic Elegant', 'classic', 'Professional', 'Timeless design that never goes out of style', true, true, true),
('Creative Portfolio', 'creative', 'Creative', 'Stand out with a creative and artistic layout', true, true, false),
('Tech Developer', 'technical', 'Technology', 'Perfect for software developers and engineers', true, true, true),
('Executive Suite', 'executive', 'Executive', 'Premium design for senior executives', true, true, true),
('Minimalist Clean', 'minimalist', 'Professional', 'Less is more - clean and focused design', true, false, true),
('Bold Statement', 'bold', 'Creative', 'Make a bold impression with striking design', true, false, false),
('Academic Research', 'academic', 'Education', 'Ideal for academics and researchers', true, false, true),
('Healthcare Pro', 'healthcare', 'Healthcare', 'Designed for healthcare professionals', true, false, true),
('Legal Professional', 'legal', 'Professional', 'Formal design for legal professionals', true, false, true),
('Marketing Maven', 'marketing', 'Creative', 'Dynamic design for marketing professionals', true, false, false),
('Data Science', 'data-science', 'Technology', 'Showcase your data skills effectively', true, false, true),
('Startup Founder', 'startup', 'Executive', 'Perfect for entrepreneurs and startup founders', true, false, false),
('Government Service', 'government', 'Professional', 'Compliant design for government applications', true, false, true),
('Teacher Educator', 'teacher', 'Education', 'Warm design for education professionals', true, false, true),
('Engineering Expert', 'engineering', 'Technology', 'Technical design for engineering roles', true, false, true),
('Sales Champion', 'sales', 'Professional', 'Results-driven design for sales professionals', true, false, false),
('Designer Portfolio', 'designer', 'Creative', 'Visual design-focused resume template', true, false, false),
('Finance Expert', 'finance', 'Professional', 'Professional design for finance roles', true, false, true),
('ATS Optimized Basic', 'ats-basic', 'ATS-Friendly', 'Maximum ATS compatibility with clean formatting', true, true, true);

-- Default site settings
INSERT INTO site_settings (setting_key, setting_value) VALUES ('design_mode', '{"enabled": false}');
```

---

### Foreign Key Relationship Map

```
payments.subscription_id           → subscriptions.id
job_applications.job_id            → jobs.id (CASCADE)
job_applications.resume_id         → resumes.id (SET NULL)
job_applications.current_stage_id  → pipeline_stages.id (SET NULL)
application_reviews.application_id → job_applications.id (CASCADE)
interviews.application_id          → job_applications.id (CASCADE)
job_offers.application_id          → job_applications.id (CASCADE)
jobs.organization_id               → organizations.id (CASCADE)
jobs.department_id                 → departments.id (SET NULL)
departments.organization_id       → organizations.id (CASCADE)
organization_members.organization_id → organizations.id (CASCADE)
pipeline_stages.job_id             → jobs.id (CASCADE)
ats_activities.organization_id     → organizations.id (CASCADE)
talent_pools.organization_id       → organizations.id (CASCADE)
talent_pool_candidates.talent_pool_id   → talent_pools.id (CASCADE)
talent_pool_candidates.application_id   → job_applications.id (SET NULL)
```

---

### Step 3 — Enable Supabase Auth
- Enable Email/Password sign-up
- Configure email templates (verification, password reset)
- Set site URL and redirect URLs

### Step 4 — Enable Realtime
- Enable Realtime on `site_settings` table (live design mode toggle)

### Step 5 — Create Storage Buckets
- `avatars` — Profile pictures
- `resumes` — Uploaded PDF resumes
- `org-logos` — Organization logos
- `offer-letters` — Job offer documents

---

## 4. Phase 2: SaaS Readiness Analysis

### Current State vs SaaS Requirements

| Area | Current Status | SaaS Ready? | Priority |
|------|---------------|-------------|----------|
| Authentication | ✅ Email/password via Supabase Auth | ⚠️ Needs OAuth | Medium |
| Authorization | ✅ Role-based (admin/mod/user) + Org roles | ✅ Good | — |
| Multi-tenancy | ✅ Org-based isolation via RLS | ✅ Good | — |
| Payments | ⚠️ Razorpay only (India-focused) | 🔴 Needs Stripe | Critical |
| Subscription Mgmt | ⚠️ Basic — no auto-renewal/webhooks | 🔴 Needs overhaul | Critical |
| AI Integration | ✅ Google Gemini via Edge Functions | ⚠️ Needs metering | Medium |
| Admin Panel | ✅ 16-component admin dashboard | ✅ Good | — |
| Analytics | ⚠️ Custom events table only | ⚠️ Needs proper tool | Medium |
| Email/Notifications | ❌ Missing entirely | 🔴 Critical gap | Critical |
| User Onboarding | ⚠️ Basic ATS onboarding only | ⚠️ Needs work | Medium |
| Error Monitoring | ❌ No error tracking | 🔴 Critical gap | Critical |
| CI/CD | ❌ No pipeline | 🔴 Needed | High |
| Testing | ❌ No test suite | 🔴 High risk | High |
| File Storage | ❌ No Supabase Storage configured | 🔴 Needed | High |
| GDPR/Compliance | ❌ No data export/deletion | ⚠️ Required for EU | Medium |

---

### Critical SaaS Gaps (Must Fix Before Launch)

#### 1. 🔴 Global Payment Gateway (Stripe)
- **Problem**: Razorpay only works in India
- **Solution**: Integrate Stripe Checkout + Customer Portal + Webhooks
- **Keep**: Razorpay as alternate for Indian customers via geo-detection (already has ipapi.co)
- **Work**: New edge functions for Stripe, webhook handler for subscription lifecycle

#### 2. 🔴 Subscription Lifecycle Management
- **Problem**: No auto-renewal, no expiration enforcement, no webhooks
- **Solution**: Webhook-driven status updates, grace periods, dunning, upgrade/downgrade flows
- **New Tables**: `subscription_plans`, `invoices`

#### 3. 🔴 Email/Notification System
- **Problem**: No transactional emails, no in-app notifications
- **Solution**: Integrate Resend or SendGrid for emails, build in-app notification system
- **Emails Needed**: Welcome, password reset, payment receipt, subscription alerts, ATS notifications
- **New Tables**: `notifications`, `notification_preferences`

#### 4. 🔴 Error Monitoring & Logging
- **Problem**: No visibility into production errors
- **Solution**: Integrate Sentry (frontend + Edge Functions), structured logging

#### 5. 🔴 Rate Limiting
- **Problem**: AI endpoints and public forms have no rate limits
- **Solution**: Per-user rate limiting on Edge Functions, CAPTCHA on public forms

---

### Important SaaS Improvements (Should Have)

#### 6. 🟡 OAuth / Social Login
- Add Google, LinkedIn, GitHub OAuth via Supabase Auth
- LinkedIn is critical for a resume/ATS platform

#### 7. 🟡 User Onboarding Flow
- Guided tour for first-time resume builders
- Profile completion prompts
- ATS setup wizard improvements

#### 8. 🟡 GDPR Compliance
- User data export (download all my data)
- Account deletion with cascade
- Cookie consent management
- Data Processing Agreement for ATS orgs

#### 9. 🟡 CI/CD Pipeline
- GitHub Actions: lint → test → build → deploy preview → deploy production
- Supabase CLI for migration management
- Environment-based deployments (staging → production)

#### 10. 🟡 Test Suite
- Unit tests for hooks and utilities
- Integration tests for Edge Functions
- E2E tests for critical flows (signup → build resume → save → export)

---

### Nice to Have (Post-Launch)

#### 11. 🟢 Advanced Analytics
- PostHog or Mixpanel integration
- Business metrics: MRR, churn, conversion
- ATS metrics: time-to-hire, funnel analytics

#### 12. 🟢 API Access & Integrations
- REST API for ATS integrations
- Webhooks for external tools (Slack, calendars)
- API key management

#### 13. 🟢 White-labeling for ATS
- Custom domains per organization
- Branded career pages
- Custom email templates

---

## 5. Phase 3: New Tables & Schema for SaaS

### Additional Tables Required

```
┌─────────────────────────────────────────────────────────────┐
│                    NEW TABLES FOR SAAS                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  BILLING & SUBSCRIPTIONS                                    │
│  ├── subscription_plans        (plan definitions & limits)  │
│  ├── invoices                  (billing records)            │
│                                                             │
│  NOTIFICATIONS                                              │
│  ├── notifications             (in-app notification queue)  │
│  └── notification_preferences  (channel preferences)        │
│                                                             │
│  FEATURE FLAGS & CONFIG                                     │
│  └── feature_flags             (per-plan feature toggles)   │
│                                                             │
│  AUDIT & COMPLIANCE                                         │
│  └── audit_logs                (system-wide audit trail)    │
│                                                             │
│  STORAGE BUCKETS (Supabase Storage, not tables)             │
│  ├── avatars                                                │
│  ├── resumes                                                │
│  ├── org-logos                                              │
│  └── offer-letters                                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### `subscription_plans`
```sql
CREATE TABLE public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price_inr INTEGER NOT NULL DEFAULT 0,
  price_usd INTEGER NOT NULL DEFAULT 0,
  billing_interval TEXT CHECK (billing_interval IN ('month', 'year', 'lifetime', 'free')),
  stripe_price_id TEXT,
  razorpay_plan_id TEXT,
  features JSONB DEFAULT '{}',
  limits JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### `invoices`
```sql
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  subscription_id UUID REFERENCES subscriptions(id),
  invoice_number TEXT UNIQUE NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'INR',
  tax_amount INTEGER DEFAULT 0,
  total_amount INTEGER NOT NULL,
  status TEXT CHECK (status IN ('draft', 'sent', 'paid', 'void', 'overdue')),
  payment_id UUID REFERENCES payments(id),
  pdf_url TEXT,
  due_date DATE,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### `notifications`
```sql
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  metadata JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;
```

#### `notification_preferences`
```sql
CREATE TABLE public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL,
  email_enabled BOOLEAN DEFAULT true,
  in_app_enabled BOOLEAN DEFAULT true,
  ats_new_application BOOLEAN DEFAULT true,
  ats_interview_scheduled BOOLEAN DEFAULT true,
  ats_offer_updates BOOLEAN DEFAULT true,
  billing_alerts BOOLEAN DEFAULT true,
  marketing_emails BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### `feature_flags`
```sql
CREATE TABLE public.feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  is_enabled BOOLEAN DEFAULT false,
  plan_requirements TEXT[] DEFAULT '{}',
  rollout_percentage INTEGER DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### `audit_logs`
```sql
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);
```

---

## 6. Phase 4: SaaS Pricing Model

### Resume Builder Plans

| Plan | Price (INR) | Price (USD) | Key Features |
|------|------------|------------|--------------|
| **Free** | ₹0 | $0 | 1 resume, 3 basic templates, no AI |
| **Pro Monthly** | ₹399 | $4.99 | Unlimited resumes, all templates, AI suggestions, PDF export, cloud backup |
| **Pro Yearly** | ₹2,999 | $39.99 | Everything in Pro Monthly + 2 months free + priority support |
| **Lifetime** | ₹3,999 | $49.99 | All Pro features forever, one-time payment |

### ATS Plans (Per Organization)

| Plan | Price (INR/mo) | Price (USD/mo) | Key Features |
|------|---------------|---------------|--------------|
| **Starter** | ₹1,499 | $19 | 2 active jobs, 3 team members, basic pipeline, email notifications |
| **Growth** | ₹3,999 | $49 | 10 active jobs, 10 members, AI scoring, talent pools, analytics |
| **Enterprise** | Custom | Custom | Unlimited jobs/members, custom career page, API access, SSO, dedicated support |

---

## 7. Phase 5: Execution Timeline

### Immediate (Day 1) — Database Rebuild
- [ ] Create new Supabase project
- [ ] Apply consolidated migration (22 tables + functions + triggers + RLS + seeds)
- [ ] Update `.env` with new credentials
- [ ] Deploy 8 Edge Functions
- [ ] Enable Supabase Auth (email/password)
- [ ] Enable Realtime on `site_settings`
- [ ] Verify app connects and runs locally

### Week 1 — Core SaaS Infrastructure
- [ ] Set up Supabase Storage buckets (avatars, resumes, org-logos, offer-letters)
- [ ] Add `subscription_plans` and `feature_flags` tables
- [ ] Implement plan-based feature gating
- [ ] Add `notifications` + `notification_preferences` tables
- [ ] Build basic in-app notification system
- [ ] Add `audit_logs` table

### Week 2 — Payments & Billing
- [ ] Integrate Stripe Checkout + Customer Portal
- [ ] Build Stripe webhook handler Edge Function
- [ ] Implement subscription lifecycle management
- [ ] Add invoice generation
- [ ] Keep Razorpay as India fallback with geo-detection
- [ ] Add `invoices` table

### Week 3 — Auth & Onboarding
- [ ] Add Google + LinkedIn OAuth providers
- [ ] Build user onboarding tour
- [ ] Add profile completion prompts
- [ ] Implement email verification flow
- [ ] Set up transactional email service (Resend/SendGrid)

### Week 4 — Production Hardening
- [ ] Integrate Sentry for error monitoring
- [ ] Add rate limiting on Edge Functions
- [ ] Implement GDPR compliance (data export, deletion)
- [ ] Set up CI/CD pipeline (GitHub Actions)
- [ ] Write critical path E2E tests
- [ ] Deploy to production (Vercel/Netlify + Supabase)

---

## 8. Edge Functions Reference

| Function | Purpose | Secrets Needed |
|----------|---------|---------------|
| `gemini-suggest` | AI resume content suggestions | `GEMINI_API_KEY` |
| `extract-resume-data` | PDF resume parsing via AI | `GEMINI_API_KEY` |
| `create-razorpay-order` | Create payment orders | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` |
| `verify-razorpay-payment` | Verify payment signatures | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` |
| `admin-list-users` | Admin: list all users | `SUPABASE_SERVICE_ROLE_KEY` |
| `admin-create-user` | Admin: create users | `SUPABASE_SERVICE_ROLE_KEY` |
| `admin-delete-user` | Admin: delete users | `SUPABASE_SERVICE_ROLE_KEY` |
| `admin-add-org-member` | Admin: add org members | `SUPABASE_SERVICE_ROLE_KEY` |

---

## 9. Environment Variables

### Frontend (.env)
```
VITE_SUPABASE_URL=<new_project_url>
VITE_SUPABASE_PUBLISHABLE_KEY=<new_anon_key>
VITE_SUPABASE_PROJECT_ID=<new_project_id>
```

### Supabase Edge Function Secrets
```
SUPABASE_URL=<new_project_url>
SUPABASE_SERVICE_ROLE_KEY=<new_service_role_key>
RAZORPAY_KEY_ID=<your_razorpay_key>
RAZORPAY_KEY_SECRET=<your_razorpay_secret>
GEMINI_API_KEY=<your_gemini_api_key>
```

---

## 10. Verification Plan

### Automated Tests
```bash
npm run build          # Verify no build errors
npm run dev            # Verify local dev server starts
```

### Manual Verification Checklist
- [ ] Sign up a new user → verify profile creation in DB
- [ ] Create a resume → save it → verify in `resumes` table
- [ ] Export resume as PDF → verify download
- [ ] Test AI suggestions (requires Gemini API key)
- [ ] Create ATS organization → add job posting
- [ ] Submit application via public form
- [ ] Test admin panel access (requires admin role in `user_roles`)
- [ ] Test Razorpay payment flow (test mode)
- [ ] Verify dark mode toggle
- [ ] Verify Realtime design mode toggle

---

## 11. Open Questions & Decisions

### Decision 1: Supabase Organization & Region
> Which Supabase organization should host the new project? Preferred region?

### Decision 2: Payment Gateway Priority
> Stripe integration for global reach now, or ship with Razorpay-only first?

### Decision 3: Hosting Platform
> Vercel, Netlify, or Docker-based hosting? What domain?

### Decision 4: API Keys Availability
> Do you have active Razorpay test keys and Google Gemini API key ready?

### Decision 5: Target Market
> India-first (keep Razorpay primary) or global launch (Stripe primary)?

### Decision 6: ATS Pricing
> Ship ATS as free beta first to build user base, or launch with paid plans immediately?
