-- Keep the public template catalog aligned with src/templates/registry.ts.
INSERT INTO public.resume_templates (
  name,
  template_key,
  category,
  description,
  is_active,
  is_featured,
  is_ats_optimized
)
VALUES
  ('Harbor Serif', 'harbor-serif', 'Professional', 'Editorial serif hierarchy with calm teal rules and generous reading space.', true, true, true),
  ('Column Ledger', 'column-ledger', 'Executive', 'Warm right-hand details rail with a dense, disciplined leadership column.', true, true, false),
  ('Graduate Focus', 'graduate-focus', 'ATS-Friendly', 'Clear blue introduction band built for internships and early-career applications.', true, true, true),
  ('Studio Grid', 'studio-grid', 'Creative', 'Monochrome portfolio grid with a compact studio rail and warm orange detail.', true, true, false)
ON CONFLICT (template_key) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    is_active = EXCLUDED.is_active,
    is_featured = EXCLUDED.is_featured,
    is_ats_optimized = EXCLUDED.is_ats_optimized,
    updated_at = now();
