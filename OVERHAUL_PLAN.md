# FlowCreate — SaaS Overhaul Plan (Executor Edition)

> **Audience**: An AI coding assistant (e.g. Gemini Flash) executing tasks one at a time.
> **Companion file**: `GEMINI_MASTER_PROMPT.md` — your operating manual. Read it FIRST.
> **Written**: 2026-07-16, against commit `fb33c48` lineage.
>
> This plan is deliberately over-specified. Do not improvise beyond what a task
> says. If reality contradicts the plan (a file moved, a name changed), STOP the
> task and record the conflict in `PROGRESS.md` instead of guessing.

---

## 0. How to use this document

1. Tasks are ordered. Execute them strictly in order: `P1-T1`, `P1-T2`, … `P2-T1`, …
2. One task = one commit. Never batch tasks into one commit.
3. Before starting any task, re-read: §1 (Global Rules), §2 (Contracts), and the task itself. Nothing else is required reading for most tasks.
4. Track progress in `PROGRESS.md` (created in P0-T1). Update it after every task.
5. A task is DONE only when every item in its **Acceptance** list is true and the **Verify** commands pass.

---

## 1. Non-negotiable global rules

**Environment**: Windows, PowerShell. Node 22, npm. Vite + React 18 + TypeScript + Tailwind + shadcn/ui. Supabase project ref: `ufzxrojekrrvlweadnkq`.

### 1.1 Forbidden — never do these, in any task
- **Never edit** `src/integrations/supabase/types.ts` by hand. It is generated. Regenerate only when a task says so: `supabase gen types typescript --project-id ufzxrojekrrvlweadnkq > src/integrations/supabase/types.ts`
- **Never edit or delete** existing files in `supabase/migrations/` or `supabase/migrations_archive/`. Schema changes = a NEW migration file named `2026MMDDHHMMSS_short_name.sql`, applied with `supabase db push --linked`.
- **Never change** the request/response shape of any existing edge function (see §2.3). Adding optional response fields is allowed; renaming/removing fields is not.
- **Never touch**: `.env`, `vercel.json`, `src/integrations/supabase/client.ts` (env fallback logic), `supabase/config.toml` `verify_jwt` entries, `.gitignore`.
- **Never add, remove, or upgrade npm dependencies** unless the task explicitly names the package and version.
- **Never run**: `git push --force`, `git reset --hard`, `git checkout -- .`, `supabase db reset`, any `DROP TABLE`/`DELETE FROM` against the linked database.
- **Never store secrets** (API keys, tokens) in any committed file.
- **Never rename or change the signature of** exported hooks, exported components, or DB helper functions that existing code imports.

### 1.2 Required working method
- Small diffs. If a task seems to require touching more than ~6 files, stop and re-read it — you are probably overreaching.
- After every task: `npx tsc --noEmit -p tsconfig.app.json` then `npm run build`. Both must pass before committing.
- Commit message format: `[P<phase>-T<task>] <imperative summary>` e.g. `[P2-T1] Add template registry as single source of truth`.
- `git push origin main` ONLY at the end of a phase, after the phase's **Phase Gate** checklist passes. Pushing deploys to production via Vercel.
- Edge functions cannot be type-checked locally without Docker. Verification for them = deploy (`supabase functions deploy <name> --project-ref ufzxrojekrrvlweadnkq`, add `--no-verify-jwt` ONLY for the functions listed with it in §2.3) + test through the running app or `curl`.

### 1.3 Rendering constraints for ALL resume templates
The PDF exporter uses `html2canvas` + `jspdf` (`src/hooks/usePDFGenerator.tsx`). Every template style MUST obey:
- Colors: **hex or rgb() only** — never `oklch()`, `lab()`, CSS variables, or Tailwind classes inside `resumeTemplates.tsx` (that file uses inline `CSSProperties`).
- Fonts: always provide a fallback stack ending in a generic family, e.g. `"'Georgia', 'Times New Roman', serif"`. Do not add new webfont `<link>`s unless the task says so.
- Layout: prefer `flex`; avoid `position: fixed`, CSS `filter`, `backdrop-filter`, external images, and `background-image` URLs.
- Every `TemplateStyles` object must define ALL required keys of the `TemplateStyles` type in `src/utils/resumeTemplates.tsx` (container, header, name, contact, section, sectionTitle, sectionContent, item, itemTitle, itemSubtitle, itemDate, itemDescription, skillsList, skill) — optional: profilePhoto, sidebar, mainContent.
- Templates must respect `applyCustomization()` (same file): it overrides name/sectionTitle colors from `customization.primaryColor`, skill colors, fontSize multipliers (parses `fontSize` as px int — so those style keys MUST set `fontSize` as `'NNpx'` strings), spacing multipliers on `section.marginBottom`/`item.marginBottom` (also px strings).

