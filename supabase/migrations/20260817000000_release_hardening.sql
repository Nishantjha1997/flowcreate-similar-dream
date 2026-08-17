-- MakeCV release hardening: authoritative catalogs, server-only secrets, and
-- Razorpay subscription lifecycle fields. Historical migrations are retained;
-- this migration safely upgrades an existing deployment in place.

BEGIN;

-- The browser must never select or mutate provider secrets directly. Admin
-- screens use the admin-provider-secrets Edge Function, which returns only
-- masked metadata and performs all writes with service_role.
DROP POLICY IF EXISTS "Only admins can manage AI API keys" ON public.ai_api_keys;
DROP POLICY IF EXISTS "Only admins can manage payment gateway keys" ON public.payment_gateway_keys;
REVOKE ALL ON public.ai_api_keys FROM anon, authenticated;
REVOKE ALL ON public.payment_gateway_keys FROM anon, authenticated;
GRANT ALL ON public.ai_api_keys TO service_role;
GRANT ALL ON public.payment_gateway_keys TO service_role;

-- Canonical MakeCV catalog. The upsert is deliberately keyed by slug so it
-- repairs rows created by older seeds without creating duplicate products.
UPDATE public.subscription_plans
SET price_inr = CASE slug
      WHEN 'monthly' THEN 29900
      WHEN 'yearly' THEN 249900
      WHEN 'lifetime' THEN 499900
      ELSE price_inr
    END,
    price_usd = CASE slug
      WHEN 'monthly' THEN 500
      WHEN 'yearly' THEN 3900
      WHEN 'lifetime' THEN 7900
      ELSE price_usd
    END,
    updated_at = now()
WHERE slug IN ('monthly', 'yearly', 'lifetime');

ALTER TABLE public.subscription_plans
  ADD COLUMN IF NOT EXISTS razorpay_plan_id_usd TEXT;

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS razorpay_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS razorpay_plan_id TEXT,
  ADD COLUMN IF NOT EXISTS cancellation_requested_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS provider_status TEXT;

ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS razorpay_subscription_id TEXT;

ALTER TABLE public.blog_automation_runs
  ADD COLUMN IF NOT EXISTS indexing_status TEXT NOT NULL DEFAULT 'not_requested'
    CHECK (indexing_status IN ('not_requested', 'queued', 'submitted', 'not_configured', 'failed')),
  ADD COLUMN IF NOT EXISTS indexing_error TEXT,
  ADD COLUMN IF NOT EXISTS indexed_at TIMESTAMPTZ;

-- Automated publishing is the product decision: quality gates run in the
-- worker, then every successful article goes live and enters the sitemap.
UPDATE public.blog_automation_schedules SET publish_mode = 'published' WHERE publish_mode <> 'published';
UPDATE public.blog_automation_schedules SET author = 'MakeCV Team' WHERE author ILIKE '%flowcreate%';

-- Normalize seeded and previously generated article copy so the public blog
-- cannot continue surfacing the retired product name after the rebrand.
UPDATE public.blog_posts
SET title = regexp_replace(title, 'FlowCreate', 'MakeCV', 'gi'),
    excerpt = regexp_replace(excerpt, 'FlowCreate', 'MakeCV', 'gi'),
    description = regexp_replace(description, 'FlowCreate', 'MakeCV', 'gi'),
    content = regexp_replace(content, 'FlowCreate', 'MakeCV', 'gi'),
    author = CASE
      WHEN author ILIKE '%flowcreate%' THEN 'MakeCV Team'
      ELSE author
    END,
    updated_at = now()
WHERE title ILIKE '%flowcreate%'
   OR excerpt ILIKE '%flowcreate%'
   OR description ILIKE '%flowcreate%'
   OR content ILIKE '%flowcreate%'
   OR author ILIKE '%flowcreate%';
ALTER TABLE public.blog_automation_schedules DROP CONSTRAINT IF EXISTS blog_automation_schedules_publish_mode_check;
ALTER TABLE public.blog_automation_schedules ADD CONSTRAINT blog_automation_schedules_publish_mode_check CHECK (publish_mode = 'published');

CREATE UNIQUE INDEX IF NOT EXISTS uniq_subscriptions_razorpay_subscription_id
  ON public.subscriptions (razorpay_subscription_id)
  WHERE razorpay_subscription_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_payments_razorpay_subscription_id
  ON public.payments (razorpay_subscription_id)
  WHERE razorpay_subscription_id IS NOT NULL;

-- A server-owned ledger for every subscription checkout attempt. It lets the
-- verify endpoint prove that a subscription belongs to the authenticated user
-- before accepting a browser callback.
CREATE TABLE IF NOT EXISTS public.razorpay_subscription_checkouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id) ON DELETE RESTRICT,
  razorpay_subscription_id TEXT NOT NULL UNIQUE,
  currency TEXT NOT NULL CHECK (currency IN ('INR', 'USD')),
  amount INTEGER NOT NULL CHECK (amount > 0),
  status TEXT NOT NULL DEFAULT 'created'
    CHECK (status IN ('created', 'authenticated', 'active', 'failed', 'cancelled', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.razorpay_subscription_checkouts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS razorpay_subscription_checkouts_user_select ON public.razorpay_subscription_checkouts;
CREATE POLICY razorpay_subscription_checkouts_user_select
  ON public.razorpay_subscription_checkouts FOR SELECT TO authenticated
  USING (user_id = auth.uid());
REVOKE INSERT, UPDATE, DELETE ON public.razorpay_subscription_checkouts FROM anon, authenticated;
GRANT SELECT ON public.razorpay_subscription_checkouts TO authenticated;
GRANT ALL ON public.razorpay_subscription_checkouts TO service_role;

DROP TRIGGER IF EXISTS update_razorpay_subscription_checkouts_updated_at
  ON public.razorpay_subscription_checkouts;
CREATE TRIGGER update_razorpay_subscription_checkouts_updated_at
  BEFORE UPDATE ON public.razorpay_subscription_checkouts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Usage-limit rows are initialized and consumed by server-side functions. A
-- user can read their own row, but cannot forge counters from the browser.
DROP POLICY IF EXISTS "Users can create their own limits" ON public.usage_limits;
DROP POLICY IF EXISTS "Users can update their own limits" ON public.usage_limits;
REVOKE INSERT, UPDATE, DELETE ON public.usage_limits FROM anon, authenticated;

COMMENT ON TABLE public.ai_api_keys IS
  'Provider secrets are service-role-only; admin-provider-secrets returns masked metadata.';
COMMENT ON TABLE public.payment_gateway_keys IS
  'Gateway secrets are service-role-only; admin-provider-secrets returns masked metadata.';

COMMIT;
