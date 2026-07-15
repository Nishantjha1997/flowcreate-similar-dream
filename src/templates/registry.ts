// ═══════════════════════════════════════════════════════════════
// TEMPLATE REGISTRY — single source of truth for all templates
// Do NOT hardcode template lists anywhere else; always map over
// TEMPLATE_REGISTRY or use resolveTemplateKey / getTemplate.
// ═══════════════════════════════════════════════════════════════

export interface TemplateDefinition {
  key: string;                 // canonical slug, e.g. 'clean-slate'
  legacyIds: string[];         // e.g. ['1'] — old resumes.template_id values that map here
  name: string;                // display name, e.g. 'Clean Slate'
  category: 'Minimal' | 'Professional' | 'Creative' | 'Technology' | 'Executive' | 'ATS-Friendly';
  description: string;         // <= 90 chars
  layout: 'single' | 'sidebar-left' | 'sidebar-right' | 'header-band';
  atsOptimized: boolean;
  featured: boolean;
  premium: boolean;            // gated behind is_premium (enforced in Phase 7)
  supportsPhoto: boolean;
  defaultAccent: string;       // hex
}

// ─── 7 existing templates (all free) ─────────────────────────────────────────

export const TEMPLATE_REGISTRY: TemplateDefinition[] = [
  {
    key: 'clean-slate',
    legacyIds: ['1', 'modern'],
    name: 'Clean Slate',
    category: 'Minimal',
    description: 'Ultra-minimal single column with thin top accent line and maximum white space.',
    layout: 'single',
    atsOptimized: true,
    featured: true,
    premium: false,
    supportsPhoto: false,
    defaultAccent: '#2563eb',
  },
  {
    key: 'executive-serif',
    legacyIds: ['2', 'classic', 'executive'],
    name: 'Executive Serif',
    category: 'Executive',
    description: 'Timeless serif design with centered header and double-rule section dividers.',
    layout: 'single',
    atsOptimized: true,
    featured: true,
    premium: false,
    supportsPhoto: false,
    defaultAccent: '#111827',
  },
  {
    key: 'sidebar-modern',
    legacyIds: ['3'],
    name: 'Sidebar Modern',
    category: 'Creative',
    description: 'Bold violet left accent border with clean typography and subtle section rules.',
    layout: 'single',
    atsOptimized: true,
    featured: true,
    premium: false,
    supportsPhoto: false,
    defaultAccent: '#7c3aed',
  },
  {
    key: 'tech-engineer',
    legacyIds: ['4', 'technical', 'developer', 'data-scientist'],
    name: 'Tech Engineer',
    category: 'Technology',
    description: 'Dark slate header with cyan accents; monospace font for a developer-first look.',
    layout: 'single',
    atsOptimized: true,
    featured: true,
    premium: false,
    supportsPhoto: false,
    defaultAccent: '#06b6d4',
  },
  {
    key: 'coral-creative',
    legacyIds: ['5', 'creative', 'elegant'],
    name: 'Coral Creative',
    category: 'Creative',
    description: 'Warm coral palette with bold section headers and expressive typographic rhythm.',
    layout: 'single',
    atsOptimized: false,
    featured: true,
    premium: false,
    supportsPhoto: false,
    defaultAccent: '#f97316',
  },
  {
    key: 'navy-professional',
    legacyIds: ['6', 'professional'],
    name: 'Navy Professional',
    category: 'Professional',
    description: 'Navy blue header band with clean two-tone layout; perfect for corporate roles.',
    layout: 'single',
    atsOptimized: true,
    featured: true,
    premium: false,
    supportsPhoto: false,
    defaultAccent: '#1e3a5f',
  },
  {
    key: 'emerald-minimal',
    legacyIds: ['7', 'minimalist'],
    name: 'Emerald Minimal',
    category: 'Minimal',
    description: 'Fresh emerald green accents on a clean white canvas with generous spacing.',
    layout: 'single',
    atsOptimized: true,
    featured: true,
    premium: false,
    supportsPhoto: false,
    defaultAccent: '#059669',
  },

  // ─── 12 new templates (Phase 3) ─────────────────────────────────────────────

  {
    key: 'split-frame',
    legacyIds: [],
    name: 'Split Frame',
    category: 'Professional',
    description: 'Dark slate sidebar with photo, contact and skills; crisp white main column.',
    layout: 'sidebar-left',
    atsOptimized: false,
    featured: true,
    premium: true,
    supportsPhoto: true,
    defaultAccent: '#38bdf8',
  },
  {
    key: 'timeline-dot',
    legacyIds: [],
    name: 'Timeline',
    category: 'Professional',
    description: 'Experience entries on a teal timeline rule with accented dates. Free.',
    layout: 'single',
    atsOptimized: true,
    featured: true,
    premium: false,
    supportsPhoto: false,
    defaultAccent: '#14b8a6',
  },
  {
    key: 'header-band',
    legacyIds: [],
    name: 'Header Band',
    category: 'Creative',
    description: 'Full-width indigo header band with photo; clean single-column body.',
    layout: 'header-band',
    atsOptimized: true,
    featured: true,
    premium: true,
    supportsPhoto: true,
    defaultAccent: '#4f46e5',
  },
  {
    key: 'swiss-grid',
    legacyIds: [],
    name: 'Swiss Grid',
    category: 'Minimal',
    description: 'International Typographic Style: oversized name, red accents, zero decoration.',
    layout: 'single',
    atsOptimized: true,
    featured: true,
    premium: true,
    supportsPhoto: false,
    defaultAccent: '#dc2626',
  },
  {
    key: 'warm-humanist',
    legacyIds: [],
    name: 'Warm Humanist',
    category: 'Creative',
    description: 'Warm serif typography with terracotta accents and generous spacing.',
    layout: 'single',
    atsOptimized: true,
    featured: false,
    premium: true,
    supportsPhoto: false,
    defaultAccent: '#ea580c',
  },
  {
    key: 'compact-ats',
    legacyIds: ['ats-basic', 'compact', 'ats-pro'],
    name: 'Compact ATS',
    category: 'ATS-Friendly',
    description: 'Maximum one-page density and parser compatibility. Zero decoration. Free.',
    layout: 'single',
    atsOptimized: true,
    featured: true,
    premium: false,
    supportsPhoto: false,
    defaultAccent: '#374151',
  },
  {
    key: 'elegant-contrast',
    legacyIds: [],
    name: 'Elegant Contrast',
    category: 'Executive',
    description: 'Serif display name, thin gold hairlines, small-caps titles. Understated luxury.',
    layout: 'single',
    atsOptimized: true,
    featured: false,
    premium: true,
    supportsPhoto: false,
    defaultAccent: '#b45309',
  },
  {
    key: 'duo-tone',
    legacyIds: [],
    name: 'Duo Tone',
    category: 'Professional',
    description: 'Light-gray right rail for contact and skills; sky-blue accented main column.',
    layout: 'sidebar-right',
    atsOptimized: false,
    featured: false,
    premium: true,
    supportsPhoto: true,
    defaultAccent: '#0ea5e9',
  },
];

