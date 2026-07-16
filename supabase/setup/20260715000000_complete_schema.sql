-- ============================================================================
-- FlowCreate (ResumeForge) — Complete Consolidated Schema
-- Target: FRESH Supabase project (PostgreSQL 15+)
-- Generated: 2026-07-15
--
-- Replaces the 20 legacy incremental migrations (which are NOT self-contained:
-- resumes, user_roles, subscriptions, analytics_events, usage_limits and the
-- app_role enum were never created in them — they only existed in the old
-- project's base schema).
--
-- Contents:
--   §1  Extensions & session settings
--   §2  Enums
--   §3  Sequences & standalone functions
--   §4  Tables (31) — existing 23 (validated/fixed) + 8 new SaaS tables
--   §5  Indexes
--   §6  Views
--   §7  Table-dependent functions (roles, orgs, entitlements, sync, audit)
--   §8  Triggers (incl. handle_new_user on auth.users — was MISSING before)
--   §9  Row Level Security policies (every table)
--   §10 Storage buckets & storage policies
--   §11 Realtime publication
--   §12 Seed data (templates, settings, plans, feature flags)
--   §13 Scheduled jobs (pg_cron: subscription expiry)
--   §14 Post-install (manual steps, commented)
--
-- Contract-critical fixes vs the original IMPLEMENTATION_PLAN.md draft
-- (the frontend code was audited; these mismatches would have broken it):
--   * job_applications.status CHECK now matches code:
--       new/reviewing/shortlisted/interviewing/offered/hired/rejected/withdrawn
--   * job_offers.status CHECK includes 'declined' (code) not just 'rejected'
--   * application_reviews.recommendation CHECK is hire/neutral/reject (code)
--   * interviews.interview_type CHECK includes 'in-person' (code)
--   * organization_members.role CHECK includes 'member'
--     (admin-add-org-member edge function defaults to 'member')
--   * site_settings seed is {"mode":"default"} — the plan draft had
--     {"enabled": false}, which useDesignMode does not understand
--   * resume_templates seeds use the template_keys production actually had
--   * calculate_profile_completeness fixed (old version could never pass ~46%)
--   * handle_new_user trigger added (app expects a profiles row per user)
-- ============================================================================

SET check_function_bodies = off;

-- ============================================================================
-- §1 EXTENSIONS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================================
-- §2 ENUMS
-- ============================================================================
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- ============================================================================
-- §3 SEQUENCES & STANDALONE FUNCTIONS
-- ============================================================================
CREATE SEQUENCE IF NOT EXISTS public.invoice_number_seq;

CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TEXT LANGUAGE sql VOLATILE SET search_path = public AS $$
  SELECT 'INV-' || to_char(now() AT TIME ZONE 'UTC', 'YYYYMM') || '-'
         || lpad(nextval('public.invoice_number_seq')::text, 6, '0');
$$;

-- Single generic updated_at maintainer (consolidates the legacy trio:
-- update_updated_at_column / update_ats_updated_at / update_profiles_updated_at)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fixed completeness calculator: 12 checks / 12 total (legacy version divided
-- 7 checks by 15 and could never exceed ~46%).
CREATE OR REPLACE FUNCTION public.calculate_profile_completeness(profile_data JSONB)
RETURNS INTEGER LANGUAGE plpgsql IMMUTABLE SET search_path = public AS $$
DECLARE
  total_fields INTEGER := 12;
  filled_fields INTEGER := 0;
BEGIN
  IF COALESCE(profile_data->>'full_name', '') <> '' THEN filled_fields := filled_fields + 1; END IF;
  IF COALESCE(profile_data->>'email', '') <> '' THEN filled_fields := filled_fields + 1; END IF;
  IF COALESCE(profile_data->>'phone', '') <> '' THEN filled_fields := filled_fields + 1; END IF;
  IF COALESCE(profile_data->>'professional_summary', '') <> '' THEN filled_fields := filled_fields + 1; END IF;
  IF COALESCE(profile_data->>'current_position', '') <> '' THEN filled_fields := filled_fields + 1; END IF;
  IF COALESCE(profile_data->>'industry', '') <> '' THEN filled_fields := filled_fields + 1; END IF;
  IF jsonb_typeof(profile_data->'technical_skills') = 'array' AND jsonb_array_length(profile_data->'technical_skills') > 0 THEN filled_fields := filled_fields + 1; END IF;
  IF jsonb_typeof(profile_data->'work_experience') = 'array' AND jsonb_array_length(profile_data->'work_experience') > 0 THEN filled_fields := filled_fields + 1; END IF;
  IF jsonb_typeof(profile_data->'education') = 'array' AND jsonb_array_length(profile_data->'education') > 0 THEN filled_fields := filled_fields + 1; END IF;
  IF jsonb_typeof(profile_data->'projects') = 'array' AND jsonb_array_length(profile_data->'projects') > 0 THEN filled_fields := filled_fields + 1; END IF;
  IF jsonb_typeof(profile_data->'certifications') = 'array' AND jsonb_array_length(profile_data->'certifications') > 0 THEN filled_fields := filled_fields + 1; END IF;
  IF COALESCE(profile_data->>'linkedin_url', '') <> '' THEN filled_fields := filled_fields + 1; END IF;
  RETURN (filled_fields * 100) / total_fields;
END;
$$;

-- ============================================================================
-- §4 TABLES
-- Order is dependency-safe. All user_id columns now reference auth.users so
-- account deletion cascades cleanly (financial records use SET NULL instead,
-- to preserve accounting history).
-- ============================================================================

-- 4.1 profiles ---------------------------------------------------------------
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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
  experience_level TEXT CHECK (experience_level IS NULL OR experience_level IN ('entry', 'mid', 'senior', 'executive')),
  technical_skills JSONB NOT NULL DEFAULT '[]',
  soft_skills JSONB NOT NULL DEFAULT '[]',
  languages JSONB NOT NULL DEFAULT '[]',
  work_experience JSONB NOT NULL DEFAULT '[]',
  education JSONB NOT NULL DEFAULT '[]',
  projects JSONB NOT NULL DEFAULT '[]',
  certifications JSONB NOT NULL DEFAULT '[]',
  achievements JSONB NOT NULL DEFAULT '[]',
  volunteer_experience JSONB NOT NULL DEFAULT '[]',
  profile_completeness INTEGER NOT NULL DEFAULT 0 CHECK (profile_completeness BETWEEN 0 AND 100),
  last_resume_sync TIMESTAMPTZ,
  auto_sync_enabled BOOLEAN NOT NULL DEFAULT true,
  is_discoverable BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4.2 resumes ----------------------------------------------------------------
CREATE TABLE public.resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resume_data JSONB NOT NULL,
  template_id TEXT NOT NULL DEFAULT 'modern',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4.3 subscription_plans (NEW) — the pricing source of truth ------------------
-- Prices stored in minor units (paise / cents). `limits` drives feature gating.
CREATE TABLE public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product TEXT NOT NULL DEFAULT 'resume' CHECK (product IN ('resume', 'ats')),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price_inr INTEGER NOT NULL DEFAULT 0 CHECK (price_inr >= 0),   -- paise
  price_usd INTEGER NOT NULL DEFAULT 0 CHECK (price_usd >= 0),   -- cents
  billing_interval TEXT NOT NULL CHECK (billing_interval IN ('month', 'year', 'lifetime', 'free')),
  trial_days INTEGER NOT NULL DEFAULT 0 CHECK (trial_days >= 0),
  stripe_price_id TEXT,
  razorpay_plan_id TEXT,
  features JSONB NOT NULL DEFAULT '[]',
  limits JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_public BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4.4 subscriptions (per-user; Resume Builder premium) ------------------------
-- CONTRACT: usePremiumStatus reads only is_premium; upserts use
-- onConflict:'user_id' — the UNIQUE(user_id) constraint is load-bearing.
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_premium BOOLEAN NOT NULL DEFAULT false,
  plan_type TEXT NOT NULL DEFAULT 'free' CHECK (plan_type IN ('free', 'monthly', 'yearly', 'lifetime')),
  plan_id UUID REFERENCES public.subscription_plans(id) ON DELETE SET NULL,
  provider TEXT CHECK (provider IS NULL OR provider IN ('razorpay', 'stripe', 'manual')),
  razorpay_customer_id TEXT,
  razorpay_payment_id TEXT,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'trialing', 'past_due', 'canceled', 'expired')),
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4.5 user_roles ---------------------------------------------------------------
-- UNIQUE(user_id, role) added: prevents duplicate role rows that made
-- get_user_role() nondeterministic.
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- 4.6 usage_limits -------------------------------------------------------------
CREATE TABLE public.usage_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resumes_created INTEGER NOT NULL DEFAULT 0,
  ai_requests INTEGER NOT NULL DEFAULT 0,
  templates_used TEXT[] NOT NULL DEFAULT '{}',
  last_reset_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4.7 analytics_events ---------------------------------------------------------
