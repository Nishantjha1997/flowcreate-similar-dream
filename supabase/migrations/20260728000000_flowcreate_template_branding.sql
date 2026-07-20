-- Keep the database catalog aligned with the distinct customer-facing names in
-- src/templates/registry.ts. Internal template_key values are intentionally
-- unchanged so previously saved resumes continue to resolve correctly.

update public.resume_templates as template
set
  name = catalog.name,
  description = catalog.description,
  updated_at = now()
from (values
  ('atlantic-blue', 'Northstar Panel', 'Deep navy profile rail with crisp metadata and a bright, spacious career column.'),
  ('mercury-flow', 'Tide Minimal', 'Centered introduction with sea-green accents and a calm chronological rhythm.'),
  ('steady-form', 'Scholar Frame', 'Editorial serif typography with a restrained portrait and academic clarity.'),
  ('classic-clear', 'Meridian Rule', 'Confident nameplate and structured blue rules for corporate applications.'),
  ('editorial-rule', 'Ledger Serif', 'Dense executive hierarchy with serif type and disciplined horizontal separators.'),
  ('hunter-green', 'Evergreen Column', 'Forest profile column paired with a light, highly readable experience canvas.'),
  ('cobalt-edge', 'Horizon Banner', 'Wide cobalt introduction band above a balanced modular content grid.'),
  ('blue-neon', 'Signal Line', 'Minimal white canvas anchored by an energetic electric-blue edge.'),
  ('precision-line', 'Matrix Compact', 'High-density ATS layout with measurable skills and compact professional detail.'),
  ('saffron-line', 'Amber Thread', 'Fine warm rules and generous white space create a polished, approachable page.'),
  ('charcoal-glow', 'Graphite Band', 'Graphite introduction band with high-contrast identity and clean body sections.'),
  ('quicksilver', 'Silver Rail', 'Soft silver information rail with modern typography and understated contrast.'),
  ('almost-black', 'Night Canvas', 'Dramatic dark canvas with luminous details for creative and technology roles.'),
  ('typewriter-photo', 'Studio Serif', 'Portrait-led studio rail paired with characterful serif editorial typography.')
) as catalog(template_key, name, description)
where template.template_key = catalog.template_key;
