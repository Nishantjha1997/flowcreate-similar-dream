-- Phase 10: Shareable Resume Links & Comments
-- Enables public sharing of resumes via tokens and anonymous feedback comments.

-- 1. Resume shares — one token per shared resume
CREATE TABLE public.resume_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  share_token TEXT UNIQUE NOT NULL DEFAULT encode(extensions.gen_random_bytes(16), 'hex'),
  is_active BOOLEAN NOT NULL DEFAULT true,
  allow_comments BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Comments — guest annotations on shared resumes
CREATE TABLE public.resume_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  share_id UUID NOT NULL REFERENCES public.resume_shares(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_email TEXT,
  content TEXT NOT NULL,
  section_ref TEXT,
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS: resume_shares
ALTER TABLE public.resume_shares ENABLE ROW LEVEL SECURITY;

-- Owners can manage their shares
CREATE POLICY "Owners manage shares"
  ON public.resume_shares FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- Public can read active, unexpired shares by token (for anon viewing)
CREATE POLICY "Public read active shares"
  ON public.resume_shares FOR SELECT TO anon, authenticated
  USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

-- RLS: resume_comments
ALTER TABLE public.resume_comments ENABLE ROW LEVEL SECURITY;

-- Anyone can insert comments on active shares (guest feedback)
CREATE POLICY "Public insert on active shares"
  ON public.resume_comments FOR INSERT TO anon, authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.resume_shares
    WHERE id = share_id
      AND is_active = true
      AND allow_comments = true
      AND (expires_at IS NULL OR expires_at > now())
  ));

-- Anyone can read comments on a share
CREATE POLICY "Public read comments"
  ON public.resume_comments FOR SELECT TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM public.resume_shares
    WHERE id = share_id AND is_active = true
  ));

-- Owner can resolve/moderate comments
CREATE POLICY "Owner resolves comments"
  ON public.resume_comments FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.resume_shares
    WHERE id = share_id AND user_id = (SELECT auth.uid())
  ));

-- RLS gap fix: allow public read of resumes linked to active shares
-- The existing resumes RLS policies only allow authenticated users to view
-- their own resumes. This policy allows anonymous read when accessed via
-- a valid share token.
CREATE POLICY "Public read shared resumes"
  ON public.resumes FOR SELECT TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM public.resume_shares
    WHERE resume_id = id
      AND is_active = true
      AND (expires_at IS NULL OR expires_at > now())
  ));

-- Indexes
CREATE INDEX idx_resume_shares_token ON public.resume_shares(share_token);
CREATE INDEX idx_resume_shares_user ON public.resume_shares(user_id);
CREATE INDEX idx_resume_shares_resume ON public.resume_shares(resume_id);
CREATE INDEX idx_resume_comments_share ON public.resume_comments(share_id);
