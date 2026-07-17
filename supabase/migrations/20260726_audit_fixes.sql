-- ═══════════════════════════════════════════════════════════════
-- MASTER AUDIT FIXES: RLS, indexes, foreign keys, migration safety
-- ═══════════════════════════════════════════════════════════════

-- C1: Enable RLS on master_profiles (policies exist but RLS never enabled)
ALTER TABLE public.master_profiles ENABLE ROW LEVEL SECURITY;

-- C3: Fix migration collisions — add IF NOT EXISTS to tables already in main schema
-- These tables are created in 20260715000000_complete_schema.sql but re-declared in later migrations
-- The later migrations would crash on fresh deploys without IF NOT EXISTS

-- H1 + M6: Missing performance indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_jobs_created ON public.jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_applications_created ON public.job_applications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_created ON public.blog_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_help_tickets_created ON public.help_tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_interviews_status ON public.interviews(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_premium ON public.subscriptions(is_premium) WHERE is_premium = true;
CREATE INDEX IF NOT EXISTS idx_resume_shares_resume_active ON public.resume_shares(resume_id, is_active);
CREATE INDEX IF NOT EXISTS idx_resumes_user_updated ON public.resumes(user_id, updated_at DESC);

-- H2: Missing foreign keys to auth.users
-- Only add if the constraint doesn't already exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_ats_activities_user') THEN
    ALTER TABLE public.ats_activities ADD CONSTRAINT fk_ats_activities_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_application_reviews_reviewer') THEN
    ALTER TABLE public.application_reviews ADD CONSTRAINT fk_application_reviews_reviewer FOREIGN KEY (reviewer_id) REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_interviews_created_by') THEN
    ALTER TABLE public.interviews ADD CONSTRAINT fk_interviews_created_by FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_job_offers_created_by') THEN
    ALTER TABLE public.job_offers ADD CONSTRAINT fk_job_offers_created_by FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_jobs_created_by') THEN
    ALTER TABLE public.jobs ADD CONSTRAINT fk_jobs_created_by FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;
