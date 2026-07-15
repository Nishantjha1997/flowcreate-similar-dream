-- Create comprehensive user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  
  -- Personal Information
  full_name TEXT,
  email TEXT,
  phone TEXT,
  date_of_birth DATE,
  address TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT,
  
  -- Professional Links
  linkedin_url TEXT,
  website_url TEXT,
  github_url TEXT,
  portfolio_url TEXT,
  
  -- Profile Photo
  avatar_url TEXT,
  
  -- Professional Summary
  professional_summary TEXT,
  
  -- Career Information
  current_position TEXT,
  industry TEXT,
  experience_level TEXT, -- 'entry', 'mid', 'senior', 'executive'
  
  -- Skills (stored as JSONB array)
  technical_skills JSONB DEFAULT '[]'::jsonb,
  soft_skills JSONB DEFAULT '[]'::jsonb,
  languages JSONB DEFAULT '[]'::jsonb, -- [{"language": "English", "proficiency": "Native"}]
  
  -- Experience (stored as JSONB array)
  work_experience JSONB DEFAULT '[]'::jsonb,
  
  -- Education (stored as JSONB array)
  education JSONB DEFAULT '[]'::jsonb,
  
  -- Projects (stored as JSONB array)
  projects JSONB DEFAULT '[]'::jsonb,
  
  -- Additional Information
  certifications JSONB DEFAULT '[]'::jsonb,
  achievements JSONB DEFAULT '[]'::jsonb,
  volunteer_experience JSONB DEFAULT '[]'::jsonb,
  
  -- Profile Metadata
  profile_completeness INTEGER DEFAULT 0, -- percentage 0-100
  last_resume_sync TIMESTAMP WITH TIME ZONE,
  auto_sync_enabled BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can view and manage their own profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (is_admin());

CREATE POLICY "Admins can update all profiles" 
ON public.profiles 
FOR UPDATE 
USING (is_admin());

-- Create function to automatically update timestamps
CREATE OR REPLACE FUNCTION public.update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_profiles_updated_at();

-- Create function to calculate profile completeness
CREATE OR REPLACE FUNCTION public.calculate_profile_completeness(profile_data jsonb)
RETURNS INTEGER AS $$
DECLARE
  total_fields INTEGER := 15; -- Total number of important fields
  completed_fields INTEGER := 0;
BEGIN
  -- Check essential personal information
  IF profile_data->>'full_name' IS NOT NULL AND profile_data->>'full_name' != '' THEN
    completed_fields := completed_fields + 1;
  END IF;
  
  IF profile_data->>'email' IS NOT NULL AND profile_data->>'email' != '' THEN
    completed_fields := completed_fields + 1;
  END IF;
  
  IF profile_data->>'phone' IS NOT NULL AND profile_data->>'phone' != '' THEN
    completed_fields := completed_fields + 1;
  END IF;
  
  IF profile_data->>'professional_summary' IS NOT NULL AND profile_data->>'professional_summary' != '' THEN
    completed_fields := completed_fields + 1;
  END IF;
  
  -- Check if arrays have content
  IF jsonb_array_length(COALESCE(profile_data->'technical_skills', '[]'::jsonb)) > 0 THEN
    completed_fields := completed_fields + 1;
  END IF;
  
  IF jsonb_array_length(COALESCE(profile_data->'work_experience', '[]'::jsonb)) > 0 THEN
    completed_fields := completed_fields + 1;
  END IF;
  
  IF jsonb_array_length(COALESCE(profile_data->'education', '[]'::jsonb)) > 0 THEN
    completed_fields := completed_fields + 1;
  END IF;
  
  -- Add more checks for other important fields...
  
  RETURN (completed_fields * 100 / total_fields);
END;
$$ LANGUAGE plpgsql;

-- Add template_id column to resumes table to track which template was used
ALTER TABLE public.resumes ADD COLUMN IF NOT EXISTS template_id TEXT DEFAULT 'modern';

-- Create function to sync resume data to profile
CREATE OR REPLACE FUNCTION public.sync_resume_to_profile()
RETURNS TRIGGER AS $$
DECLARE
  resume_data JSONB;
  profile_exists BOOLEAN;
BEGIN
  resume_data := NEW.resume_data;
  
  -- Check if profile already exists
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE user_id = NEW.user_id) INTO profile_exists;
  
  IF NOT profile_exists THEN
    -- Create new profile from resume data
    INSERT INTO public.profiles (
      user_id,
      full_name,
      email,
      phone,
      address,
      linkedin_url,
      website_url,
      professional_summary,
      technical_skills,
      work_experience,
      education,
      projects,
      last_resume_sync
    ) VALUES (
      NEW.user_id,
      resume_data->'personal'->>'name',
      resume_data->'personal'->>'email',
      resume_data->'personal'->>'phone',
      resume_data->'personal'->>'address',
      resume_data->'personal'->>'linkedin',
      resume_data->'personal'->>'website',
      resume_data->'personal'->>'summary',
      COALESCE(resume_data->'skills', '[]'::jsonb),
      COALESCE(resume_data->'experience', '[]'::jsonb),
      COALESCE(resume_data->'education', '[]'::jsonb),
      COALESCE(resume_data->'projects', '[]'::jsonb),
      now()
    );
  ELSE
    -- Update existing profile if auto_sync is enabled and this is newer
    UPDATE public.profiles 
    SET 
      last_resume_sync = now(),
      updated_at = now()
    WHERE user_id = NEW.user_id 
    AND auto_sync_enabled = true 
    AND (last_resume_sync IS NULL OR last_resume_sync < NEW.updated_at);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to sync resume data to profile
CREATE TRIGGER sync_resume_to_profile_trigger
AFTER INSERT OR UPDATE ON public.resumes
FOR EACH ROW
EXECUTE FUNCTION public.sync_resume_to_profile();