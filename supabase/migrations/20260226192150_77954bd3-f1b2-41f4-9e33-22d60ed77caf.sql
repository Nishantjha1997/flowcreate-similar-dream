-- Fix: Add 'published' to the jobs status CHECK constraint
-- The RLS policy and client code use 'published' but it was missing from the constraint
ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS jobs_status_check;
ALTER TABLE public.jobs ADD CONSTRAINT jobs_status_check 
  CHECK (status IN ('draft', 'published', 'active', 'paused', 'closed', 'archived'));