CREATE TABLE public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL,
  event_properties JSONB,
  user_id UUID,
  session_id TEXT,
  page_url TEXT,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4.8 ai_api_keys ---------------------------------------------------------------
-- NOTE: keys are stored plaintext today (read by _shared/aiKeyManager.ts with
-- the service role). Consider Supabase Vault for at-rest encryption later.
CREATE TABLE public.ai_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('openai', 'gemini', 'deepseek')),
  key TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  is_fallback BOOLEAN NOT NULL DEFAULT false,
  usage_count INTEGER NOT NULL DEFAULT 0,
  last_used TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4.9 ai_token_usage -------------------------------------------------------------
CREATE TABLE public.ai_token_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT UNIQUE NOT NULL,
  total_tokens INTEGER NOT NULL DEFAULT 0,
  tokens_today INTEGER NOT NULL DEFAULT 0,
  tokens_this_month INTEGER NOT NULL DEFAULT 0,
  cost_estimate DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4.10 site_settings --------------------------------------------------------------
CREATE TABLE public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4.11 resume_templates ------------------------------------------------------------
CREATE TABLE public.resume_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  template_key TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  preview_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_ats_optimized BOOLEAN NOT NULL DEFAULT false,
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4.12 payments ---------------------------------------------------------------------
-- Razorpay columns are nullable now so Stripe payments fit the same table.
-- user_id uses SET NULL (keep financial history after account deletion).
-- The plain UNIQUE index on razorpay_payment_id is required by the
-- verify-razorpay-payment upsert (onConflict:'razorpay_payment_id').
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  provider TEXT NOT NULL DEFAULT 'razorpay' CHECK (provider IN ('razorpay', 'stripe', 'manual')),
  razorpay_payment_id TEXT,
  razorpay_order_id TEXT,
  stripe_payment_intent_id TEXT,
  stripe_checkout_session_id TEXT,
  amount INTEGER NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL,
  payment_method TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Both indexes are non-partial so PostgREST upserts (onConflict) can target
-- them; NULLs are distinct in Postgres unique indexes, so rows from the other
-- provider (NULL in that column) never collide.
CREATE UNIQUE INDEX uniq_payments_razorpay_payment_id ON public.payments (razorpay_payment_id);
CREATE UNIQUE INDEX uniq_payments_stripe_payment_intent ON public.payments (stripe_payment_intent_id);

-- 4.13 invoices (NEW) -----------------------------------------------------------------
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  organization_id UUID,  -- FK added after organizations is created
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
  invoice_number TEXT UNIQUE NOT NULL DEFAULT public.generate_invoice_number(),
  amount INTEGER NOT NULL CHECK (amount >= 0),
  tax_amount INTEGER NOT NULL DEFAULT 0 CHECK (tax_amount >= 0),
  total_amount INTEGER NOT NULL CHECK (total_amount >= 0),
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'void', 'overdue')),
  pdf_url TEXT,
  due_date DATE,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4.14 organizations ------------------------------------------------------------------
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  industry TEXT,
  company_size TEXT,
  logo_url TEXT,
  website_url TEXT,
  description TEXT,
  settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.invoices
  ADD CONSTRAINT invoices_organization_id_fkey
  FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE SET NULL;

-- 4.15 organization_members ------------------------------------------------------------
-- 'member' added to the role CHECK: the admin-add-org-member edge function
-- inserts role 'member' when none is given; the old CHECK would have rejected it.
CREATE TABLE public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'hiring_manager', 'recruiter', 'interviewer', 'viewer', 'member')),
  department TEXT,
  invited_by UUID,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (organization_id, user_id)
);

-- 4.16 departments -----------------------------------------------------------------------
CREATE TABLE public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (organization_id, name)
);

-- 4.17 jobs -------------------------------------------------------------------------------
CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT,
  responsibilities TEXT,
  location TEXT,
  job_type TEXT CHECK (job_type IS NULL OR job_type IN ('full_time', 'part_time', 'contract', 'internship', 'freelance')),
  experience_level TEXT CHECK (experience_level IS NULL OR experience_level IN ('entry', 'mid', 'senior', 'lead', 'executive')),
  salary_min INTEGER CHECK (salary_min IS NULL OR salary_min >= 0),
  salary_max INTEGER CHECK (salary_max IS NULL OR salary_max >= 0),
  salary_currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'active', 'paused', 'closed', 'archived')),
  hiring_managers UUID[] NOT NULL DEFAULT '{}',
  recruiters UUID[] NOT NULL DEFAULT '{}',
  settings JSONB NOT NULL DEFAULT '{}',
  published_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT jobs_salary_range_check CHECK (salary_min IS NULL OR salary_max IS NULL OR salary_max >= salary_min)
);

-- 4.18 pipeline_stages ----------------------------------------------------------------------
-- UNIQUE is DEFERRABLE so stage reordering can swap stage_order values in one tx.
CREATE TABLE public.pipeline_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  stage_order INTEGER NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  color TEXT NOT NULL DEFAULT '#6366f1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (job_id, stage_order) DEFERRABLE INITIALLY IMMEDIATE
);

-- 4.19 job_applications -----------------------------------------------------------------------
-- status CHECK matches the values the frontend actually writes.
-- UNIQUE(job_id, candidate_email) prevents duplicate applications (new).
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
  application_data JSONB NOT NULL DEFAULT '{}',
  current_stage_id UUID REFERENCES public.pipeline_stages(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewing', 'shortlisted', 'interviewing', 'offered', 'hired', 'rejected', 'withdrawn')),
  source TEXT,
  rating INTEGER CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),
  tags TEXT[] NOT NULL DEFAULT '{}',
  ai_match_score INTEGER CHECK (ai_match_score IS NULL OR (ai_match_score >= 0 AND ai_match_score <= 100)),
  ai_summary TEXT,
  assigned_to UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (job_id, candidate_email)
);

