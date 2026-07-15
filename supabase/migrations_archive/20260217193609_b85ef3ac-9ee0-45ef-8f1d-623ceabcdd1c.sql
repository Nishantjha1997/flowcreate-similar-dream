INSERT INTO public.resume_templates (name, template_key, category, description, is_active, is_featured, is_ats_optimized)
VALUES
  ('ATS Classic', 'ats-classic', 'ATS-Friendly', 'Clean serif layout with traditional formatting. Maximum ATS compatibility with timeless professional appeal.', true, true, true),
  ('ATS Modern', 'ats-modern', 'ATS-Friendly', 'Contemporary sans-serif design with subtle blue accents. Perfect balance of modern aesthetics and ATS parsability.', true, true, true),
  ('ATS Executive', 'ats-executive', 'ATS-Friendly', 'Authoritative serif template designed for senior leadership and C-suite roles. Commands attention while remaining fully ATS-compatible.', true, false, true),
  ('ATS Tech', 'ats-tech', 'ATS-Friendly', 'Developer-optimized template with clean structure for technical roles. ATS-friendly format that highlights technical skills effectively.', true, true, true),
  ('ATS Minimal', 'ats-minimal', 'ATS-Friendly', 'Ultra-clean minimalist design with zero distractions. Maximum readability and perfect ATS parsing scores.', true, false, true),
  ('ATS Corporate', 'ats-corporate', 'ATS-Friendly', 'Polished corporate template with centered layout. Ideal for consulting, finance, and enterprise roles.', true, false, true)
ON CONFLICT (template_key) DO NOTHING;