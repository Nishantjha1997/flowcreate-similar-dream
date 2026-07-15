-- Create site_settings table for global site configuration
CREATE TABLE public.site_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read site settings (they're public configurations)
CREATE POLICY "Site settings are publicly readable"
ON public.site_settings
FOR SELECT
USING (true);

-- Only admins can modify site settings
CREATE POLICY "Only admins can update site settings"
ON public.site_settings
FOR UPDATE
USING (is_admin());

CREATE POLICY "Only admins can insert site settings"
ON public.site_settings
FOR INSERT
WITH CHECK (is_admin());

CREATE POLICY "Only admins can delete site settings"
ON public.site_settings
FOR DELETE
USING (is_admin());

-- Insert default design mode setting
INSERT INTO public.site_settings (setting_key, setting_value)
VALUES ('design_mode', '{"mode": "default"}');

-- Create trigger for updated_at
CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();