-- 4.20 application_reviews -----------------------------------------------------------------------
-- recommendation CHECK matches frontend values (hire/neutral/reject); the old
-- strong_yes/yes/maybe/no/strong_no set would have rejected every insert.
CREATE TABLE public.application_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.job_applications(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL,
  rating INTEGER CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),
  feedback TEXT,
  recommendation TEXT CHECK (recommendation IS NULL OR recommendation IN ('hire', 'neutral', 'reject')),
  criteria_scores JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4.21 interviews ----------------------------------------------------------------------------------
-- 'in-person' added to interview_type (frontend uses it; legacy CHECK had 'onsite').
CREATE TABLE public.interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.job_applications(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  interview_type TEXT CHECK (interview_type IS NULL OR interview_type IN ('phone', 'video', 'in-person', 'onsite', 'technical', 'behavioral', 'panel')),
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60 CHECK (duration_minutes > 0),
  location TEXT,
  meeting_link TEXT,
  interviewers UUID[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
  feedback TEXT,
  notes TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4.22 job_offers -----------------------------------------------------------------------------------
-- 'declined' added (frontend value); 'rejected' kept for legacy data compatibility.
CREATE TABLE public.job_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.job_applications(id) ON DELETE CASCADE,
  job_title TEXT NOT NULL,
  salary_amount INTEGER NOT NULL CHECK (salary_amount >= 0),
  salary_currency TEXT NOT NULL DEFAULT 'USD',
  benefits TEXT,
  start_date DATE,
  offer_letter_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'declined', 'rejected', 'expired', 'withdrawn')),
  sent_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4.23 ats_activities ---------------------------------------------------------------------------------
CREATE TABLE public.ats_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4.24 talent_pools ------------------------------------------------------------------------------------
CREATE TABLE public.talent_pools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4.25 talent_pool_candidates ---------------------------------------------------------------------------
CREATE TABLE public.talent_pool_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  talent_pool_id UUID NOT NULL REFERENCES public.talent_pools(id) ON DELETE CASCADE,
  application_id UUID REFERENCES public.job_applications(id) ON DELETE SET NULL,
  candidate_email TEXT NOT NULL,
  candidate_name TEXT NOT NULL,
  notes TEXT,
  added_by UUID NOT NULL,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (talent_pool_id, candidate_email)
);

-- 4.26 organization_subscriptions (NEW) — ATS billing is PER ORGANIZATION -------------------------------
-- The per-user subscriptions table monetizes the Resume Builder; this table
-- monetizes the ATS. One row per org; service role/webhooks write it.
CREATE TABLE public.organization_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID UNIQUE NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.subscription_plans(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'trialing' CHECK (status IN ('trialing', 'active', 'past_due', 'canceled', 'expired')),
  provider TEXT CHECK (provider IS NULL OR provider IN ('razorpay', 'stripe', 'manual')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  razorpay_subscription_id TEXT,
  seats INTEGER NOT NULL DEFAULT 3 CHECK (seats > 0),
  trial_ends_at TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4.27 notifications (NEW) --------------------------------------------------------------------------------
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  action_url TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4.28 notification_preferences (NEW) -----------------------------------------------------------------------
CREATE TABLE public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_enabled BOOLEAN NOT NULL DEFAULT true,
  in_app_enabled BOOLEAN NOT NULL DEFAULT true,
  ats_new_application BOOLEAN NOT NULL DEFAULT true,
  ats_interview_scheduled BOOLEAN NOT NULL DEFAULT true,
  ats_offer_updates BOOLEAN NOT NULL DEFAULT true,
  billing_alerts BOOLEAN NOT NULL DEFAULT true,
  marketing_emails BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4.29 feature_flags (NEW) -------------------------------------------------------------------------------------
CREATE TABLE public.feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  plan_requirements TEXT[] NOT NULL DEFAULT '{}',
  rollout_percentage INTEGER NOT NULL DEFAULT 100 CHECK (rollout_percentage BETWEEN 0 AND 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4.30 audit_logs (NEW) ----------------------------------------------------------------------------------------
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4.31 webhook_events (NEW) — idempotency ledger for payment webhooks -------------------------------------------
-- Every Stripe/Razorpay webhook first INSERTs here; a conflict on
-- (provider, event_id) means "already processed — return 200 and skip".
CREATE TABLE public.webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL CHECK (provider IN ('stripe', 'razorpay')),
  event_id TEXT NOT NULL,
  event_type TEXT,
  payload JSONB,
  status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'processed', 'failed')),
  error TEXT,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ,
  UNIQUE (provider, event_id)
);