---

## 2. System contracts (never break)

### 2.1 Database contract used by the frontend
| Table.column | Contract |
|---|---|
| `subscriptions.is_premium` (bool) + UNIQUE(user_id) | THE paywall flag. `usePremiumStatus` reads only this. |
| `resumes.resume_data` (jsonb NOT NULL) | Whole builder round-trips through it. Shape in §2.4. |
| `resumes.template_id` (text) | Currently stores legacy numeric strings `"1"`–`"7"`. Phase 2 migrates to slug keys but MUST keep reading legacy values forever. |
| `profiles.user_id` UNIQUE | Upsert conflict target. |
| `site_settings.setting_key` UNIQUE | `design_mode` row shape: `{"mode":"default"|"neo-brutalism"}`. Realtime is enabled on this table. |
| `resume_templates.template_key` UNIQUE | Admin-managed catalog; Phase 2 syncs it to the code registry. |
| `ai_api_keys.provider` CHECK | `'openai' | 'gemini' | 'deepseek'` only. |
| `payment_gateway_keys.provider` CHECK | `'razorpay' | 'stripe'` only. |
| Status vocabularies | applications: `new/reviewing/shortlisted/interviewing/offered/hired/rejected/withdrawn`; offers: `draft/sent/accepted/declined/rejected/expired/withdrawn`; reviews: `hire/neutral/reject`; jobs: `draft/published/active/paused/closed/archived`. |

RPC available: `is_admin()`, `get_user_entitlements(uuid)`, `get_org_entitlements(uuid)` (both return jsonb `{plan, is_premium/status, limits, features}`).

### 2.2 Plan strings
`planType` sent by the payment flow: `'monthly' | 'yearly' | 'lifetime'`. `subscription_plans.slug` matches these. Do not invent new plan strings.

### 2.3 Edge functions (12) — shapes frozen
| Function | Notes |
|---|---|
| `gemini-suggest` | POST `{prompt}` → `{suggestion}` or `{error}`. JWT required. |
| `extract-resume-data` | multipart `file` → `{success, data}` or `{success:false, error, requiresApiKey?}`. JWT required. |
| `create-razorpay-order` | `{planType}` → `{order_id, amount, currency, receipt, key_id}`. |
| `verify-razorpay-payment` | `{razorpay_payment_id, razorpay_order_id, razorpay_signature, planType}` → `{success,...}`. |
| `create-stripe-checkout` | `{planType, successUrl?, cancelUrl?}` → `{url}`. |
| `stripe-webhook`, `razorpay-webhook` | deploy with `--no-verify-jwt`. Signature-verified. |
| `admin-list-users`, `admin-delete-user`, `admin-add-org-member` | deploy with `--no-verify-jwt` (in-code admin checks). |
| `admin-create-user`, `send-notification` | JWT default. |
Shared helpers live in `supabase/functions/_shared/` (`aiKeyManager.ts`, `paymentKeyManager.ts`, `rateLimiter.ts`) and are auto-bundled on deploy.

### 2.4 `resume_data` JSON shape (builder-internal `ResumeData`, `src/utils/resumeAdapterUtils.ts`)
```
personal: { name, email, phone, address, summary, website?, linkedin?, profileImage? (base64 data URL) }
experience: [{ id:number, title, company, location, startDate, endDate, current:boolean, description }]
education:  [{ id, school, degree, field, startDate, endDate, description }]
skills:     string[]
projects?:  [{ id, title, description, link, technologies:string[] }]
customization?: { primaryColor?, secondaryColor?, accentColor?, textColor?, backgroundColor?,
                  fontFamily?, fontSize?: 'small'|'medium'|'large', spacing?: 'compact'|'normal'|'spacious',
                  lineHeight?, sectionOrder?: string[], hiddenSections?: string[] }
```
Never rename these keys — saved resumes in production depend on them. New customization keys may be ADDED (optional, with defaults).

