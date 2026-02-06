-- Restrict site_settings: replace open public read with whitelist approach
DROP POLICY IF EXISTS "Site settings are publicly readable" ON public.site_settings;

-- Only allow specific safe setting keys to be publicly readable
CREATE POLICY "Only safe settings are publicly readable"
ON public.site_settings
FOR SELECT
USING (
  setting_key IN ('design_mode', 'theme', 'language', 'public_features')
  OR is_admin()
);