-- ============================================================================
-- §5 INDEXES (beyond PK/UNIQUE)
-- ============================================================================
CREATE INDEX idx_resumes_user ON public.resumes (user_id);
CREATE INDEX idx_payments_user ON public.payments (user_id);
CREATE INDEX idx_payments_subscription ON public.payments (subscription_id);
CREATE INDEX idx_invoices_user ON public.invoices (user_id);
CREATE INDEX idx_invoices_org ON public.invoices (organization_id);
CREATE INDEX idx_analytics_events_created ON public.analytics_events (created_at DESC);
CREATE INDEX idx_analytics_events_user ON public.analytics_events (user_id);
CREATE INDEX idx_analytics_events_name ON public.analytics_events (event_name);
CREATE INDEX idx_org_members_user ON public.organization_members (user_id);
CREATE INDEX idx_org_members_org ON public.organization_members (organization_id);
CREATE INDEX idx_departments_org ON public.departments (organization_id);
CREATE INDEX idx_jobs_org ON public.jobs (organization_id);
CREATE INDEX idx_jobs_status ON public.jobs (status);
CREATE INDEX idx_jobs_org_status ON public.jobs (organization_id, status);
CREATE INDEX idx_jobs_department ON public.jobs (department_id);
CREATE INDEX idx_pipeline_stages_job ON public.pipeline_stages (job_id);
CREATE INDEX idx_applications_job ON public.job_applications (job_id);
CREATE INDEX idx_applications_status ON public.job_applications (status);
CREATE INDEX idx_applications_email ON public.job_applications (candidate_email);
CREATE INDEX idx_applications_stage ON public.job_applications (current_stage_id);
CREATE INDEX idx_applications_resume ON public.job_applications (resume_id);
CREATE INDEX idx_reviews_application ON public.application_reviews (application_id);
CREATE INDEX idx_interviews_application ON public.interviews (application_id);
CREATE INDEX idx_interviews_scheduled ON public.interviews (scheduled_at);
CREATE INDEX idx_offers_application ON public.job_offers (application_id);
CREATE INDEX idx_activities_org ON public.ats_activities (organization_id);
CREATE INDEX idx_activities_created ON public.ats_activities (created_at DESC);
CREATE INDEX idx_talent_pools_org ON public.talent_pools (organization_id);
CREATE INDEX idx_tp_candidates_pool ON public.talent_pool_candidates (talent_pool_id);
CREATE INDEX idx_tp_candidates_application ON public.talent_pool_candidates (application_id);
CREATE INDEX idx_notifications_user ON public.notifications (user_id);
CREATE INDEX idx_notifications_unread ON public.notifications (user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_audit_logs_user ON public.audit_logs (user_id);
CREATE INDEX idx_audit_logs_resource ON public.audit_logs (resource_type, resource_id);
CREATE INDEX idx_audit_logs_created ON public.audit_logs (created_at DESC);
CREATE INDEX idx_profiles_discoverable ON public.profiles (is_discoverable) WHERE is_discoverable = true;

-- ============================================================================
-- §6 VIEWS
-- ============================================================================
CREATE VIEW public.discoverable_candidates WITH (security_invoker = on) AS
SELECT
  id, user_id, full_name, current_position, industry, experience_level,
  professional_summary, technical_skills, soft_skills,
  city, state, country,
  education, work_experience, certifications, projects, languages,
  avatar_url, linkedin_url, github_url, portfolio_url,
  profile_completeness, created_at, updated_at
FROM public.profiles
WHERE is_discoverable = true AND full_name IS NOT NULL AND full_name <> '';

-- ============================================================================
-- §7 TABLE-DEPENDENT FUNCTIONS
-- All SECURITY DEFINER functions pin search_path = public (prevents
-- search-path hijacking) and exist so RLS policies never self-recurse.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin');
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin');
$$;

CREATE OR REPLACE FUNCTION public.get_user_role(p_user_id UUID)
RETURNS public.app_role LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT role FROM user_roles WHERE user_id = p_user_id
  ORDER BY CASE role WHEN 'admin' THEN 1 WHEN 'moderator' THEN 2 ELSE 3 END
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_org_member(p_org_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_id = p_org_id AND user_id = auth.uid()
  );
$$;

-- Hierarchical org-role check (improvement over the legacy exact-match:
-- owner >= admin >= hiring_manager >= recruiter >= interviewer >= viewer/member).
CREATE OR REPLACE FUNCTION public.has_org_role(p_org_id UUID, p_required_role TEXT)
RETURNS BOOLEAN LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_role TEXT;
  v_rank INTEGER;
  v_required_rank INTEGER;
BEGIN
  SELECT role INTO v_role FROM organization_members
  WHERE organization_id = p_org_id AND user_id = auth.uid();
  IF v_role IS NULL THEN
    RETURN false;
  END IF;
  v_rank := CASE v_role
    WHEN 'owner' THEN 6 WHEN 'admin' THEN 5 WHEN 'hiring_manager' THEN 4
    WHEN 'recruiter' THEN 3 WHEN 'interviewer' THEN 2 ELSE 1 END;
  v_required_rank := CASE p_required_role
    WHEN 'owner' THEN 6 WHEN 'admin' THEN 5 WHEN 'hiring_manager' THEN 4
    WHEN 'recruiter' THEN 3 WHEN 'interviewer' THEN 2 ELSE 1 END;
  RETURN v_rank >= v_required_rank;
END;
$$;

-- Used by the organization_members bootstrap INSERT policy (avoids RLS
-- self-recursion when checking "does this org have any members yet?").
CREATE OR REPLACE FUNCTION public.org_has_members(p_org_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM organization_members WHERE organization_id = p_org_id);
$$;

-- Auto-provisioning on signup (was completely missing from the legacy setup).
-- Deliberately does NOT insert into subscriptions: the admin-create-user edge
-- function does a plain INSERT there and would hit a unique-key conflict.
-- usePremiumStatus treats a missing row as free tier, so this is safe.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (
    NEW.id,
    NULLIF(TRIM(COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      CONCAT(NEW.raw_user_meta_data->>'first_name', ' ', NEW.raw_user_meta_data->>'last_name')
    )), ''),
    NEW.email
  )
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.usage_limits (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Keeps profile.last_resume_sync fresh and seeds a profile from the first
-- resume when none exists.
CREATE OR REPLACE FUNCTION public.sync_resume_to_profile()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_personal JSONB;
BEGIN
  v_personal := COALESCE(NEW.resume_data->'personal', '{}'::jsonb);
  INSERT INTO public.profiles (user_id, full_name, email, phone, last_resume_sync)
  VALUES (
    NEW.user_id,
    NULLIF(v_personal->>'name', ''),
    NULLIF(v_personal->>'email', ''),
    NULLIF(v_personal->>'phone', ''),
    now()
  )
  ON CONFLICT (user_id) DO UPDATE
    SET last_resume_sync = now(), updated_at = now()
    WHERE profiles.auto_sync_enabled = true;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_profile_completeness()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.profile_completeness := public.calculate_profile_completeness(to_jsonb(NEW));
  RETURN NEW;
END;
$$;

-- Entitlements: single source of truth for plan gating. Frontend/edge
-- functions can call these instead of hardcoding limits.
CREATE OR REPLACE FUNCTION public.get_user_entitlements(p_user_id UUID DEFAULT auth.uid())
RETURNS JSONB LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_sub subscriptions%ROWTYPE;
  v_plan subscription_plans%ROWTYPE;
BEGIN
  SELECT * INTO v_sub FROM subscriptions WHERE user_id = p_user_id;

  IF v_sub.id IS NOT NULL AND v_sub.is_premium THEN
    SELECT * INTO v_plan FROM subscription_plans
    WHERE product = 'resume' AND (id = v_sub.plan_id OR slug = v_sub.plan_type)
    ORDER BY (id = v_sub.plan_id) DESC NULLS LAST
    LIMIT 1;
  END IF;

  IF v_plan.id IS NULL THEN
    -- If the user is flagged premium but no plan row matched (e.g. manual admin
    -- grant), give them monthly limits rather than free limits so they aren't
    -- silently under-served.
    IF v_sub.is_premium THEN
      SELECT * INTO v_plan FROM subscription_plans WHERE product = 'resume' AND slug = 'monthly';
    END IF;
    IF v_plan.id IS NULL THEN
      SELECT * INTO v_plan FROM subscription_plans WHERE product = 'resume' AND slug = 'free';
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'plan', COALESCE(v_plan.slug, 'free'),
    'is_premium', COALESCE(v_sub.is_premium, false),
    'status', COALESCE(v_sub.status, 'active'),
    'current_period_end', v_sub.current_period_end,
    'limits', COALESCE(v_plan.limits, '{}'::jsonb),
    'features', COALESCE(v_plan.features, '[]'::jsonb)
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_org_entitlements(p_org_id UUID)
RETURNS JSONB LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_sub organization_subscriptions%ROWTYPE;
  v_plan subscription_plans%ROWTYPE;
BEGIN
  SELECT * INTO v_sub FROM organization_subscriptions WHERE organization_id = p_org_id;

  IF v_sub.id IS NOT NULL AND v_sub.status IN ('trialing', 'active', 'past_due') THEN
    SELECT * INTO v_plan FROM subscription_plans WHERE id = v_sub.plan_id;
  END IF;

  IF v_plan.id IS NULL THEN
    SELECT * INTO v_plan FROM subscription_plans WHERE product = 'ats' AND slug = 'ats-free';
  END IF;

  RETURN jsonb_build_object(
    'plan', COALESCE(v_plan.slug, 'ats-free'),
    'status', COALESCE(v_sub.status, 'active'),
    'seats', COALESCE(v_sub.seats, 3),
    'current_period_end', v_sub.current_period_end,
    'limits', COALESCE(v_plan.limits, '{}'::jsonb),
    'features', COALESCE(v_plan.features, '[]'::jsonb)
  );
END;
$$;

-- Nightly/hourly downgrade of lapsed subscriptions (3-day grace period).
-- The frontend only reads is_premium, so this is what actually ends access.
CREATE OR REPLACE FUNCTION public.expire_subscriptions()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE subscriptions
  SET is_premium = false, status = 'expired', updated_at = now()
  WHERE is_premium = true
    AND plan_type <> 'lifetime'
    AND current_period_end IS NOT NULL
    AND current_period_end < now() - INTERVAL '3 days'
    AND status <> 'expired';

  UPDATE organization_subscriptions
  SET status = 'expired', updated_at = now()
  WHERE status IN ('trialing', 'active', 'past_due')
    AND COALESCE(current_period_end, trial_ends_at) IS NOT NULL
    AND COALESCE(current_period_end, trial_ends_at) < now() - INTERVAL '3 days';

  UPDATE job_offers
  SET status = 'expired', updated_at = now()
  WHERE status = 'sent' AND expires_at IS NOT NULL AND expires_at < now();
END;
$$;

-- Generic audit trigger for sensitive tables.
CREATE OR REPLACE FUNCTION public.fn_audit()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.audit_logs (user_id, action, resource_type, resource_id, old_values, new_values)
  VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(
      CASE WHEN TG_OP = 'DELETE' THEN OLD.id ELSE NEW.id END
    ),
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- ============================================================================
-- §8 TRIGGERS
-- ============================================================================

-- Auto-provision on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at maintenance
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_resumes_updated_at BEFORE UPDATE ON public.resumes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON public.subscription_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_usage_limits_updated_at BEFORE UPDATE ON public.usage_limits FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_ai_api_keys_updated_at BEFORE UPDATE ON public.ai_api_keys FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_ai_token_usage_updated_at BEFORE UPDATE ON public.ai_token_usage FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_resume_templates_updated_at BEFORE UPDATE ON public.resume_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON public.job_applications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.application_reviews FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_interviews_updated_at BEFORE UPDATE ON public.interviews FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_offers_updated_at BEFORE UPDATE ON public.job_offers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_talent_pools_updated_at BEFORE UPDATE ON public.talent_pools FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_org_subscriptions_updated_at BEFORE UPDATE ON public.organization_subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_notification_prefs_updated_at BEFORE UPDATE ON public.notification_preferences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_feature_flags_updated_at BEFORE UPDATE ON public.feature_flags FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Profile completeness (fires before update_profiles_updated_at alphabetically;
-- both are BEFORE triggers so ordering is harmless either way)
CREATE TRIGGER set_profile_completeness_trigger BEFORE INSERT OR UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_profile_completeness();

-- Resume → profile sync
CREATE TRIGGER sync_resume_to_profile_trigger AFTER INSERT OR UPDATE ON public.resumes FOR EACH ROW EXECUTE FUNCTION public.sync_resume_to_profile();

-- Audit sensitive tables
CREATE TRIGGER audit_user_roles AFTER INSERT OR UPDATE OR DELETE ON public.user_roles FOR EACH ROW EXECUTE FUNCTION public.fn_audit();
CREATE TRIGGER audit_subscriptions AFTER INSERT OR UPDATE OR DELETE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.fn_audit();
CREATE TRIGGER audit_org_subscriptions AFTER INSERT OR UPDATE OR DELETE ON public.organization_subscriptions FOR EACH ROW EXECUTE FUNCTION public.fn_audit();

-- ============================================================================
-- §9 ROW LEVEL SECURITY
-- Conventions: (SELECT auth.uid()) is used instead of bare auth.uid() so the
-- planner evaluates it once per statement (InitPlan) instead of per row.
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_token_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
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
ALTER TABLE public.organization_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
-- webhook_events + audit_logs writes: service role only (no policies needed).

-- profiles --------------------------------------------------------------------
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));
CREATE POLICY "Users can create their own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (user_id = (SELECT auth.uid()));
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "Org members can view discoverable candidates" ON public.profiles
  FOR SELECT TO authenticated USING (
    is_discoverable = true
    AND EXISTS (SELECT 1 FROM public.organization_members om WHERE om.user_id = (SELECT auth.uid()))
  );

