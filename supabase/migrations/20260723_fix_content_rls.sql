-- Fix: ContentManagement 406 errors — add content management keys to site_settings SELECT whitelist
-- The RLS policy only allowed 'design_mode', 'theme', 'language', 'public_features'
-- ContentManagement queries 'landing_page_content', 'seo_settings', 'content_sections' which were blocked

DROP POLICY IF EXISTS "Public can read whitelisted settings" ON public.site_settings;

CREATE POLICY "Public can read whitelisted settings" ON public.site_settings
  FOR SELECT TO anon, authenticated USING (
    setting_key IN (
      'design_mode', 'theme', 'language', 'public_features',
      'landing_page_content', 'seo_settings', 'content_sections',
      'website_settings', 'rate_limit_settings', 'security_settings'
    )
    OR public.is_admin()
  );