### 2.5 Template system — current reality (as of this writing)
- **Renderer (source of truth)**: `src/utils/resumeTemplates.tsx` — `templateStyles: Record<string, TemplateStyles>` with 7 keys: `clean-slate, executive-serif, sidebar-modern, tech-engineer, coral-creative, navy-professional, emerald-minimal`; `templateNames: Record<string,string>` maps legacy IDs `"1"`–`"7"` → those keys; default-export component `ResumeTemplate({data, templateName, sectionOrder, hiddenSections})`.
- **Duplicate mapping**: `src/components/resume/ResumeData.ts` re-declares `templateNames` (identical). Multiple components import from one or the other.
- **Parallel Tailwind styles**: `src/utils/templateStyles.ts` (same 7 keys) used by `Templates.tsx` / `Examples.tsx` / `TemplateGallery.tsx` gallery mockups.
- **Hardcoded template lists** (id/name/category duplicated): `src/pages/Templates.tsx`, `src/components/TemplatesSection.tsx`, `src/components/TemplatesCarousel.tsx`, `src/components/resume/ResumeBuilderSidebar.tsx`, `src/components/resume/TemplateSelector.tsx`.
- **DB catalog mismatch**: `resume_templates` table has 20 seeded keys (`modern`, `classic`, `ats-pro`, …) that the renderer CANNOT render. The UI does not read the table for the gallery.

This fragmentation is what Phase 2 fixes.

---

## 3. Verification toolkit
```powershell
npx tsc --noEmit -p tsconfig.app.json     # type check (must be silent)
npm run build                             # production build (must succeed)
npm run dev                               # manual check at http://localhost:8080
supabase functions deploy <name> --project-ref ufzxrojekrrvlweadnkq [--no-verify-jwt]
supabase db push --linked                 # apply NEW migration files
```
Manual test accounts: the site owner's account is admin+premium. Create throwaway accounts for free-tier checks.

---

# PHASE 0 — Orientation (do this once, before anything else)

### P0-T1 — Baseline + progress tracker
- Run the verification toolkit (§3): `npx tsc --noEmit -p tsconfig.app.json` and `npm run build` must pass BEFORE you change anything. If they fail on a clean checkout, STOP and report — do not "fix" pre-existing failures.
- **Create**: `PROGRESS.md` at repo root with this exact structure:
```markdown
# Overhaul Progress
## Current task: P1-T1
## Completed
(none yet)
## Blocked / conflicts found
(none)
## Baseline notes
- build: OK @ <date>, tsc: OK @ <date>
```
- Read §1, §2 fully. Skim the file map in Appendix A. Open (read-only) the five files you will touch most: `resumeTemplates.tsx`, `templateStyles.ts`, `resumeAdapterUtils.ts`, `CustomizationPanel.tsx`, `useResumeSave.ts`.
- **Commit**: `[P0-T1] Add progress tracker; verify clean baseline`

---

# PHASE 1 — Fix AI provider routing (URGENT — live bug)

**Bug report**: Admin added a **DeepSeek** key in Admin → AI, but PDF upload fails with
`"AI resume parsing is not configured. Please add GEMINI_API_KEY"`.

**Root cause**: `extract-resume-data` and `gemini-suggest` call `AIKeyManager.getActiveKey('gemini')` — they only look up `provider='gemini'` rows, and both call Google's Gemini API directly. A DeepSeek key is never consulted. Additionally, PDF parsing currently sends the raw PDF via Gemini's multimodal `inline_data`, which DeepSeek/OpenAI chat APIs don't accept.

**Fix strategy**: extract PDF **text** inside the edge function, then send the text to whichever provider has an active key. Keep the Gemini raw-PDF path as the preferred branch (it handles scanned/complex PDFs better).

### P1-T1 — Shared multi-provider text-completion helper
- **Create**: `supabase/functions/_shared/aiProviders.ts`
- **Contract** (implement exactly):
```ts
export type AIProvider = 'gemini' | 'deepseek' | 'openai';
export interface TextModelResult { text: string | null; error?: string; }
export async function callTextModel(
  provider: AIProvider, apiKey: string, prompt: string,
  opts?: { maxTokens?: number; temperature?: number }
): Promise<TextModelResult>
```
- Gemini: `POST https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`, header `x-goog-api-key`, body `{contents:[{parts:[{text: prompt}]}], generationConfig:{temperature, maxOutputTokens}}`; text at `candidates[0].content.parts[0].text`.
- DeepSeek: `POST https://api.deepseek.com/chat/completions`, header `Authorization: Bearer <key>`, body `{model:'deepseek-chat', messages:[{role:'user', content: prompt}], temperature, max_tokens}`; text at `choices[0].message.content`.
- OpenAI: `POST https://api.openai.com/v1/chat/completions`, same shape as DeepSeek with `model:'gpt-4o-mini'`.
- Also export `async function getAnyActiveKey(keyManager): Promise<{provider: AIProvider, key: string} | null>` that tries, in order: gemini → deepseek → openai using `keyManager.getActiveKey(p)`. (`AIKeyManager` is in `_shared/aiKeyManager.ts`; note its `getActiveKey` already bumps usage counters.)
- Never log key values. Catch fetch errors and return `{text:null, error}`.
- **Acceptance**: file exists, no imports outside `_shared`, deploys as part of P1-T2/T3 bundles.
- **Commit**: `[P1-T1] Add shared multi-provider AI text-completion helper`