-- resumes ---------------------------------------------------------------------
CREATE POLICY "Users can view their own resumes" ON public.resumes
  FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));
CREATE POLICY "Users can create their own resumes" ON public.resumes
  FOR INSERT TO authenticated WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY "Users can update their own resumes" ON public.resumes
  FOR UPDATE TO authenticated USING (user_id = (SELECT auth.uid()));
CREATE POLICY "Users can delete their own resumes" ON public.resumes
  FOR DELETE TO authenticated USING (user_id = (SELECT auth.uid()));

-- subscription_plans -------------------------------------------------------------
CREATE POLICY "Anyone can view active public plans" ON public.subscription_plans
  FOR SELECT TO anon, authenticated USING (is_active = true AND is_public = true);
CREATE POLICY "Admins can manage plans" ON public.subscription_plans
  FOR ALL TO authenticated USING (public.is_admin());

-- subscriptions -------------------------------------------------------------------
CREATE POLICY "subscriptions_owner_select" ON public.subscriptions
  FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));
CREATE POLICY "subscriptions_admin_select" ON public.subscriptions
  FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "subscriptions_admin_insert" ON public.subscriptions
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "subscriptions_admin_update" ON public.subscriptions
  FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "subscriptions_admin_delete" ON public.subscriptions
  FOR DELETE TO authenticated USING (public.is_admin());
-- (payment webhooks write via service role, which bypasses RLS)

-- user_roles ------------------------------------------------------------------------
CREATE POLICY "Users can view their own role" ON public.user_roles
  FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));
CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- usage_limits -------------------------------------------------------------------------
CREATE POLICY "Users can view their own limits" ON public.usage_limits
  FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));
CREATE POLICY "Users can create their own limits" ON public.usage_limits
  FOR INSERT TO authenticated WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY "Users can update their own limits" ON public.usage_limits
  FOR UPDATE TO authenticated USING (user_id = (SELECT auth.uid()));

-- analytics_events ------------------------------------------------------------------------
-- Tightened: legacy policy let anonymous users insert arbitrary rows.
-- Anonymous tracking should route through an edge function (service role).
CREATE POLICY "Authenticated users can insert analytics events" ON public.analytics_events
  FOR INSERT TO authenticated WITH CHECK (
    length(trim(event_name)) > 0
    AND (user_id IS NULL OR user_id = (SELECT auth.uid()))
  );
CREATE POLICY "Admins can view analytics" ON public.analytics_events
  FOR SELECT TO authenticated USING (public.is_admin());

-- ai_api_keys / ai_token_usage ----------------------------------------------------------------
CREATE POLICY "Only admins can manage AI API keys" ON public.ai_api_keys
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Only admins can manage AI token usage" ON public.ai_token_usage
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- site_settings ----------------------------------------------------------------------------------
CREATE POLICY "Public can read whitelisted settings" ON public.site_settings
  FOR SELECT TO anon, authenticated USING (
    setting_key IN ('design_mode', 'theme', 'language', 'public_features')
    OR public.is_admin()
  );
CREATE POLICY "Only admins can insert settings" ON public.site_settings
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Only admins can update settings" ON public.site_settings
  FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "Only admins can delete settings" ON public.site_settings
  FOR DELETE TO authenticated USING (public.is_admin());

-- resume_templates ----------------------------------------------------------------------------------
CREATE POLICY "Anyone can view active templates" ON public.resume_templates
  FOR SELECT TO anon, authenticated USING (is_active = true OR public.is_admin());
CREATE POLICY "Admins can manage templates" ON public.resume_templates
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- payments ---------------------------------------------------------------------------------------------
CREATE POLICY "payments_owner_select" ON public.payments
  FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));
CREATE POLICY "payments_admin_select" ON public.payments
  FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "payments_admin_insert" ON public.payments
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "payments_admin_update" ON public.payments
  FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "payments_admin_delete" ON public.payments
  FOR DELETE TO authenticated USING (public.is_admin());

