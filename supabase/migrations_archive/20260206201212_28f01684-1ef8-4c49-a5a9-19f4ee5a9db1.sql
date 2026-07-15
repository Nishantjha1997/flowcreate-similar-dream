
-- Fix 1: Add SET search_path to is_org_member and has_org_role
CREATE OR REPLACE FUNCTION public.is_org_member(org_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id = org_id AND user_id = auth.uid()
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.has_org_role(org_id uuid, required_role text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id = org_id 
    AND user_id = auth.uid()
    AND role = required_role
  );
END;
$function$;

-- Fix 3: Drop dangerous subscriptions_user_insert policy
DROP POLICY IF EXISTS "subscriptions_user_insert" ON public.subscriptions;
