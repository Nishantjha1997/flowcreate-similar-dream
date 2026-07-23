-- Make AI allowances explicit and truthful across the plan catalog.
--
-- `ai_requests_per_month` is the established API key used by the app. Its
-- enforcement window is a rolling 30 days (not a calendar month). One action
-- covers one successful text-generation request through gemini-suggest,
-- including resume suggestions, job matching, cover-letter generation, and
-- translation. PDF import has its own hourly protection because it is a
-- separate, heavier workflow.
--
-- The limits are deliberately conservative. DeepSeek V4 Flash is inexpensive,
-- but prompts vary in size and lifetime access has no renewal revenue. Keep a
-- fair-use ceiling rather than promising unlimited model calls.

BEGIN;

UPDATE public.subscription_plans
SET
  description = 'Create and save one resume. AI actions are not included.',
  features = '["1 saved resume", "All standard templates", "Live preview", "ATS-friendly PDF export", "0 AI actions / 30 days"]'::jsonb,
  limits = '{"max_resumes": 1, "ai_requests_per_month": 0, "premium_templates": false}'::jsonb,
  updated_at = clock_timestamp()
WHERE product = 'resume' AND slug = 'free';

UPDATE public.subscription_plans
SET
  description = 'Unlimited resumes with 100 AI actions every rolling 30 days.',
  features = '["Unlimited resumes", "All premium templates", "100 AI actions / 30 days", "PDF resume import", "Version history", "Cloud backup", "Priority support"]'::jsonb,
  limits = '{"max_resumes": -1, "ai_requests_per_month": 100, "premium_templates": true}'::jsonb,
  updated_at = clock_timestamp()
WHERE product = 'resume' AND slug = 'monthly';

UPDATE public.subscription_plans
SET
  description = 'Best value: unlimited resumes with 150 AI actions every rolling 30 days.',
  features = '["Unlimited resumes", "All premium templates", "150 AI actions / 30 days", "PDF resume import", "Version history", "Cloud backup", "Priority support", "Two months free"]'::jsonb,
  limits = '{"max_resumes": -1, "ai_requests_per_month": 150, "premium_templates": true}'::jsonb,
  updated_at = clock_timestamp()
WHERE product = 'resume' AND slug = 'yearly';

UPDATE public.subscription_plans
SET
  description = 'One payment for lifetime access with 150 AI actions every rolling 30 days.',
  features = '["Unlimited resumes", "All premium templates", "150 AI actions / 30 days", "PDF resume import", "Version history", "Cloud backup", "Future template updates", "Fair-use access"]'::jsonb,
  limits = '{"max_resumes": -1, "ai_requests_per_month": 150, "premium_templates": true}'::jsonb,
  updated_at = clock_timestamp()
WHERE product = 'resume' AND slug = 'lifetime';

COMMENT ON COLUMN public.subscription_plans.limits IS
  'Product entitlements. Resume ai_requests_per_month is a rolling 30-day successful text-generation allowance; -1 means unlimited and 0 means disabled.';

COMMIT;
