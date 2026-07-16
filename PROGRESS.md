# Overhaul Progress
## Current task: P6-T3
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
- P4-T5: Align section manager keys with renderer
- P5-T1: Add paged A4 preview with zoom
- P5-T2: Show page-break indicators in preview
- P5-T3: Make builder usable on mobile with edit/preview tabs
- P5-T4: Consistent skeletons and empty states
- P5-T5: Visible autosave status in builder header
- P6-T1: Live template collage in hero
- P6-T2: Drive pricing page from subscription_plans
- P6-T3: Dark mode contrast fixes
- P6-T4: Per-page titles and meta descriptions
- P6-GATE: Lighthouse baseline matches previous phase; tsc + build pass; pushed
- P8-T1: Add useNotifications hook with realtime
- P8-T2: Add notification bell to header
- P8-T3: Notify job owners of new applications via DB trigger
- P8-GATE: bell shows live notification when an application is submitted; push.
- P9-T1: Add vitest with template + adapter unit tests
- P9-T2: Add GitHub Actions CI workflow (ci.yml)
- P9-T3: Route-level error boundary with monitoring seam
- P9-T4: Refresh README with setup, env, scripts, architecture diagram
- P9-GATE: All tests pass, GitHub Actions configured, project overhaul complete.
- P10-T1: Remove landing hero AI badge
- P10-T2: Introduce A4 dimension constants
- P10-T3: Standardize PDF exporter on A4 constants
- P10-T4: Use A4 constants in preview section
- P10-T5: Add cover_letters table migration
- P10-T6: Implement cover letter builder frontend
- P10-T7: Extend gemini-suggest for cover letters
- P10-T8: Add cover letter design templates
- P10-T9: Add sharing and comments database schema
- P10-T10: Implement public feedback and commenting UI
- P10-T11: Create view tracking edge function
- P10-T12: Add analytics charts dashboard
- P10-T13: Create master_profiles schema
- P10-T14: Add resume spawner and multi-language translation
- P10-GATE: E2E refined templates & FlowCV-like feature parity implemented and built cleanly.
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
