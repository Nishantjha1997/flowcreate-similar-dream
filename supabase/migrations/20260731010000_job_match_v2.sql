-- Job Match v2: persisted reports and safe resume versions.
-- Original resumes remain untouched. Tailored copies point back to their source.

BEGIN;

ALTER TABLE public.resumes
  ADD COLUMN IF NOT EXISTS parent_resume_id UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS version_label TEXT,
  ADD COLUMN IF NOT EXISTS is_tailored BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_resumes_parent_resume
  ON public.resumes(parent_resume_id)
  WHERE parent_resume_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.job_match_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resume_id UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
  job_title TEXT,
  company TEXT,
  jd_text TEXT NOT NULL,
  jd_hash TEXT,
  score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100),
  score_breakdown JSONB NOT NULL DEFAULT '{}',
  matched_keywords JSONB NOT NULL DEFAULT '[]',
  missing_keywords JSONB NOT NULL DEFAULT '[]',
  recommendations JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_job_match_reports_user_created
  ON public.job_match_reports(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_match_reports_resume_created
  ON public.job_match_reports(resume_id, created_at DESC)
  WHERE resume_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_job_match_reports_jd_hash
  ON public.job_match_reports(user_id, jd_hash)
  WHERE jd_hash IS NOT NULL;

ALTER TABLE public.job_match_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own job match reports" ON public.job_match_reports;
CREATE POLICY "Users manage own job match reports"
  ON public.job_match_reports
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP TRIGGER IF EXISTS update_job_match_reports_updated_at ON public.job_match_reports;
CREATE TRIGGER update_job_match_reports_updated_at
  BEFORE UPDATE ON public.job_match_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

COMMENT ON TABLE public.job_match_reports IS
  'User-owned Job Match results. Recommendations are proposals only; the client requires approval before changing a resume.';
COMMENT ON COLUMN public.resumes.parent_resume_id IS
  'Optional source resume for a tailored copy; never overwrite the source row.';

COMMIT;
