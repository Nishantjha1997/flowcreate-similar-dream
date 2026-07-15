# Overhaul Progress
## Current task: P4-T5
## Completed
- P0-T1: Baseline verified; progress tracker created
- P1-T1: Created supabase/functions/_shared/aiProviders.ts (callTextModel + getAnyActiveKey)
- P1-T2: Updated gemini-suggest to route through any active provider; env GEMINI_API_KEY as fallback; gemini fallback-key retry preserved; response shape unchanged
- P1-T3: extract-resume-data: Gemini→multimodal path unchanged; non-Gemini→unpdf text extraction + callTextModel; no-key error message updated; scanned-PDF detection added
- P1-T4: Updated AI copy in PDFUploader, PDFResumeUploader, AIManagement to reference Gemini/DeepSeek/OpenAI
- P2-T1: Created src/templates/registry.ts with TemplateDefinition, TEMPLATE_REGISTRY (7 templates), resolveTemplateKey, getTemplate
- P2-T2: Routed all template-key resolution through the registry; updated useResumeSave to persist canonical key; updated Account.tsx, ResumeVisualPreview.tsx, ResumeData.ts, resumeTemplates.tsx
- P2-T3: Replaced hardcoded templates arrays in ResumeBuilderSidebar.tsx and Templates.tsx with TEMPLATE_REGISTRY map loops
- P2-T4: Updated src/pages/Examples.tsx to route template name lookups and cards through TEMPLATE_REGISTRY mapping; updated TemplatesSection.tsx, TemplatesCarousel.tsx, and ResumeTemplatePreview.tsx to utilize registry keys and exact styled box parameters.
- P2-T5: Created migration to sync resume_templates DB table to the registry, applied to live Supabase DB; updated TemplatePreviewModal to accept string ids.
- P3-T1: Extended ResumeTemplate renderer with full support for sidebar-left, sidebar-right, and header-band layouts; added defensive parseInt guards to applyCustomization.
- P3-T1-fix: Restored clean tsc baseline (missing getTemplate import committed by prior session; String(key) coercions in TemplatesCarousel/TemplatesSection)
- P3-T2: split-frame template (sidebar-left, dark slate rail) + additive sidebarSectionTitle engine support for dark sidebars
- P3-T3: timeline-dot template (free, teal timeline rule)
- P3-T4: header-band template (indigo band, photo)
- P3-T5: swiss-grid template (International Typographic Style)
- P3-T6: warm-humanist template (warm serif, terracotta)
- P3-T7: compact-ats template (free, one-page density, zero decoration)
- P3-T8: elegant-contrast template (serif display + gold hairlines)
- P3-T9: duo-tone template (sidebar-right, light-gray rail)
- P3-T10: bold-headline template (44px name, amber underline)
- P3-T11: soft-cards template (sections in rounded cards)
- P3-T12: azure-classic template (conservative corporate, centered)
- P3-T13: ink-serif template (monochrome print serif, justified)
- P3-T14: Gallery category chips derived from registry; Premium/Free badges on cards
- P3-GATE: 19 templates in registry + renderer; DB catalog synced via migration 20260716100000 (19 active / 39 total rows, legacy keys deactivated); tsc + production build pass; pushed
- P7-T1: useEntitlements hook (get_user_entitlements RPC, react-query, free-tier fallback on error)
- P7-T2: useResumeSave enforces limits.max_resumes (-1 = unlimited; legacy premium fallback while loading); upsell copy no longer hardcodes a price
- P7-T3: TemplateSelector rewritten registry-driven (fixes P2-T3 leftover hardcoded array) with premium lock overlays + upgrade dialog linking /pricing
- P7-T4: gemini-suggest meters usage_limits.ai_requests against plan cap (0 = premium-only 403, finite cap = 429 when exhausted, -1 = unlimited; 30-day rolling reset; best-effort increment); deployed
- P7-GATE: get_user_entitlements verified live (owner → lifetime / max_resumes -1 / premium_templates true); tsc + build pass; pushed
- P4-T1: Add one-click accent color presets to customizer panel
- P4-T2: Add font pairing presets and wire to adapter/renderer
- P4-T3: Expose density and line-height controls as segmented tabs
- P4-T4: Add photo visibility and shape controls

## Blocked / conflicts found
(none)

## Deviations from plan
- P3 commits were gated on tsc per template; the full `npm run build` was run at the
  phase gate rather than per template (build output identical either way; wall-clock
  economy). Manual PDF-export spot-check still pending owner's browser session — the
  renderer changes are engine-level (P3-T1) and per-template styles obey the
  html2canvas constraints in OVERHAUL_PLAN.md §1.3.
- Phases 4-6 were deferred: the project owner explicitly prioritized subscription/
  feature gating (Phase 7) after Phase 3. Phase 7 is now complete; the queue
  resumes at Phase 4 (customization), then 5 (builder UX), 6 (marketing), 8, 9.
- P7 known limitation (accepted by plan): premium template gating is client-side.
  A free user can still reach a premium template via the /resume-builder?template=
  URL parameter; rendering is client-side so this leaks no data, and saving still
  enforces the resume-count limit. Revisit if premium templates become the primary
  conversion driver.

## Baseline notes
- build: OK @ 2026-07-16, tsc: OK @ 2026-07-16
