-- Sync resume_templates to code registry
INSERT INTO public.resume_templates (name, template_key, category, description, is_active, is_featured, is_ats_optimized)
VALUES
('Clean Slate', 'clean-slate', 'Minimal', 'Ultra-minimal single column with thin top accent line and maximum white space.', true, true, true),
('Executive Serif', 'executive-serif', 'Executive', 'Timeless serif design with centered header and double-rule section dividers.', true, true, true),
('Sidebar Modern', 'sidebar-modern', 'Creative', 'Bold violet left accent border with clean typography and subtle section rules.', true, true, true),
('Tech Engineer', 'tech-engineer', 'Technology', 'Dark slate header with cyan accents; monospace font for a developer-first look.', true, true, true),
('Coral Creative', 'coral-creative', 'Creative', 'Warm coral palette with bold section headers and expressive typographic rhythm.', true, true, false),
('Navy Professional', 'navy-professional', 'Professional', 'Navy blue header band with clean two-tone layout; perfect for corporate roles.', true, true, true),
('Emerald Minimal', 'emerald-minimal', 'Minimal', 'Fresh emerald green accents on a clean white canvas with generous spacing.', true, true, true)
ON CONFLICT (template_key) DO UPDATE
SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  is_active = true,
  is_featured = EXCLUDED.is_featured,
  is_ats_optimized = EXCLUDED.is_ats_optimized,
  updated_at = now();

-- Deactivate templates not in the active registry
UPDATE public.resume_templates
SET is_active = false, updated_at = now()
WHERE template_key NOT IN ('clean-slate', 'executive-serif', 'sidebar-modern', 'tech-engineer', 'coral-creative', 'navy-professional', 'emerald-minimal');