### P1-T2 — `gemini-suggest`: any active provider
- **Modify**: `supabase/functions/gemini-suggest/index.ts` only.
- Replace the Gemini-only key lookup + fetch with: `getAnyActiveKey` → `callTextModel`. Keep env `GEMINI_API_KEY` as final fallback (provider `'gemini'`). Keep: auth, rate limiting, prompt validation, response shape `{suggestion}` / `{error}` EXACTLY as-is. Keep the existing fallback-key retry semantics for gemini (`getFallbackKey('gemini')`) as a second attempt when the first provider errors.
- **Verify**: deploy; in the app (Resume Builder → AI suggestion button) a suggestion returns with ONLY the DeepSeek key active.
- **Commit**: `[P1-T2] Route AI suggestions through any active provider key`

### P1-T3 — `extract-resume-data`: text-extraction path for non-Gemini providers
- **Modify**: `supabase/functions/extract-resume-data/index.ts` only.
- Logic:
  1. Resolve key: gemini via `keyManager.getActiveKey('gemini')` ?? env `GEMINI_API_KEY`. If found → keep the CURRENT raw-PDF multimodal path unchanged.
  2. Else `getAnyActiveKey()`; if a deepseek/openai key exists → NEW path: extract text from the PDF with `unpdf` (`import { extractText, getDocumentProxy } from 'https://esm.sh/unpdf'`), cap extracted text at ~15,000 chars, build prompt = existing JSON-schema prompt + `\n\nRESUME TEXT:\n` + text, then `callTextModel`. Parse the response with the SAME cleanup/JSON.parse/fallback code already present.
  3. Else → keep the current "not configured" response but change the message to: `"AI resume parsing is not configured. Add a Gemini, DeepSeek, or OpenAI key in Admin → AI Management."` (keep `requiresApiKey:true`).
  - If `unpdf` extraction yields <100 chars (scanned/image PDF) and no Gemini key exists, return `{success:false, error:'This PDF appears to be scanned/image-based. Add a Google Gemini key to parse scanned PDFs.'}`.
- **Verify**: deploy; upload a text-based PDF in Account → PDF upload with only the DeepSeek key active → structured data returns. Then also confirm the response shape is unchanged (`{success:true, data:{personal,...}}`).
- **Commit**: `[P1-T3] Support DeepSeek/OpenAI for PDF resume parsing via text extraction`

### P1-T4 — Truthful UI copy
- **Modify**: `src/components/PDFUploader.tsx`, `src/components/profile/PDFResumeUploader.tsx`, `src/components/admin/AIManagement.tsx` (copy only — no logic).
- Anywhere the UI says a Gemini key is required, change copy to “an AI key (Gemini, DeepSeek, or OpenAI) — add one in Admin → AI Management”. In `AIManagement.tsx` add one sentence under the header: “Keys added here power AI suggestions and PDF resume import. Scanned/image PDFs require a Gemini key.”
- **Verify**: tsc + build.
- **Commit**: `[P1-T4] Update AI configuration copy to reflect multi-provider support`

**PHASE 1 GATE**: all 4 tasks done; suggestion + PDF import verified working with DeepSeek-only key; build passes → push to main; confirm on the live site.

---

# PHASE 2 — Template engine foundation (single source of truth)

Goal: one registry drives the builder, the gallery, the marketing pages, and the DB catalog. No behavior change for existing saved resumes.

### P2-T1 — Create the registry
- **Create**: `src/templates/registry.ts`
- **Contract**:
```ts
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
export const TEMPLATE_REGISTRY: TemplateDefinition[];               // ordered for display
export function resolveTemplateKey(idOrKey: string | null | undefined): string; // legacy id or key → canonical key; unknown → 'clean-slate'
export function getTemplate(key: string): TemplateDefinition;       // resolved, never undefined
```
- Seed with the 7 existing templates (keys/legacy ids per §2.5; take names/categories from `src/components/resume/ResumeBuilderSidebar.tsx`; all 7 `premium:false`).
- **Acceptance**: exhaustive unit-consistency — every key in `templateStyles` (renderer) has a registry entry and vice versa (add a dev-time console.warn check inside the module).
- **Commit**: `[P2-T1] Add template registry as single source of truth`