// ─── Dev-time consistency guard ───────────────────────────────────────────────
// Imported lazily to avoid circular dependency at runtime; only runs in dev.
if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
  // Warn if any registry key has a duplicate
  const keys = TEMPLATE_REGISTRY.map((t) => t.key);
  const dupes = keys.filter((k, i) => keys.indexOf(k) !== i);
  if (dupes.length) {
    console.warn('[registry] Duplicate template keys detected:', dupes);
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DEFAULT_KEY = 'clean-slate';

/**
 * Convert a legacy numeric id ("1"–"7") or a canonical key to the canonical key.
 * Unknown values fall back to DEFAULT_KEY.
 */
export function resolveTemplateKey(idOrKey: string | null | undefined): string {
  if (!idOrKey) return DEFAULT_KEY;

  // Already a canonical key?
  if (TEMPLATE_REGISTRY.some((t) => t.key === idOrKey)) return idOrKey;

  // Legacy id?
  const byLegacy = TEMPLATE_REGISTRY.find((t) => t.legacyIds.includes(idOrKey));
  if (byLegacy) return byLegacy.key;

  // Unknown — fall back gracefully
  console.warn(`[registry] Unknown template id/key "${idOrKey}", falling back to "${DEFAULT_KEY}"`);
  return DEFAULT_KEY;
}

/**
 * Return the TemplateDefinition for a canonical key.
 * Always returns a value (falls back to DEFAULT_KEY entry).
 */
export function getTemplate(key: string): TemplateDefinition {
  return TEMPLATE_REGISTRY.find((t) => t.key === key) ?? TEMPLATE_REGISTRY[0];
}
