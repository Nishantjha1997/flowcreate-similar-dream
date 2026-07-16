-- =============================================================================
-- P10-T13: Multi-Resume Master Profiles
-- Creates master_profiles table enabling users to maintain a superset profile
-- from which individual resumes can be spawned.
-- =============================================================================

-- 1. Master Profiles table
CREATE TABLE public.master_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Master Profile',
  profile_data JSONB NOT NULL DEFAULT '{}',
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, name)
);

-- 2. Add master_profile_id foreign key to resumes
ALTER TABLE public.resumes
  ADD COLUMN IF NOT EXISTS master_profile_id UUID
  REFERENCES public.master_profiles(id) ON DELETE SET NULL;

-- 3. Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_master_profiles_user
  ON public.master_profiles(user_id);

CREATE INDEX IF NOT EXISTS idx_resumes_master_profile
  ON public.resumes(master_profile_id)
  WHERE master_profile_id IS NOT NULL;

-- 4. Enable RLS on master_profiles
ALTER TABLE public.master_profiles ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies

-- Owners can fully manage their own master profiles
CREATE POLICY "Users manage own master profiles"
  ON public.master_profiles
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 6. Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.set_master_profile_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'trg_master_profiles_updated_at'
  ) THEN
    CREATE TRIGGER trg_master_profiles_updated_at
      BEFORE UPDATE ON public.master_profiles
      FOR EACH ROW
      EXECUTE FUNCTION public.set_master_profile_updated_at();
  END IF;
END $$;

-- 7. Enforce single default per user (optional but good UX)
CREATE OR REPLACE FUNCTION public.enforce_single_default_master_profile()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default THEN
    UPDATE public.master_profiles
    SET is_default = false
    WHERE user_id = NEW.user_id
      AND id != NEW.id
      AND is_default = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'trg_master_profiles_single_default'
  ) THEN
    CREATE TRIGGER trg_master_profiles_single_default
      BEFORE INSERT OR UPDATE ON public.master_profiles
      FOR EACH ROW
      WHEN (NEW.is_default = true)
      EXECUTE FUNCTION public.enforce_single_default_master_profile();
  END IF;
END $$;
