-- Blog post view tracking.
-- Adds a counter column and a SECURITY DEFINER RPC so anonymous readers can
-- increment the count on a published post without any UPDATE privilege on
-- blog_posts (RLS stays locked down; the function is the only write path).

ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS view_count integer NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.increment_blog_view(post_slug text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.blog_posts
     SET view_count = view_count + 1
   WHERE slug = post_slug
     AND status = 'published';
$$;

GRANT EXECUTE ON FUNCTION public.increment_blog_view(text) TO anon, authenticated;