-- invoices ----------------------------------------------------------------------------------------------
CREATE POLICY "Users can view their own invoices" ON public.invoices
  FOR SELECT TO authenticated USING (
    user_id = (SELECT auth.uid())
    OR (organization_id IS NOT NULL AND public.has_org_role(organization_id, 'admin'))
    OR public.is_admin()
  );
CREATE POLICY "Admins can manage invoices" ON public.invoices
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- organizations -------------------------------------------------------------------------------------------
CREATE POLICY "Org members can view their organization" ON public.organizations
  FOR SELECT TO authenticated USING (public.is_org_member(id));
CREATE POLICY "Anyone can view orgs with open jobs" ON public.organizations
  FOR SELECT TO anon, authenticated USING (
    EXISTS (
      SELECT 1 FROM public.jobs j
      WHERE j.organization_id = organizations.id AND j.status IN ('published', 'active')
    )
  );
CREATE POLICY "Authenticated users can create organizations" ON public.organizations
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Org owners can update their organization" ON public.organizations
  FOR UPDATE TO authenticated USING (public.has_org_role(id, 'owner'));
CREATE POLICY "Org owners can delete their organization" ON public.organizations
  FOR DELETE TO authenticated USING (public.has_org_role(id, 'owner'));
CREATE POLICY "Super admins can manage all organizations" ON public.organizations
  FOR ALL TO authenticated USING (public.is_super_admin());

-- organization_members ---------------------------------------------------------------------------------------
CREATE POLICY "Org members can view team members" ON public.organization_members
  FOR SELECT TO authenticated USING (public.is_org_member(organization_id));
CREATE POLICY "Org admins can manage team members" ON public.organization_members
  FOR ALL TO authenticated
  USING (public.has_org_role(organization_id, 'admin'))
  WITH CHECK (public.has_org_role(organization_id, 'admin'));
-- Bootstrap: the org creator adds themselves as first owner (legacy schema had
-- no path for this; onboarding relied on a hidden base-schema policy).
CREATE POLICY "Users can add themselves as first owner" ON public.organization_members
  FOR INSERT TO authenticated WITH CHECK (
    user_id = (SELECT auth.uid())
    AND role = 'owner'
    AND NOT public.org_has_members(organization_id)
  );
CREATE POLICY "Super admins can manage all org members" ON public.organization_members
  FOR ALL TO authenticated USING (public.is_super_admin());

-- departments ----------------------------------------------------------------------------------------------------
CREATE POLICY "Org members can view departments" ON public.departments
  FOR SELECT TO authenticated USING (public.is_org_member(organization_id));
CREATE POLICY "Org admins can manage departments" ON public.departments
  FOR ALL TO authenticated
  USING (public.has_org_role(organization_id, 'admin'))
  WITH CHECK (public.has_org_role(organization_id, 'admin'));
CREATE POLICY "Super admins can manage all departments" ON public.departments
  FOR ALL TO authenticated USING (public.is_super_admin());

-- jobs ------------------------------------------------------------------------------------------------------------
CREATE POLICY "Org members can view jobs" ON public.jobs
  FOR SELECT TO authenticated USING (public.is_org_member(organization_id));
CREATE POLICY "Anyone can view published jobs" ON public.jobs
  FOR SELECT TO anon, authenticated USING (status IN ('published', 'active'));
CREATE POLICY "Org members can create jobs" ON public.jobs
  FOR INSERT TO authenticated WITH CHECK (public.is_org_member(organization_id));
CREATE POLICY "Org members can update jobs" ON public.jobs
  FOR UPDATE TO authenticated USING (public.is_org_member(organization_id));
CREATE POLICY "Org admins can delete jobs" ON public.jobs
  FOR DELETE TO authenticated USING (public.has_org_role(organization_id, 'admin'));
CREATE POLICY "Super admins can manage all jobs" ON public.jobs
  FOR ALL TO authenticated USING (public.is_super_admin());

-- pipeline_stages ----------------------------------------------------------------------------------------------------
CREATE POLICY "Org members can view pipeline stages" ON public.pipeline_stages
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = pipeline_stages.job_id AND public.is_org_member(j.organization_id))
  );
CREATE POLICY "Org members can manage pipeline stages" ON public.pipeline_stages
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = pipeline_stages.job_id AND public.is_org_member(j.organization_id))
  );

-- job_applications ----------------------------------------------------------------------------------------------------
CREATE POLICY "Anyone can apply to published jobs" ON public.job_applications
  FOR INSERT TO anon, authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = job_applications.job_id AND j.status IN ('published', 'active'))
  );
CREATE POLICY "Org members can view applications" ON public.job_applications
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = job_applications.job_id AND public.is_org_member(j.organization_id))
  );
CREATE POLICY "Org members can update applications" ON public.job_applications
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = job_applications.job_id AND public.is_org_member(j.organization_id))
  );
CREATE POLICY "Org admins can delete applications" ON public.job_applications
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = job_applications.job_id AND public.has_org_role(j.organization_id, 'admin'))
  );
CREATE POLICY "Super admins can manage all applications" ON public.job_applications
  FOR ALL TO authenticated USING (public.is_super_admin());

-- application_reviews ----------------------------------------------------------------------------------------------------
CREATE POLICY "Org members can view reviews" ON public.application_reviews
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.job_applications a
      JOIN public.jobs j ON j.id = a.job_id
      WHERE a.id = application_reviews.application_id AND public.is_org_member(j.organization_id)
    )
  );
CREATE POLICY "Org members can create reviews" ON public.application_reviews
  FOR INSERT TO authenticated WITH CHECK (
    reviewer_id = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.job_applications a
      JOIN public.jobs j ON j.id = a.job_id
      WHERE a.id = application_reviews.application_id AND public.is_org_member(j.organization_id)
    )
  );
CREATE POLICY "Reviewers can update their own reviews" ON public.application_reviews
  FOR UPDATE TO authenticated USING (reviewer_id = (SELECT auth.uid()));
CREATE POLICY "Org admins can delete reviews" ON public.application_reviews
  FOR DELETE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.job_applications a
      JOIN public.jobs j ON j.id = a.job_id
      WHERE a.id = application_reviews.application_id AND public.has_org_role(j.organization_id, 'admin')
    )
  );

-- interviews ------------------------------------------------------------------------------------------------------------------
CREATE POLICY "Org members can manage interviews" ON public.interviews
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.job_applications a
      JOIN public.jobs j ON j.id = a.job_id
      WHERE a.id = interviews.application_id AND public.is_org_member(j.organization_id)
    )
  );
CREATE POLICY "Super admins can manage all interviews" ON public.interviews
  FOR ALL TO authenticated USING (public.is_super_admin());

-- job_offers -------------------------------------------------------------------------------------------------------------------
CREATE POLICY "Org members can manage offers" ON public.job_offers
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.job_applications a
      JOIN public.jobs j ON j.id = a.job_id
      WHERE a.id = job_offers.application_id AND public.is_org_member(j.organization_id)
    )
  );
CREATE POLICY "Super admins can manage all offers" ON public.job_offers
  FOR ALL TO authenticated USING (public.is_super_admin());

-- ats_activities (append-only for clients) ------------------------------------------------------------------------------------------
CREATE POLICY "Org members can view activities" ON public.ats_activities
  FOR SELECT TO authenticated USING (public.is_org_member(organization_id));
CREATE POLICY "Org members can log activities" ON public.ats_activities
  FOR INSERT TO authenticated WITH CHECK (
    public.is_org_member(organization_id) AND user_id = (SELECT auth.uid())
  );
