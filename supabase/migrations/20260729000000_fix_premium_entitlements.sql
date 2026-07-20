-- Repair manual premium grants and make entitlement resolution authoritative.
-- Safe to run more than once.

CREATE OR REPLACE FUNCTION public.get_user_entitlements(p_user_id UUID DEFAULT auth.uid())
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sub public.subscriptions%ROWTYPE;
  v_plan public.subscription_plans%ROWTYPE;
BEGIN
  IF p_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'plan', 'free',
      'is_premium', false,
      'status', 'active',
      'current_period_end', NULL,
      'limits', jsonb_build_object('max_resumes', 1, 'ai_requests_per_month', 0, 'premium_templates', false),
      'features', '[]'::jsonb
    );
  END IF;

  IF auth.role() <> 'service_role'
     AND p_user_id IS DISTINCT FROM auth.uid()
     AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Not authorized to read these entitlements';
  END IF;

  SELECT * INTO v_sub
  FROM public.subscriptions
  WHERE user_id = p_user_id;

  IF v_sub.id IS NOT NULL AND v_sub.is_premium THEN
    SELECT * INTO v_plan
    FROM public.subscription_plans
    WHERE product = 'resume'
      AND is_active = true
      AND slug <> 'free'
      AND (
        id = v_sub.plan_id
        OR (v_sub.plan_type <> 'free' AND slug = v_sub.plan_type)
      )
    ORDER BY (id = v_sub.plan_id) DESC NULLS LAST
    LIMIT 1;
  END IF;

  IF v_plan.id IS NULL THEN
    IF COALESCE(v_sub.is_premium, false) THEN
      SELECT * INTO v_plan
      FROM public.subscription_plans
      WHERE product = 'resume' AND slug = 'monthly' AND is_active = true
      LIMIT 1;
    ELSE
      SELECT * INTO v_plan
      FROM public.subscription_plans
      WHERE product = 'resume' AND slug = 'free' AND is_active = true
      LIMIT 1;
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'plan', COALESCE(v_plan.slug, CASE WHEN COALESCE(v_sub.is_premium, false) THEN 'monthly' ELSE 'free' END),
    'is_premium', COALESCE(v_sub.is_premium, false),
    'status', COALESCE(v_sub.status, 'active'),
    'current_period_end', v_sub.current_period_end,
    'limits', COALESCE(
      v_plan.limits,
      CASE
        WHEN COALESCE(v_sub.is_premium, false)
          THEN '{"max_resumes":-1,"ai_requests_per_month":100,"premium_templates":true}'::jsonb
        ELSE '{"max_resumes":1,"ai_requests_per_month":0,"premium_templates":false}'::jsonb
      END
    ),
    'features', COALESCE(v_plan.features, '[]'::jsonb)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_user_entitlements(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_user_entitlements(UUID) TO authenticated, service_role;

-- Normalize older manual grants that were premium=true but still linked to Free.
UPDATE public.subscriptions AS s
SET plan_id = p.id,
    plan_type = 'monthly',
    provider = COALESCE(s.provider, 'manual'),
    status = 'active',
    current_period_start = COALESCE(s.current_period_start, now()),
    current_period_end = COALESCE(s.current_period_end, now() + INTERVAL '1 month'),
    expires_at = COALESCE(s.expires_at, now() + INTERVAL '1 month'),
    updated_at = now()
FROM public.subscription_plans AS p
WHERE p.product = 'resume'
  AND p.slug = 'monthly'
  AND s.is_premium = true
  AND (s.plan_id IS NULL OR s.plan_type = 'free');

-- Project owner test account: explicit lifetime grant requested for QA.
INSERT INTO public.subscriptions (
  user_id,
  is_premium,
  plan_type,
  plan_id,
  provider,
  status,
  cancel_at_period_end,
  expires_at,
  current_period_start,
  current_period_end,
  updated_at
)
SELECT
  u.id,
  true,
  'lifetime',
  p.id,
  'manual',
  'active',
  false,
  NULL,
  now(),
  NULL,
  now()
FROM auth.users AS u
JOIN public.subscription_plans AS p
  ON p.product = 'resume' AND p.slug = 'lifetime'
WHERE lower(u.email) = 'nishantjha31@gmail.com'
ON CONFLICT (user_id) DO UPDATE
SET is_premium = true,
    plan_type = 'lifetime',
    plan_id = EXCLUDED.plan_id,
    provider = 'manual',
    status = 'active',
    cancel_at_period_end = false,
    expires_at = NULL,
    current_period_start = COALESCE(public.subscriptions.current_period_start, now()),
    current_period_end = NULL,
    updated_at = now();
