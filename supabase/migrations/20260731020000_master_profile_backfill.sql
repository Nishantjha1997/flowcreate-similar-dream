-- =============================================================================
-- F-5a: Master Profile unification — backfill
-- Account.tsx's "Master Profile" tab has always edited public.profiles directly,
-- while the dedicated /master-profiles page reads/writes public.master_profiles
-- (profile_data JSONB). Users who only ever touched the Account tab have real
-- profile content sitting in `profiles` but no row in `master_profiles` at all,
-- so once Account.tsx is repointed at useMasterProfile they'd see an empty form.
-- This creates one default master_profiles row per such user, mapping profiles
-- columns into the same profile_data shape useMasterProfile/ResumeSpawner expect.
-- avatar_url and is_discoverable are intentionally excluded — those stay on
-- public.profiles as the "auth-y" fields per ROADMAP S-2.
-- =============================================================================

INSERT INTO public.master_profiles (user_id, name, profile_data, is_default)
SELECT
  p.user_id,
  'Master Profile',
  jsonb_strip_nulls(jsonb_build_object(
    'full_name', p.full_name,
    'email', p.email,
    'phone', p.phone,
    'date_of_birth', p.date_of_birth,
    'address', p.address,
    'city', p.city,
    'state', p.state,
    'postal_code', p.postal_code,
    'country', p.country,
    'linkedin_url', p.linkedin_url,
    'website_url', p.website_url,
    'github_url', p.github_url,
    'portfolio_url', p.portfolio_url,
    'professional_summary', p.professional_summary,
    'current_position', p.current_position,
    'industry', p.industry,
    'experience_level', p.experience_level,
    'technical_skills', p.technical_skills,
    'soft_skills', p.soft_skills,
    'languages', p.languages,
    'work_experience', p.work_experience,
    'education', p.education,
    'projects', p.projects,
    'certifications', p.certifications,
    'achievements', p.achievements,
    'volunteer_experience', p.volunteer_experience
  )),
  true
FROM public.profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM public.master_profiles mp WHERE mp.user_id = p.user_id
)
AND (
  COALESCE(p.full_name, '') <> ''
  OR COALESCE(p.professional_summary, '') <> ''
  OR COALESCE(p.current_position, '') <> ''
  OR jsonb_array_length(COALESCE(p.technical_skills, '[]'::jsonb)) > 0
  OR jsonb_array_length(COALESCE(p.work_experience, '[]'::jsonb)) > 0
  OR jsonb_array_length(COALESCE(p.education, '[]'::jsonb)) > 0
  OR jsonb_array_length(COALESCE(p.projects, '[]'::jsonb)) > 0
  OR jsonb_array_length(COALESCE(p.certifications, '[]'::jsonb)) > 0
);
