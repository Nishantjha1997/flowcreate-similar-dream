-- Sync the 12 Phase 3 templates into the resume_templates catalog
-- (follow-up to 20260715130000, which synced the original 7 registry keys).
INSERT INTO public.resume_templates (name, template_key, category, description, is_active, is_featured, is_ats_optimized)
VALUES
('Split Frame', 'split-frame', 'Professional', 'Dark slate sidebar with photo, contact and skills; crisp white main column.', true, true, false),
('Timeline', 'timeline-dot', 'Professional', 'Experience entries on a teal timeline rule with accented dates. Free.', true, true, true),
('Header Band', 'header-band', 'Creative', 'Full-width indigo header band with photo; clean single-column body.', true, true, true),
('Swiss Grid', 'swiss-grid', 'Minimal', 'International Typographic Style: oversized name, red accents, zero decoration.', true, true, true),
('Warm Humanist', 'warm-humanist', 'Creative', 'Warm serif typography with terracotta accents and generous spacing.', true, false, true),
('Compact ATS', 'compact-ats', 'ATS-Friendly', 'Maximum one-page density and parser compatibility. Zero decoration. Free.', true, true, true),
('Elegant Contrast', 'elegant-contrast', 'Executive', 'Serif display name, thin gold hairlines, small-caps titles. Understated luxury.', true, false, true),
('Duo Tone', 'duo-tone', 'Professional', 'Light-gray right rail for contact and skills; sky-blue accented main column.', true, false, false),
('Bold Headline', 'bold-headline', 'Creative', 'Oversized name over a thick amber underline; chunky uppercase titles.', true, false, true),
('Soft Cards', 'soft-cards', 'Minimal', 'Sections in soft rounded cards with hairline borders. Calm and contemporary.', true, false, true),
('Azure Classic', 'azure-classic', 'Professional', 'Conservative centered layout with azure titles. Safe for any corporate role.', true, false, true),
('Ink Serif', 'ink-serif', 'Executive', 'Monochrome ink-on-paper serif with small-caps name and justified text.', true, false, true)
ON CONFLICT (template_key) DO UPDATE
SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  is_active = true,
  is_featured = EXCLUDED.is_featured,
  is_ats_optimized = EXCLUDED.is_ats_optimized,
  updated_at = now();