CREATE POLICY "Super admins can manage all activities" ON public.ats_activities
  FOR ALL TO authenticated USING (public.is_super_admin());

-- talent_pools -----------------------------------------------------------------------------------------------------------------------
CREATE POLICY "Org members can manage talent pools" ON public.talent_pools
  FOR ALL TO authenticated
  USING (public.is_org_member(organization_id))
  WITH CHECK (public.is_org_member(organization_id));
CREATE POLICY "Super admins can manage all talent pools" ON public.talent_pools
  FOR ALL TO authenticated USING (public.is_super_admin());

-- talent_pool_candidates --------------------------------------------------------------------------------------------------------------
CREATE POLICY "Org members can manage pool candidates" ON public.talent_pool_candidates
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.talent_pools tp
      WHERE tp.id = talent_pool_candidates.talent_pool_id AND public.is_org_member(tp.organization_id)
    )
  );
CREATE POLICY "Super admins can manage all pool candidates" ON public.talent_pool_candidates
  FOR ALL TO authenticated USING (public.is_super_admin());

-- organization_subscriptions ----------------------------------------------------------------------------------------------------------
CREATE POLICY "Org members can view org subscription" ON public.organization_subscriptions
  FOR SELECT TO authenticated USING (public.is_org_member(organization_id));
CREATE POLICY "Admins can manage org subscriptions" ON public.organization_subscriptions
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- notifications --------------------------------------------------------------------------------------------------------------------------
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));
CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY "Users can delete their own notifications" ON public.notifications
  FOR DELETE TO authenticated USING (user_id = (SELECT auth.uid()));
-- (inserts come from edge functions via service role only)

-- notification_preferences ---------------------------------------------------------------------------------------------------------------
CREATE POLICY "Users can view their own notification prefs" ON public.notification_preferences
  FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));
CREATE POLICY "Users can create their own notification prefs" ON public.notification_preferences
  FOR INSERT TO authenticated WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY "Users can update their own notification prefs" ON public.notification_preferences
  FOR UPDATE TO authenticated USING (user_id = (SELECT auth.uid()));

-- feature_flags -----------------------------------------------------------------------------------------------------------------------------
CREATE POLICY "Anyone can read feature flags" ON public.feature_flags
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can manage feature flags" ON public.feature_flags
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- audit_logs ---------------------------------------------------------------------------------------------------------------------------------
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
  FOR SELECT TO authenticated USING (public.is_admin());

-- ============================================================================
-- §10 STORAGE BUCKETS & POLICIES
-- Path convention: user buckets use {user_id}/filename; org buckets use
-- {organization_id}/filename. Policies key off the first folder segment.
-- ============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) VALUES
  ('avatars',       'avatars',       true,  2097152,  ARRAY['image/png','image/jpeg','image/webp','image/gif']),
  ('org-logos',     'org-logos',     true,  2097152,  ARRAY['image/png','image/jpeg','image/webp','image/svg+xml']),
  ('resumes',       'resumes',       false, 10485760, ARRAY['application/pdf']),
  ('offer-letters', 'offer-letters', false, 10485760, ARRAY['application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- avatars (public bucket)
CREATE POLICY "Avatar images are publicly readable" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'avatars' AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );
CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE TO authenticated USING (
    bucket_id = 'avatars' AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );
CREATE POLICY "Users can delete their own avatar" ON storage.objects
  FOR DELETE TO authenticated USING (
    bucket_id = 'avatars' AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

-- org-logos (public bucket, org admins write)
CREATE POLICY "Org logos are publicly readable" ON storage.objects
  FOR SELECT USING (bucket_id = 'org-logos');
CREATE POLICY "Org admins can upload logos" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'org-logos' AND public.has_org_role(((storage.foldername(name))[1])::uuid, 'admin')
  );
CREATE POLICY "Org admins can update logos" ON storage.objects
  FOR UPDATE TO authenticated USING (
    bucket_id = 'org-logos' AND public.has_org_role(((storage.foldername(name))[1])::uuid, 'admin')
  );
CREATE POLICY "Org admins can delete logos" ON storage.objects
  FOR DELETE TO authenticated USING (
    bucket_id = 'org-logos' AND public.has_org_role(((storage.foldername(name))[1])::uuid, 'admin')
  );

-- resumes (private, owner-only)
CREATE POLICY "Users can read their own resume files" ON storage.objects
  FOR SELECT TO authenticated USING (
    bucket_id = 'resumes' AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );
CREATE POLICY "Users can upload their own resume files" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'resumes' AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );
CREATE POLICY "Users can update their own resume files" ON storage.objects
  FOR UPDATE TO authenticated USING (
    bucket_id = 'resumes' AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );
CREATE POLICY "Users can delete their own resume files" ON storage.objects
  FOR DELETE TO authenticated USING (
    bucket_id = 'resumes' AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

-- offer-letters (private, org-scoped)
CREATE POLICY "Org members can read offer letters" ON storage.objects
  FOR SELECT TO authenticated USING (
    bucket_id = 'offer-letters' AND public.is_org_member(((storage.foldername(name))[1])::uuid)
  );
CREATE POLICY "Org members can upload offer letters" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'offer-letters' AND public.is_org_member(((storage.foldername(name))[1])::uuid)
  );
CREATE POLICY "Org admins can delete offer letters" ON storage.objects
  FOR DELETE TO authenticated USING (
    bucket_id = 'offer-letters' AND public.has_org_role(((storage.foldername(name))[1])::uuid, 'admin')
  );

-- ============================================================================
-- §11 REALTIME
-- site_settings: live design-mode toggle (useDesignMode subscribes to UPDATE).
-- notifications: live in-app notification bell.
-- ============================================================================
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.site_settings;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- §12 SEED DATA
-- ============================================================================

-- Design mode: shape MUST be {"mode": ...} — useDesignMode reads setting_value.mode
INSERT INTO public.site_settings (setting_key, setting_value)
VALUES ('design_mode', '{"mode": "default"}')
ON CONFLICT (setting_key) DO NOTHING;

