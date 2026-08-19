-- Release follow-up fixes for the MakeCV dashboard and billing flows.
BEGIN;

-- The help-ticket migration uses is_admin(auth.uid()), while the original
-- schema exposed only the zero-argument RLS helper. Keep both signatures so
-- existing policies remain compatible and the help center policies compile.
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'admin'
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated;

COMMIT;
