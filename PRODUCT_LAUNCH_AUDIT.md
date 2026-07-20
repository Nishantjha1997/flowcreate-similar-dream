# FlowCreate Product Launch Audit

Updated: 2026-07-20

## Executive assessment

FlowCreate has a broad feature set, but breadth is ahead of reliability. The resume builder is roughly 75% of the way to a polished consumer launch; the combined Resume Builder + ATS SaaS is closer to 65% because billing, account lifecycle, monitoring, export QA, and server-side usage enforcement still need production proof.

The current catalog contains 33 templates: 13 free, 20 premium, 25 marked ATS-optimized, and 13 supporting photos. Adding dozens of near-duplicates is not the highest-value next step. The launch path is to make the existing catalog original, dependable, searchable, and consistently printable.

FlowCreate must not reproduce FlowCV or Resume.io templates pixel-for-pixel. Layout ideas such as a single column, sidebar, header band, serif executive page, or compact ATS page are common design patterns; the final typography, proportions, visual details, names, preview assets, and branding must remain distinctly FlowCreate.

## Repairs completed in this refinement pass

- Selected templates are now stored in `resume_data.selectedTemplate` and reopen from `resumes.template_id` even when an edit URL only includes the resume ID.
- Section order, hidden sections, and custom section titles are persisted in resume customization data.
- The default rendered order now correctly uses `summary` instead of the non-renderable `personal` key.
- Section title editing is available in the layout panel.
- Premium templates are gated consistently inside the builder, not only in the standalone selector.
- Template filters for All, Free, ATS, and Photo designs reduce catalog clutter.
- Autosave avoids overlapping writes and no longer reports a failed/blocked save as successful.
- Tablet/mobile edit and preview breakpoints are aligned.
- Exact-page-height previews no longer show a phantom page break.
- Decimal font sizes retain precision during customization.
- Sidebar heading accents respond to color customization.
- A native ATS PDF route now preserves selectable text and hyperlinks through the browser's Save as PDF dialog; the quick-download image PDF remains available for visual fidelity.
- Customer-facing competitor branding was removed from the 14 studio templates while preserving internal keys for saved-resume compatibility.

## P0: required before accepting paying customers

### 1. Export certification

- Test all 33 templates with short, one-page, long two-page, portrait, no-portrait, and long-URL data.
- Verify Chrome, Edge, Safari, Android Chrome, and iOS Safari.
- Confirm native-print PDFs contain selectable text, clickable links, embedded/available fonts, correct A4 pagination, and no clipped sidebars.
- Label quick PDF as visual export and ATS PDF as selectable-text export until a server-side PDF renderer replaces both paths.
- Add visual regression screenshots for every template at A4 dimensions.

Acceptance: every template passes the matrix without clipping, blank pages, unreadable contrast, or content loss.

### 2. Billing and entitlement production test

- Complete one successful, one failed, one replayed, and one refunded Razorpay transaction in test mode.
- Complete the same Stripe matrix before enabling Stripe UI.
- Verify webhook idempotency, subscription expiry, lifetime access, invoice records, and downgrade behavior.
- Enforce resume limits in the database or a server RPC; client-only limits are bypassable.
- Make all template gates use the entitlement response as the primary source.

Acceptance: a replayed webhook cannot extend access twice, and direct REST inserts cannot bypass paid limits.

### 3. Account lifecycle and trust

- Add email change with re-verification.
- Add self-service account deletion with a clear confirmation and documented retention behavior.
- Verify password change by re-authenticating when Supabase requires a recent session.
- Add consent/privacy copy for AI resume parsing and candidate discovery.
- Publish final legal entity, contact, refund, privacy, and terms details before custom-domain launch.

Acceptance: a user can export and delete their personal data without administrator help.

### 4. Monitoring and support

- Replace the no-op monitoring adapter with Sentry or an equivalent provider.
- Route caught errors and Edge Function failures through the monitoring adapter.
- Add release/environment tags and redact resume content, email addresses, API keys, and payment payload secrets.
- Verify support tickets and notification email delivery in production.

Acceptance: a deliberate frontend error and Edge Function failure appear in monitoring with no sensitive resume content.

## P1: resume-builder parity without copying competitors

### Document controls

- Add A4 and US Letter page size.
- Add locale-aware date formats and configurable date style.
- Add RTL rendering and Arabic/Hebrew font stacks before claiming multilingual parity.
- Add custom sections with typed variants: text, list, timeline, key/value, and skill chips.
- Add per-section column assignment for supported layouts.
- Add safe page-break controls: keep heading with next item and keep experience item together.

### Import and content workflow

- Expand import from PDF-only to DOCX, pasted text, PNG, and JPG.
- Show a review/diff step before imported data overwrites existing sections.
- Add job-description tailoring with keyword evidence, not an unverifiable single ATS score.
- Add version history and restore for paid users.
- Match cover-letter colors and typography to the selected resume automatically.

### Original template families to add after QA

Build original, role-led families rather than competitor clones:

1. Recruiter One — strict one-column ATS layout.
2. Campus Start — education/projects-first graduate layout.
3. Clinical Clear — licenses and certifications emphasized.
4. Counsel Serif — conservative legal structure.
5. Product Narrative — outcomes and selected projects.
6. Studio Portfolio — restrained creative rail with portfolio links.
7. Sales Impact — metrics-forward achievements.
8. Academic CV — publications, research, teaching, and conferences.
9. Public Service — government-friendly monochrome layout.
10. Global Photo — photo-aware international format.
11. RTL Modern — mirrored Arabic/Hebrew layout.
12. Executive Two-Page — deliberate multi-page leadership format.

Each family must have its own spacing tokens, type pairing, accent behavior, and long-content rules. It must pass the same export matrix before being marked active.

## P1: product and SaaS polish

- Finish candidate-facing job tracking; the current ATS primarily serves recruiters.
- Wire notification email dispatch to actual application, interview, offer, billing, and support events.
- Decide whether Stripe is launch scope; hide incomplete gateway options until fully usable.
- Add an onboarding checklist that ends when the first resume is saved and exported.
- Add empty, error, offline, and retry states for every core query.
- Audit keyboard navigation, focus trapping, contrast, form labels, and screen-reader announcements.
- Add a PWA manifest only if offline/read-later behavior is intentionally supported; installability alone is not a launch blocker.

## P2: growth and custom-domain launch

- Set the production `VITE_SITE_URL` once the custom domain is purchased.
- Regenerate sitemap, canonical URLs, OG URLs, robots sitemap reference, and Supabase auth redirects for that domain.
- Keep Vercel preview deployments `noindex` and production indexable.
- Generate static or prerendered HTML for blog and profession landing pages so social crawlers receive route-specific metadata.
- Add original template detail pages with descriptive copy, FAQs, screenshots, and internal links.
- Publish useful resume examples and career guidance; avoid thin programmatic pages.
- Measure Core Web Vitals, builder completion, save success, export success, checkout completion, and support failures.

## Release gates

Run these for every release:

1. `npx tsc --noEmit`
2. `npm test`
3. `npm run build`
4. Template registry/style parity test
5. A4 visual regression suite
6. Auth smoke test
7. Save/reopen/share/export smoke test
8. Payment webhook replay test
9. RLS tenant-isolation test
10. Production-domain SEO crawl

Do not call the product finished because a page renders. It is finished when the data survives save/reopen, every paid gate is enforced server-side, exports are usable by recruiters and ATS systems, failures are observable, and the user can control and delete their data.