### P2-T2 — Route all template-key resolution through the registry
- **Modify**: `src/utils/resumeTemplates.tsx` (make `templateNames` a re-export derived from the registry; `ResumeTemplate` resolves via `resolveTemplateKey`), `src/components/resume/ResumeData.ts` (delete its duplicate `templateNames`, re-export from registry for backward compat), `src/pages/Account.tsx`, `src/components/resume/ResumeVisualPreview.tsx` (use `resolveTemplateKey`).
- Saving a resume must now store the canonical KEY in `resumes.template_id` (find the save path in `useResumeSave.ts`/`useResumeHandlers.ts` — change the value written from numeric id to canonical key). Reading must accept both (via `resolveTemplateKey`) forever.
- **Acceptance**: existing resume created before this change still renders with its correct template (test by setting a row's template_id to `"3"` manually if needed); new saves write slugs; tsc/build pass.
- **Commit**: `[P2-T2] Resolve template keys through registry; store slugs on save`

### P2-T3 — Gallery/marketing pages read the registry
- **Modify**: `src/pages/Templates.tsx`, `src/components/TemplatesSection.tsx`, `src/components/TemplatesCarousel.tsx`, `src/components/resume/ResumeBuilderSidebar.tsx`, `src/components/resume/TemplateSelector.tsx` — delete their hardcoded arrays; map over `TEMPLATE_REGISTRY` instead. Keep each page's visual design as-is.
- **Acceptance**: `/templates`, landing sections, builder sidebar, and template selector all list identical template sets; picking each works.
- **Commit**: `[P2-T3] Drive all template lists from the registry`

### P2-T4 — Live mini-previews in galleries
- **Modify**: `src/components/ResumeTemplatePreview.tsx` (or create `src/templates/TemplateThumbnail.tsx` if it can't be adapted cleanly).
- Render the REAL `ResumeTemplate` with mock data (`exampleResumes` / `templateMockData` in `resumeTemplates.tsx`) inside a scaled box: outer `overflow:hidden; aspect-ratio: 8.5/11`, inner `transform: scale(0.32); transform-origin: top left; width: 312.5%`. Use it in `Templates.tsx` and `TemplateSelector.tsx` in place of static mockups/placeholder images.
- **Acceptance**: every gallery card shows the template's actual rendering; no layout overflow; build passes.
- **Commit**: `[P2-T4] Replace static template mockups with live scaled previews`

### P2-T5 — Sync DB catalog to registry
- **Create migration** `2026MMDDHHMMSS_sync_resume_templates_to_registry.sql`:
  - UPSERT one row per registry key into `resume_templates` (`template_key = key`, name, category, description, `is_active=true`, `is_featured=featured`, `is_ats_optimized=atsOptimized`).
  - `UPDATE resume_templates SET is_active=false WHERE template_key NOT IN (<registry keys>);` (deactivate, don't delete — preserves usage counts).
- Apply with `supabase db push --linked`.
- **Acceptance**: Admin → Templates tab lists exactly the registry set as active.
- **Commit**: `[P2-T5] Sync resume_templates catalog to code registry`

**PHASE 2 GATE**: builder, gallery, selector, Account cards all consistent; legacy resume renders; new resume saves slug; build passes → push.

---

# PHASE 3 — Twelve new FlowCV-grade templates

Each task adds ONE template: (a) a complete `TemplateStyles` object in `resumeTemplates.tsx`, (b) a registry entry, (c) mock data entry if the design benefits from a distinct persona (optional — reuse an existing mock otherwise). Two-column layouts use the optional `sidebar`/`mainContent`/`profilePhoto` style keys — follow how the renderer consumes them today (check `ResumeTemplate`'s JSX before writing; if it renders single-column only, extend it ONCE in P3-T1 to support a `layout` prop from the registry: when `layout==='sidebar-left'|'sidebar-right'`, wrap contact+skills in `<aside style={styles.sidebar}>` and the rest in `<div style={styles.mainContent}>`; `header-band` renders header full-width above both).

Design tokens per template (hex only; obey §1.3). All 12 are `premium:true` except `compact-ats` and `timeline-dot` (free — good funnel).

| # | key | layout | fonts (with fallbacks) | palette (primary/accent/text) | distinctive features |
|---|---|---|---|---|---|
| 1 | `split-frame` | sidebar-left (32%) | Inter → sans-serif | sidebar bg `#1e293b`, sidebar text `#e2e8f0`, accent `#38bdf8`, main text `#111827` | Dark sidebar: photo (circle 96px), contact, skills as plain list; main: white, thin section rules |
| 2 | `timeline-dot` | single | Inter → sans-serif | `#0f766e` / `#14b8a6` / `#1f2937` | Experience items with left border `2px solid #ccfbf1` + 8px teal dot (border-radius 50%, absolute) per item |
| 3 | `header-band` | header-band | Inter → sans-serif | band bg `#4f46e5`, band text `#ffffff`, accent `#4f46e5`, text `#1f2937` | Full-width indigo header band (name 30px white, contact white/80); photo 84px circle right |
| 4 | `swiss-grid` | single | Helvetica, Arial → sans-serif | `#111111` / `#dc2626` / `#111111` | Oversized name 40px uppercase tight tracking; red 4px square before section titles; strict left alignment; no borders |
| 5 | `warm-humanist` | single | Georgia, 'Times New Roman' → serif | `#7c2d12` / `#ea580c` / `#292524` | Warm serif; italic subtitles; hairline `#fed7aa` section rules; spacious 1.7 line-height |
| 6 | `compact-ats` | single | Arial → sans-serif | `#000000` / `#374151` / `#111827` | 1-page density: 12px body, 24px paddings, 14px section gaps, bold-only hierarchy, zero color, skills as comma list (skill style = plain text, no bg) |
| 7 | `elegant-contrast` | single | Georgia headers + Inter body → serif/sans | `#1c1917` / `#b45309` / `#292524` | Serif 34px name, thin `1px #d6b26e`-tinted gold rules, small-caps section titles (letterSpacing .18em) |
| 8 | `duo-tone` | sidebar-right (30%) | Inter → sans-serif | sidebar bg `#f1f5f9`, accent `#0ea5e9`, text `#0f172a` | Light-gray right rail (skills, education, contact); main left; sky-blue name + tags |
| 9 | `bold-headline` | single | Inter → sans-serif | `#111827` / `#f59e0b` / `#1f2937` | 44px 800-weight name with 6px amber underline block; chunky 14px uppercase section titles |
| 10 | `soft-cards` | single | Inter → sans-serif | `#334155` / `#6366f1` / `#334155` | Each section wrapped look: section style gets bg `#f8fafc`, border `1px solid #e2e8f0`, radius 10px, padding 18px |
| 11 | `azure-classic` | single | Calibri, 'Segoe UI', Arial → sans-serif | `#1d4ed8` / `#1d4ed8` / `#1f2937` | Conservative corporate: centered name, thin double rule under header, azure section titles, dates right-aligned |
| 12 | `ink-serif` | single | 'Times New Roman', Georgia → serif | `#111111` / `#111111` / `#1f2937` | Print/monochrome: justified description text, small-caps name (letterSpacing .12em), horizontal rules only |

### P3-T1 — Extend renderer for layouts (one-time)
As described above; add `layout` handling to `ResumeTemplate` driven by `getTemplate(key).layout`. Existing 7 templates keep `layout:'single'` (except `sidebar-modern` stays visually identical — it is a border accent, not a true sidebar; leave it `single`). **Acceptance**: all 7 existing templates render EXACTLY as before (visual check).
**Commit**: `[P3-T1] Support sidebar and header-band layouts in resume renderer`

### P3-T2 … P3-T13 — One template per task, in table order
Per-task acceptance (identical for all 12):
1. Registry entry + styles object added; key naming matches the table.
2. Renders correctly in builder preview with real typed data AND in gallery thumbnail.
3. `applyCustomization` works: change primary color + font size in the customization panel → visible effect, no NaN font sizes (px strings!).
4. PDF export produces a correct A4 page (test via the builder's download button).
5. tsc + build pass.
**Commit**: `[P3-T<n>] Add <key> template`

### P3-T14 — Category filter chips in gallery
- **Modify**: `src/pages/Templates.tsx` — add filter chips (All + each category present in registry) and a Free/Premium badge on cards (`premium` flag). Follow existing shadcn/Tailwind styling.
- **Commit**: `[P3-T14] Add category filters and premium badges to template gallery`

**PHASE 3 GATE**: 19 templates render + export to PDF; gallery filter works; existing saved resumes unaffected; push.

---

# PHASE 4 — Customization panel (FlowCV parity)

All tasks modify `src/components/CustomizationPanel.tsx` (+ small support files) and extend `customization` with OPTIONAL keys only (§2.4 rule).

- **P4-T1** Accent presets: a row of 12 color swatches (hex list: `#2563eb #4f46e5 #7c3aed #db2777 #dc2626 #ea580c #d97706 #16a34a #0d9488 #0ea5e9 #64748b #111827`) setting `primaryColor`; custom color stays available. Commit: `[P4-T1] Add one-click accent color presets`
- **P4-T2** Font pairs: dropdown of 6 pairs (`Inter/Inter`, `Georgia/Inter`, `'Playfair-like' Georgia/Arial`, `Arial/Arial`, `'Times New Roman'/'Times New Roman'`, `'Segoe UI'/'Segoe UI'`) writing new optional keys `headingFont`, `bodyFont`; wire into `applyCustomization` (headingFont → name+sectionTitle+itemTitle, bodyFont → container). Keep the legacy `fontFamily` behavior for old resumes (if `fontFamily` set and new keys absent, behave as today). Commit: `[P4-T2] Add font pairing presets`
- **P4-T3** Density + line height controls: expose existing `spacing` and `lineHeight` (1.4/1.6/1.8) as labeled segmented controls. Commit: `[P4-T3] Expose density and line-height controls`
- **P4-T4** Photo controls: toggle show/hide (new key `showPhoto`, default true) and shape (`photoShape: 'circle'|'rounded'|'square'`, default circle) — respected in renderer where `supportsPhoto`. Commit: `[P4-T4] Add photo visibility and shape controls`
- **P4-T5** Section manager polish: ensure `sectionOrder`/`hiddenSections` UI (drag + eye toggles in `SectionDragDropCustomizer.tsx`) covers all sections the renderer supports; fix any mismatch between its section keys and the renderer's `renderSection` keys. Commit: `[P4-T5] Align section manager with renderer section keys`

**PHASE 4 GATE**: a resume saved with every new option set → reload → identical render → PDF matches preview; old resumes unaffected; push.

---

# PHASE 5 — Builder UX overhaul

- **P5-T1** A4 page frame: preview wraps content in a fixed-ratio page (white, shadow, 794×1123 CSS px) with zoom controls (50/75/100/125%) — modify `ResumePreviewSection.tsx`/`OptimizedResumePreview.tsx`. Do NOT change what `usePDFGenerator` captures — test PDF after. Commit: `[P5-T1] Add paged A4 preview with zoom`
- **P5-T2** Multi-page indicator: when content exceeds one page height, show a subtle page-break line + “Page 2” marker (visual only). Commit: `[P5-T2] Show page-break indicators in preview`
- **P5-T3** Mobile builder: below `md`, tabs to switch Edit/Preview instead of side-by-side (check `ResumeBuilder.tsx` layout). Commit: `[P5-T3] Make builder usable on mobile with edit/preview tabs`
- **P5-T4** Empty/loading states: skeletons already exist (`resume-skeleton.tsx`); ensure builder, gallery, account pages use them; add friendly empty state to Account when 0 resumes with a “Create your first resume” CTA. Commit: `[P5-T4] Consistent skeletons and empty states`
- **P5-T5** Autosave clarity: surface `useAutoSave`/`auto-save-indicator.tsx` status (“Saved · 12:03”, “Saving…”, error retry) in the builder header. Commit: `[P5-T5] Visible autosave status in builder header`

**PHASE 5 GATE**: builder E2E on desktop + 390px mobile; PDF still correct; push.

---

# PHASE 6 — Marketing & design polish

- **P6-T1** Landing hero: replace stock jpg usage with a live `TemplateThumbnail` collage (3 templates, slight rotation); keep CLS stable with fixed dimensions. Commit: `[P6-T1] Live template collage in hero`
- **P6-T2** Pricing page: read plans from `subscription_plans` (`supabase.from('subscription_plans').select().eq('product','resume').eq('is_active',true).order('display_order')`) instead of hardcoded arrays — keep the current card design; fall back to current hardcoded values if query fails. NOTE: server charge amounts still come from edge-function constants; this task is display-only. Commit: `[P6-T2] Drive pricing page from subscription_plans`
- **P6-T3** Dark-mode audit: fix any template gallery/builder surfaces unreadable in dark mode (resume preview itself always renders light — that's correct, it's paper). Commit: `[P6-T3] Dark mode contrast fixes`
- **P6-T4** SEO: per-page `<title>`/meta description via a tiny `usePageMeta` hook on the 10 public pages; template gallery gets per-category headings. Commit: `[P6-T4] Per-page titles and meta descriptions`

**PHASE 6 GATE**: Lighthouse (Chrome devtools) on `/` and `/templates`: no regressions vs before-phase baseline (record numbers in PROGRESS.md); push.

---

# PHASE 7 — Entitlements-based feature gating

- **P7-T1** `useEntitlements` hook: wraps `supabase.rpc('get_user_entitlements')` with react-query; returns `{plan, isPremium, limits:{max_resumes, ai_requests_per_month, premium_templates}, features}`; falls back to `{plan:'free', max_resumes:1}` on error. Do NOT remove `usePremiumStatus` (other code uses it). Commit: `[P7-T1] Add useEntitlements hook`
- **P7-T2** Resume limit from entitlements: `useResumeSave.ts` — replace hardcoded `1` with `limits.max_resumes` (−1 = unlimited); upsell copy references the pricing page instead of a hardcoded price. Commit: `[P7-T2] Enforce resume limit from entitlements`
- **P7-T3** Premium template gating: in TemplateSelector/gallery, non-premium users see premium templates with a lock badge; selecting one opens an upgrade dialog (shadcn `Dialog`, CTA → `/pricing`). Server-side is NOT enforced (acceptable: rendering is client-side). Commit: `[P7-T3] Gate premium templates with upgrade dialog`
- **P7-T4** AI usage metering: in `gemini-suggest` (edge), after success, upsert `usage_limits.ai_requests + 1` for the caller (service role client already available). Client-side: before calling, `useEntitlements` check `ai_requests_per_month` vs current `usage_limits.ai_requests` (reset logic: if `last_reset_at` older than 30 days, treat as 0 — implement reset in the edge function write). Free plan (`ai_requests_per_month: 0`) → AI buttons show the upgrade dialog. Commit: `[P7-T4] Meter AI usage against plan limits`

**PHASE 7 GATE**: free account: 1 resume max, locked premium templates, AI upsell; premium account: unlimited; push.

---

# PHASE 8 — Notifications UI

- **P8-T1** `useNotifications` hook: list latest 20 for current user, unread count, `markRead(id)`, `markAllRead()`; realtime subscription to `postgres_changes INSERT on public.notifications filter user_id=eq.<uid>` (realtime is already enabled on the table). Commit: `[P8-T1] Add useNotifications hook with realtime`
- **P8-T2** Bell in `Header.tsx` (auth’d users): badge with unread count, popover list (title, body, relative time), items link to `action_url` when present, mark-read on open. Match both header design variants (default + neo-brutalism). Commit: `[P8-T2] Add notification bell to header`
- **P8-T3** Wire ATS events: on application submit (`ATSApply.tsx` success path) invoke `send-notification` for the job's org owner — NOTE `send-notification` requires admin JWT or service key, so instead: create a tiny migration adding an AFTER INSERT trigger on `job_applications` that inserts a `notifications` row for the job creator (SECURITY DEFINER function `notify_new_application()`; title 'New application', body = candidate name + job title, action_url `/ats/applications/<id>`). Commit: `[P8-T3] Notify job owners of new applications via DB trigger`

**PHASE 8 GATE**: bell shows live notification when an application is submitted; push.

---

# PHASE 9 — Quality hardening

- **P9-T1** Vitest setup: add dev deps `vitest` + `@testing-library/react` + `jsdom` (versions: latest stable at execution time); `npm run test` script. First tests: `resolveTemplateKey` (legacy ids, unknown, canonical), `applyCustomization` (px math, no NaN), adapter round-trip (`resumeAdapterUtils`). Commit: `[P9-T1] Add vitest with template + adapter unit tests`
- **P9-T2** GitHub Actions: `.github/workflows/ci.yml` — on PR/push to main: install, tsc, test, build. No deploy steps (Vercel handles deploys). Commit: `[P9-T2] Add CI workflow`
- **P9-T3** Error boundary + Sentry-ready hook: ensure `error-boundary.tsx` wraps route content in `App.tsx`; add `src/lib/monitoring.ts` no-op `captureError(e)` used by boundary + payment hooks (Sentry can be dropped in later without refactor). Commit: `[P9-T3] Route-level error boundary with monitoring seam`
- **P9-T4** README refresh: setup, env, scripts, architecture diagram (text), links to plan docs. Commit: `[P9-T4] Refresh README`

**PHASE 9 GATE**: CI green on GitHub; push.

---

## Appendix A — Key file map
```
src/utils/resumeTemplates.tsx        renderer + inline styles + mock data (SOURCE OF TRUTH for rendering)
src/utils/templateStyles.ts          legacy Tailwind gallery styles (retire after P2-T4 — delete only when nothing imports it)
src/utils/resumeAdapterUtils.ts      ResumeData type + adapters (do not rename keys)
src/components/resume/*              builder UI
src/components/CustomizationPanel.tsx  customization controls
src/hooks/useResumeSave.ts           save + free-limit enforcement
src/hooks/usePDFGenerator.tsx        html2canvas+jspdf export
src/pages/{Templates,TemplateGallery,Examples}.tsx   galleries
supabase/functions/*                 edge functions (Deno)
supabase/migrations/*                applied migrations (append-only)
```

## Appendix B — Definition of Done (every task)
1. Acceptance list satisfied. 2. `npx tsc --noEmit -p tsconfig.app.json` silent. 3. `npm run build` succeeds. 4. Manual verify step done. 5. `PROGRESS.md` updated. 6. Single commit with the prescribed message.