-- Resume templates (the 20 keys production actually used; the 7 keys the
-- builder renders are: modern, classic, creative, technical, professional,
-- minimalist, executive — all present)
INSERT INTO public.resume_templates (name, template_key, category, description, is_active, is_featured, is_ats_optimized) VALUES
('Executive Modern', 'modern', 'Professional', 'Clean and professional template with modern layout, perfect for senior executives', true, true, true),
('Corporate Classic', 'classic', 'Professional', 'Timeless design with traditional formatting, suitable for all industries', true, false, true),
('Business Elite', 'professional', 'Professional', 'Balanced and versatile template for professionals in any field', true, false, true),
('Software Engineer Pro', 'technical', 'Technology', 'Focused on technical skills with dedicated sections for projects', true, true, true),
('DevOps Specialist', 'developer', 'Technology', 'Perfect for DevOps engineers with emphasis on tools and certifications', true, false, true),
('Data Scientist', 'data-scientist', 'Technology', 'Specialized for data scientists with sections for publications and projects', true, true, true),
('Creative Portfolio', 'creative', 'Creative', 'Bold and eye-catching layout for creative professionals', true, true, false),
('UI/UX Designer', 'elegant', 'Creative', 'Refined and elegant design with sophisticated typography', true, false, false),
('Medical Professional', 'medical', 'Healthcare', 'Professional template designed for doctors and healthcare workers', true, true, true),
('Academic Researcher', 'academic', 'Education', 'Perfect for professors and researchers with publication sections', true, true, true),
('C-Level Executive', 'executive', 'Executive', 'Sophisticated design for senior managers and executives', true, true, true),
('ATS Optimized Pro', 'ats-pro', 'ATS-Friendly', 'Specifically designed to pass ATS systems while maintaining professional appearance', true, true, true),
('Simple & Clean', 'compact', 'ATS-Friendly', 'Space-efficient layout optimized for ATS parsing', true, false, true),
('Minimal ATS', 'minimalist', 'ATS-Friendly', 'Ultra-clean design optimized for ATS parsing with maximum readability', true, false, true),
('ATS Classic', 'ats-classic', 'ATS-Friendly', 'Clean serif layout with traditional formatting. Maximum ATS compatibility with timeless professional appeal.', true, true, true),
('ATS Modern', 'ats-modern', 'ATS-Friendly', 'Contemporary sans-serif design with subtle blue accents. Perfect balance of modern aesthetics and ATS parsability.', true, true, true),
('ATS Executive', 'ats-executive', 'ATS-Friendly', 'Authoritative serif template designed for senior leadership and C-suite roles. Commands attention while remaining fully ATS-compatible.', true, false, true),
('ATS Tech', 'ats-tech', 'ATS-Friendly', 'Developer-optimized template with clean structure for technical roles. ATS-friendly format that highlights technical skills effectively.', true, true, true),
('ATS Minimal', 'ats-minimal', 'ATS-Friendly', 'Ultra-clean minimalist design with zero distractions. Maximum readability and perfect ATS parsing scores.', true, false, true),
('ATS Corporate', 'ats-corporate', 'ATS-Friendly', 'Polished corporate template with centered layout. Ideal for consulting, finance, and enterprise roles.', true, false, true)
ON CONFLICT (template_key) DO NOTHING;

-- Subscription plans.
-- INR prices match the amounts the deployed edge functions actually charge
-- (create-razorpay-order: monthly ₹299 / yearly ₹2,499 / lifetime ₹4,999).
-- NOTE: Pricing.tsx currently DISPLAYS ₹199/₹1,999/₹2,500 — that mismatch is an
-- existing frontend bug documented in REFINED_PLAN.md; fix the UI (or these
-- rows + the edge function constants) before launch. slugs match the
-- planType strings the payment flow sends ('monthly'|'yearly'|'lifetime').
INSERT INTO public.subscription_plans
  (product, name, slug, description, price_inr, price_usd, billing_interval, features, limits, is_active, is_public, display_order) VALUES
('resume', 'Free', 'free', 'Get started with one resume',
  0, 0, 'free',
  '["1 saved resume", "Basic templates", "PDF export"]',
  '{"max_resumes": 1, "ai_requests_per_month": 0, "premium_templates": false}',
  true, true, 1),
('resume', 'Pro Monthly', 'monthly', 'Unlimited resumes and AI assistance',
  29900, 499, 'month',
  '["Unlimited resumes", "All templates", "AI suggestions", "PDF resume import", "Priority support"]',
  '{"max_resumes": -1, "ai_requests_per_month": 100, "premium_templates": true}',
  true, true, 2),
('resume', 'Pro Yearly', 'yearly', 'Two months free vs monthly',
  249900, 3999, 'year',
  '["Everything in Pro Monthly", "2 months free", "Priority support"]',
  '{"max_resumes": -1, "ai_requests_per_month": 150, "premium_templates": true}',
  true, true, 3),
('resume', 'Lifetime', 'lifetime', 'All Pro features forever, one payment',
  499900, 7999, 'lifetime',
  '["Everything in Pro", "Lifetime access", "All future templates"]',
  '{"max_resumes": -1, "ai_requests_per_month": 150, "premium_templates": true}',
  true, true, 4),
('ats', 'ATS Free', 'ats-free', 'Try the ATS with one live job',
  0, 0, 'free',
  '["1 active job", "3 team members", "Kanban pipeline", "Public job page"]',
  '{"max_active_jobs": 1, "max_members": 3, "talent_pools": false, "ai_scoring": false, "candidate_discovery": false}',
  true, true, 10),
('ats', 'ATS Starter', 'ats-starter', 'For small teams hiring regularly',
  199900, 2500, 'month',
  '["5 active jobs", "5 team members", "Email notifications", "Candidate discovery"]',
  '{"max_active_jobs": 5, "max_members": 5, "talent_pools": false, "ai_scoring": false, "candidate_discovery": true}',
  true, true, 11),
('ats', 'ATS Growth', 'ats-growth', 'AI screening and talent pools',
  499900, 5900, 'month',
  '["20 active jobs", "15 team members", "AI match scoring", "Talent pools", "Analytics", "Candidate discovery"]',
  '{"max_active_jobs": 20, "max_members": 15, "talent_pools": true, "ai_scoring": true, "candidate_discovery": true}',
  true, true, 12),
('ats', 'ATS Enterprise', 'ats-enterprise', 'Unlimited scale, custom terms',
  0, 0, 'month',
  '["Unlimited jobs & members", "Custom career page", "API access", "SSO", "Dedicated support"]',
  '{"max_active_jobs": -1, "max_members": -1, "talent_pools": true, "ai_scoring": true, "candidate_discovery": true}',
  true, false, 13)
ON CONFLICT (slug) DO NOTHING;

-- Feature flags (plan_requirements reference subscription_plans.slug values)
INSERT INTO public.feature_flags (name, description, is_enabled, plan_requirements, rollout_percentage) VALUES
('ai_resume_suggestions', 'Gemini-powered content suggestions in the builder', true, '{monthly,yearly,lifetime}', 100),
('pdf_resume_import', 'AI extraction of uploaded PDF resumes', true, '{monthly,yearly,lifetime}', 100),
('ats_ai_match_scoring', 'AI match scores on applications', true, '{ats-growth,ats-enterprise}', 100),
('ats_talent_pools', 'Talent pool management', true, '{ats-growth,ats-enterprise}', 100),
('candidate_discovery', 'Search discoverable candidate profiles', true, '{ats-starter,ats-growth,ats-enterprise}', 100)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- §13 SCHEDULED JOBS (pg_cron)
-- Enable the pg_cron extension in Dashboard → Database → Extensions first if
-- this block reports a NOTICE. Without it, schedule expire_subscriptions()
-- via an external cron hitting a service-role edge function instead.
-- ============================================================================
DO $$
BEGIN
  CREATE EXTENSION IF NOT EXISTS pg_cron;
  PERFORM cron.schedule(
    'expire-subscriptions-hourly',
    '7 * * * *',
    'SELECT public.expire_subscriptions()'
  );
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'pg_cron unavailable (%) — schedule public.expire_subscriptions() externally.', SQLERRM;
END $$;

-- ============================================================================
-- §14 POST-INSTALL (run manually after creating your account)
-- ============================================================================
-- 1) Grant yourself the platform admin role (replace the email):
--    INSERT INTO public.user_roles (user_id, role)
--    SELECT id, 'admin' FROM auth.users WHERE email = 'you@example.com'
--    ON CONFLICT (user_id, role) DO NOTHING;
--
-- 2) Optional premium grant for your own account:
--    INSERT INTO public.subscriptions (user_id, is_premium, plan_type, provider, status)
--    SELECT id, true, 'lifetime', 'manual', 'active' FROM auth.users WHERE email = 'you@example.com'
--    ON CONFLICT (user_id) DO UPDATE SET is_premium = true, plan_type = 'lifetime';
-- ============================================================================
