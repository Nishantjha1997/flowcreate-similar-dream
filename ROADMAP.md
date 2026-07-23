# FlowCreate — Product Enhancement & Polish Roadmap

> **Written**: 2026-07-23 from the `e3923fc` code baseline; reviewed against roadmap commit
> `bac94ff` on 2026-07-23.
> **Audience**: any developer or AI coding agent picking up work on this repo. This document is
> self-contained: it describes the current state, the reasoning behind every task, exact file
> pointers, and acceptance criteria. Read §1 (how to work in this repo) before touching anything.
>
> **Relationship to other planning docs in this repo** (written by parallel agents):
> - `PROJECT.md` — an in-flight dashboard-simplification + 14-premium-templates effort with its own
>   milestone tracker. Do not duplicate that work; check its milestone table before starting
>   anything touching `Account.tsx`, `Admin.tsx`, `registry.ts`, or `resumeTemplates.tsx`.
> - `OVERHAUL_PLAN.md` §1.3 — **binding rendering constraints for all resume templates** (inline
>   hex/rgb colors only, px-string font sizes, no CSS variables inside `resumeTemplates.tsx`).
>   Those constraints still apply to every task below that touches templates.
> - `REFINED_PLAN.md` — schema consolidation history; explains why `supabase/migrations/` is
>   append-only and what the live DB actually contains.
> This roadmap is the forward-looking product plan that sits on top of those.

---

## 1. How to work in this repo (read first)

### 1.1 Environment & commands
- Windows 10, PowerShell. Node 22. Supabase project ref: `ufzxrojekrrvlweadnkq`.
- **Typecheck**: `& "$env:ProgramFiles\nodejs\node.exe" node_modules\typescript\bin\tsc --noEmit`
- **Tests**: `& "$env:ProgramFiles\nodejs\node.exe" node_modules\vitest\vitest.mjs run`
- **Build**: `& "$env:ProgramFiles\nodejs\node.exe" node_modules\vite\bin\vite.js build`
  (invoke node directly — `npm run` has segfaulted under Git Bash on this machine)
- **Deploy an edge function**: `supabase functions deploy <name> --project-ref ufzxrojekrrvlweadnkq`
  (there is NO auto-deploy of edge functions; pushing to git only deploys the frontend via Vercel)
- **Query live DB**: write SQL to a file, then `supabase db query --linked -f <file>`
- **Schema changes**: new file in `supabase/migrations/` named `2026MMDDHHMMSS_name.sql`, applied
  with `supabase db push --linked`. Never edit existing migrations. Never hand-edit
  `src/integrations/supabase/types.ts` (regenerate with `supabase gen types typescript --project-id ufzxrojekrrvlweadnkq`).

### 1.2 Environment flakiness — retry, don't debug
These errors are transient Windows spawn/network noise and resolve on 1–3 identical retries:
`EPERM ... uv_spawn pwsh.exe`, bare `Exit code 5`, `remote helper 'https' aborted session`,
`the remote end hung up unexpectedly`, vitest "Worker exited unexpectedly" (re-run; if a file
passes alone, the suite is fine). Multi-line `git commit -m` here-strings fail randomly — write
the message to a temp file and use `git commit -F <file>`.

### 1.3 Multi-agent repo — verify before assuming
Several AI agents work on this repo in parallel. Consequences observed repeatedly:
- **Grep before building anything.** Features often already exist but are unmounted/unlinked
  (e.g. `/master-profiles` existed fully built with zero nav links; `PDFResumeUploader` existed
  as dead code).
- **Never treat a git anomaly as data loss** without checking `origin/main` directly
  (`git fetch && git rev-parse origin/main` or the GitHub API).
- Check `PROJECT.md`'s milestone table for in-flight work before touching shared files.
- Reconcile `PROGRESS.md`, `git log -- <file>`, and live code before trusting a task's status.
  Planning documents have already lagged completed implementation. If code and a plan disagree,
  record the mismatch and update the plan instead of rebuilding the feature.
- Treat every `PROJECT.md` milestone marked `IN_PROGRESS` as a file reservation. Split or defer a
  task that would edit its files; do not make a competing implementation in the same branch.

### 1.4 Known traps in this codebase (each caused a real production bug)
1. **Radix Select**: `<SelectItem value="">` throws at mount and (via the single global
   ErrorBoundary) blanks the entire app. Use a sentinel like `"none"`. Consider this whenever
   adding any Select.
2. **`FunctionsHttpError.message` is useless**: supabase-js hardcodes it to *"Edge Function
   returned a non-2xx status code"*. The real server message is in `error.context` (a `Response`).
   Always use `getEdgeFunctionErrorMessage()` from `src/utils/edgeFunctionError.ts`.
3. **Never trust AI output shape**: `extract-resume-data` once returned `technologies` as a
   string (its own prompt asked for one) and crashed the app. Normalize server-side in the shared
   parser AND guard client-side (`Array.isArray`). Any new AI-JSON feature needs the same 3-layer
   defense.
4. **Minified stack traces lie about files**: Vite chunk names come from any component bundled in
   the chunk (a `ProjectsForm` crash surfaced as `VolunteerForm-*.js`). Trace by symptom, not
   chunk name.
5. **The personal vs. company namespace**: `job_applications` is the **recruiter-side ATS
   product's** table (statuses: `shortlisted`, `interviewing`, `offered`, ...). A candidate-side
   job tracker must use a NEW table (see D-1), never this one.
6. **Plan gating**: `gemini-suggest` enforces `ai_requests_per_month` from
   `subscription_plans.limits` via `get_user_entitlements` (Free = 0 → 403). Any new AI feature
   routed through it inherits metering for free; a new AI edge function must implement the same
   block (copy from `gemini-suggest/index.ts` §"Plan metering").
7. **ATS claims require artifact evidence**: a semantic DOM and a button labelled “ATS” do not
   prove the downloaded file parses correctly. Validate the actual PDF artifact, text order,
   links, page breaks, and multi-column linearization before making or retaining ATS-safe claims.

### 1.5 Definition of Done (every task below)
1. `tsc --noEmit` clean; 2. vitest suite passes (16+ tests — add regression tests for anything
you fix); 3. production build succeeds; 4. affected edge functions deployed; 5. committed with a
message explaining root cause / rationale (see git log for the house style); 6. pushed to `main`;
7. acceptance-specific evidence is recorded (artifact inspection for exports, two-user RLS test
for owner-scoped data, free+premium accounts for gating, and 390px keyboard/touch checks for
mobile work). A build alone is not evidence that a user flow works.

If the quoted PowerShell `node.exe` command is mis-routed by the execution host, retry once and
then use the semantically identical `node node_modules/<tool>/<entry> ...` form. This is an
execution-host workaround, not permission to skip a gate.

---

## 2. Current feature inventory (2026-07-23)

### 2.0 Reconciled implementation status
- The registry and renderer currently contain **37** template keys, not 19. `PROJECT.md` still
  reserves the registry/renderer for its in-flight template track, so do not modify either until
  M4–M6 are reconciled by that track.
- P4–P10 foundations are substantially present: A4 preview/pagination, mobile resume-builder
  tabs, fixed-cadence autosave, DB-driven pricing, per-route SEO metadata, entitlements,
  notifications, tests, CI, sharing, analytics, cover letters, and master profiles. Tasks below
  marked **PARTIAL** describe only the remaining behavior; completed foundations must not be
  rebuilt.
- `PROGRESS.md`'s “Current task” is stale even though its Completed list records later phases.
  Live code and git history are authoritative for task status.

**Resume side (B2C)**
- Resume Builder (`/resume-builder`): template registry (`src/templates/registry.ts` +
  `src/utils/resumeTemplates.tsx`), autosave, customization (colors/fonts/spacing), premium
  gating (`subscriptions.is_premium`), example data, Quick PDF (image-based) + Print→PDF
  (text-based, ATS-safe) via `usePDFGenerator.tsx`.
- AI: inline suggestions (`AiSuggestionButton`, `src/utils/ai/gemini.ts`), **Job Match Analyzer**
  (`src/components/resume/JobMatchAnalyzer.tsx` — score, matched/missing keywords, suggestions,
  paste or upload JD), all via `gemini-suggest` (multi-provider: Gemini/DeepSeek/OpenAI; admin's
  global Primary key wins — `_shared/aiProviders.ts getAnyActiveKey`).
- Cover Letter Builder (`/cover-letter-builder`): 3 templates (`coverLetterTemplates.tsx`),
  AI-improve, **generate-from-JD** (`JobDescriptionGenerator.tsx` → `cover_letter_from_jd`
  context), save/edit (`useCoverLetterData.ts`), PDF download. Preview hidden on mobile.
- Master Profile: TWO systems (known debt, see S-2): legacy `profiles` row edited from
  `Account.tsx` "Master Profile" tab, and the real `master_profiles` table (multi-profile, JSONB
  `profile_data`) at `/master-profiles` with ResumeSpawner + TranslationPanel + PDF import.
- PDF resume import: `extract-resume-data` edge fn (Gemini multimodal for scans; unpdf+any text
  model otherwise) → `PDFResumeUploader` → selective-import preview modal.
- JD file→text: `extract-text-from-file` edge fn (PDF/.txt, no AI) + shared
  `src/components/JobDescriptionInput.tsx` (paste or upload).
- Account (`/account`): My Documents (resumes + cover letters), Master Profile tab, Analytics
  (`ResumeViewAnalytics`), Security tab (**mock — see S-5**). `/account/settings`: real settings
  incl. `SecuritySettingsForm`.
- Sharing: `useResumeSharing`, `SharedResumeView`, view analytics.
- Payments: Razorpay (`create-razorpay-order`, `verify-razorpay-payment`); plans in
  `subscription_plans` (Free: 1 resume/0 AI; Pro Monthly ₹299: ∞/100 AI; Yearly ₹2499 & Lifetime
  ₹4999: ∞/150 AI). Metering in `usage_limits.ai_requests` (30-day rolling).

**ATS side (B2B)** — `/ats/*`: orgs, jobs, applications pipeline, candidate discovery, talent
pools, plans (ATS Free/Starter/Growth/Enterprise). Candidate apply flow: `ATSApply.tsx`.

**Admin** — `/admin`: user management (including explicit monthly/yearly/lifetime manual grants),
AI key management (`AIManagement.tsx` — keys tab real; Settings tab is **dead mock UI**, see S-5),
blog manager + scheduled AI blog automation (`blog-ai` + `blog-scheduler`), payment
notifications, website customization, ATS management.

**Edge functions** (17 source directories; deployment still must be verified with
`supabase functions list`): `admin-add-org-member`, `admin-create-user`, `admin-delete-user`,
`admin-list-users`, `blog-ai`, `blog-scheduler`, `create-razorpay-order`,
`create-stripe-checkout`, `extract-resume-data`, `extract-text-from-file`, `gemini-suggest`,
`razorpay-webhook`, `self-delete-account`, `send-notification`, `stripe-webhook`,
`track-resume-view`, `verify-razorpay-payment`.

---

## 3. Market pain-point analysis → our answers

Competitors: Zety, Resume.io, Rezi, Teal, Jobscan, Enhancv, Kickresume, Novoresume.

| # | Market pain point (widely complained about) | Who suffers from it | Our answer (task ref) |
|---|---|---|---|
| 1 | **Bait paywall**: build free, then pay to download (Zety, Resume.io). Most-hated pattern in the category. | Users feel scammed at the finish line | Keep free PDF download genuinely free forever; monetize AI, premium templates, tracker depth. State it on Pricing. (G-3) |
| 2 | **Exports fail ATS parsing** (image PDFs, columns scrambling text order). Users' #1 anxiety. | Everyone | Make text-PDF the default path, prove it with a "Recruiter View" parsed-text preview. (S-1, D-5) |
| 3 | **No job-search hub**: resume tools stop at the document; Teal owns tracking but has a weak editor. | Active job seekers juggling 20+ applications | Candidate-side Job Tracker linked to tailored resume + cover letter + match score. (D-1) |
| 4 | **Tailoring is manual**: clone resume, guess keywords, rename file `final_v7`. | Anyone applying broadly | One-click "Tailor for this job": clone + JD keywords + auto-named version. (D-3) |
| 5 | **AI invents experience** (Kickresume/Enhancv complaints). | Users caught lying in interviews | Our JD cover-letter prompt already forbids invention; extend rule to all prompts + show "based on your profile" sources. (P-4) |
| 6 | **Quota surprises**: hit AI limit mid-flow with no warning (Jobscan credits). | Paying users | Visible quota chip near every AI button; upsell before the wall, not after. (P-2) |
| 7 | **Templates break with real content** (overflow, page-break cuts). | Anyone with >5 yrs experience | Page-break preview + overflow warnings in builder. (P-1) |
| 8 | **No LinkedIn import**. | Everyone starts from a blank form | Parse LinkedIn's "Save profile as PDF" through our existing extractor. (D-2) |
| 9 | **No DOCX** — many portals/recruiters demand .docx. | Applicants to enterprise portals | DOCX export via `docx` npm lib. (D-6) |
| 10 | **Generic cover letters** users must heavily rewrite. | Everyone | Tone/length controls + "regenerate with instructions". (P-4) |
| 11 | **Interview prep is a separate paid tool**. | Interviewees | Generate likely questions + talking points from resume+JD (reuses existing infra). (D-4) |
| 12 | **Mobile is an afterthought** in every competitor. India traffic (our INR pricing) is mobile-first. | Mobile users | Builder + cover letter mobile pass. (P-6) |

---

## 4. Phase S — Stabilization (do these first; they gate everything else)

### S-1 · Make text-based PDF the primary export ⭐ highest product-credibility item — PARTIAL
**Why**: `generatePDF` (the default "Download PDF" everywhere) rasterizes via html2canvas →
JPEG-in-PDF: text not selectable, invisible to ATS parsers — fatal flaw for an ATS-branded
product. A text-safe path already exists (`printResume` in `usePDFGenerator.tsx`) but is a
secondary print-dialog flow users must discover.
**Current reality**: Resume Builder already exposes `ATS PDF` and `Quick PDF`, but both are
outline buttons and the labels do not clearly state that Quick PDF is an image. Cover Letter
Builder is image-only. The reusable `ResumePreview` still makes the image path primary, and
`DocumentsDashboard` has a separate image-only exporter. Renderer entries already carry
`data-resume-item`, so do not redo that subtask.
**What**:
- **S-1a (conflict-safe now)**: Resume Builder primary CTA = “Download PDF (ATS-friendly)” →
  `printResume`; demote raster export to “Exact-look PDF (image)” in a secondary menu/outline CTA
  with plain-language tradeoff copy.
- **S-1b (conflict-safe now)**: wire `printResume` into `CoverLetterBuilder.tsx` as the primary
  download; keep the image export clearly secondary.
- **S-1c (after `PROJECT.md` M1 finishes)**: apply the same contract to `ResumePreview` and
  `DocumentsDashboard`; do not edit `DocumentsDashboard` while M1 owns it.
- **S-1d (spike, separate commit)**: evaluate direct semantic PDF generation without a print
  dialog. Compare browser print, `jspdf.html()`, and `@react-pdf/renderer` on fidelity, selectable
  text, links, reading order, bundle cost, and maintenance. Do not add a dependency before the
  written decision.
**Done when**: in Chrome and Edge, actual saved PDFs from `clean-slate`, one left-sidebar, one
right-sidebar, a controlled two-page resume, and a cover letter have selectable text and clickable
links; `pdftotext`/copy-paste order matches the Recruiter View; no section is clipped; both builders
label semantic vs image modes clearly; a UI regression test proves the primary CTA calls
`printResume` and the secondary CTA calls `generatePDF`.

### S-2 · Unify the two Master Profile systems
**Why**: `Account.tsx`'s "Master Profile" tab edits the legacy `profiles` row while
`/master-profiles` edits `master_profiles.profile_data` (JSONB, multi-profile). Same words, two
stores — user edits in one place don't appear in the other. Confirmed confusion source.
**What**: canonical store = `master_profiles`. (a) Migration: for every user with `profiles`
content but no default master profile, backfill one from the `profiles` fields (script the JSONB
mapping off `useUserProfile.ts`'s `UserProfile` interface — `ResumeSpawner.tsx` documents the
expected `profile_data` shape); (b) rewrite `Account.tsx`'s tab to read/write the DEFAULT master
profile via `useMasterProfile` (keep `profiles` for auth-y fields only: avatar,
`is_discoverable`); (c) keep "Fill from Profile" in the builder reading the same store.
**Done when**: editing in either surface shows identically in the other; PDF import lands in one
store; no code path writes profile content to `profiles` anymore.
**Caution**: coordinate with `PROJECT.md` M1/M2 (Account overhaul in flight by another agent).

### S-3 · Section-level ErrorBoundaries — SPLIT FOR PARALLEL SAFETY
**Why**: one render crash anywhere blanks the whole app (single boundary in `App.tsx`) — this
turned a `.map` type bug into a full-app outage twice.
**What**:
- **S-3a (conflict-safe now)**: reusable `<SectionBoundary name="...">` (fallback card: “This
  section hit an error” + retry + automatic `captureError`) around the active resume-builder form
  panel/PDF import surface and the cover-letter editor and preview.
- **S-3b (deferred)**: Account tabs after `PROJECT.md` M1/M2 and Admin panels after M3. Re-read
  the merged files before wrapping them; do not patch either file while its milestone is active.
**Done when**: a component that throws degrades only its named section; fallback is keyboard
reachable, retry remounts the child, `captureError` receives boundary name + component stack, and
tests cover failure and retry. Route-level boundary remains the final fallback.

### S-4 · Finish `getEdgeFunctionErrorMessage` rollout
**Why**: only 4 of ~17 `supabase.functions.invoke` call sites unwrap real error messages; the
rest still show the useless generic string.
**Where**: `SecuritySettingsForm.tsx`, `BlogAutomation.tsx`, `UserManagement.tsx`,
`BlogManager.tsx`, `TranslationPanel.tsx`, `src/utils/ai/gemini.ts`, `useRazorpayPayment.tsx`,
`PDFUploader.tsx`, `PDFResumeUploader.tsx`, `AddUserForm.tsx`, `AddUserModal.tsx`,
`ATSManagement.tsx`, `useUserProfiles.ts`.
**Done when**: grep for `functions.invoke` shows every site either uses the helper or has a
comment explaining why not.

### S-5 · Kill the mock UIs (they erode trust)
**Why**: two admin/user surfaces look functional but do nothing.
**What**: (a) `Account.tsx` Security tab: fake `setTimeout` password form → replace with the real
`SecuritySettingsForm` (exists in `src/components/account/`) or a link to `/account/settings`;
(b) `AIManagement.tsx` "Settings" tab (auto-fallback checkbox, rate-limit input, model dropdown
listing GPT-4/3.5!, caching/rotation toggles — none wired): either back it with a real
`ai_settings` site-settings row that `gemini-suggest` reads (model + temperature + per-user rate
limit are the useful ones) or delete the tab until real. Recommend: implement `default_model` +
`requests_per_hour`, delete the rest.
**Done when**: no visible control in the app silently does nothing.

### S-6 · Durable rate limiting & metering
**Why**: `_shared/rateLimiter.ts` is per-isolate in-memory — resets on cold start, not shared
across instances, so limits are advisory at best. `usage_limits` metering does read-then-upsert
(race: concurrent requests double-spend).
**What**: Postgres-based limiter: `create or replace function consume_rate_limit(p_key text,
p_max int, p_window_ms bigint) returns table(allowed bool, remaining int, reset_at timestamptz)`
using an upsert with window reset in one statement; same pattern for
`increment_ai_usage(p_user_id uuid) returns int`. Swap call sites in all edge functions.
**Done when**: two parallel requests can't both pass a limit of 1 (write a curl test); metering
increments exactly once per successful AI call.

### S-7 · CI pipeline — COMPLETE at `bac94ff`; monitor, do not rebuild
**Why**: local Windows flakiness makes verification unreliable; parallel agents push without a
shared gate.
**What**: `.github/workflows/ci.yml`: on push/PR → install, `tsc --noEmit`, `vitest run`,
`vite build`. Also run `npx update-browserslist-db@latest` once (build warns data is 21 months
old).
**Done when**: `.github/workflows/ci.yml` remains green on `main`; a PR with a type error fails.

### S-8 · Regression tests for every bug class already hit — PARTIAL (3 files / 16 tests)
**What**: retain the existing registry/adapter/customization tests, then add: (a)
`parseExtractedJson` unit tests (string vs array `technologies`/`skills`/
`languages` — port the function to a testable location or test via fixture);
(b) a lint/test that fails on `<SelectItem value="">` (simple grep-based vitest);
(c) cover-letter save flow: first save inserts then navigates to `?edit=<id>`, second save
updates (mock supabase); (d) `getEdgeFunctionErrorMessage` unit tests (Response context, non-JSON
body, plain Error).
**Done when**: every incident listed above has a failing-before/fixed-after test, and test names
reference the behavior being protected. Test count is informational, not the acceptance bar.

### S-9 · Docs & hygiene
**What**: (a) `.clinerules/09-edge-functions.md` is dangerously stale (claims Lovable
auto-deploys, wrong `gemini-suggest` request shape, missing 5 functions) — rewrite from live
code; (b) delete stray `nul` file at repo root (Windows artifact; needs
`git rm --cached` + careful shell quoting: `del \\?\C:\...\nul`); (c) add `.agents/` to
`.gitignore`; (d) consolidate `IMPLEMENTATION_PLAN`/`OVERHAUL_PLAN`/`REFINED_PLAN` status into a
short README section pointing here.

---

## 5. Phase P — Polish existing features to "complete"

### P-1 · Builder content-overflow & pagination UX — PARTIAL
**Why**: market pain #7; long content silently overflows or splits mid-item in exports.
**Current reality**: live A4 boundary lines and `ResizeObserver` cleanup already exist in
`ResumePreviewSection.tsx`. Remaining work is export-calibrated boundary placement, per-item
crossing warnings, and soft character guidance.
**What**: calibrate preview boundaries against the semantic print path; per-item “this entry
crosses a page” badge; soft character guidance on description fields (e.g. “3–5 bullets ≈ 400
chars”). Keep warnings outside the captured resume DOM.
**Done when**: controlled one-, two-, and three-page fixtures show the same break positions in
preview and actual printed PDF within 4 CSS px; warnings identify the exact crossing item and do
not appear in either PDF mode; ResizeObserver disconnect behavior has a regression test.

### P-2 · AI quota transparency
**Why**: market pain #6; today users discover limits via a 403 toast.
**What**: `useAIQuota()` hook (reads `get_user_entitlements` cap + `usage_limits.ai_requests`,
30-day window logic copied from `gemini-suggest`); small "`{used}/{cap}` AI uses" chip rendered
beside every AI button (`AiSuggestionButton`, Job Match dialog, cover letter AI buttons); at cap,
buttons become upsell CTAs linking to `/pricing`. Free plan (cap 0) shows "Premium ✨" chip
instead of erroring after click.
**Done when**: no AI button ever produces the 403 path for a user who could have known.

### P-3 · Job Match Analyzer v2 — IMPLEMENTED (2026-07-23)
**Why**: currently one-shot and ephemeral; Jobscan's stickiness comes from tracked improvement.
**What**: (a) new table `job_match_reports` (id, user_id, resume_id, jd_text, jd_hash, score,
matched jsonb, missing jsonb, suggestions jsonb, created_at; RLS `auth.uid() = user_id`);
(b) save each analysis, list history per resume with score trend; (c) "Re-analyze" after edits
shows delta ("62% → 78%"); (d) per-keyword "Add to skills" one-click insert (writes into
`resume_data.skills`, marked as user-confirmed — never silent edits); (e) score breakdown
sections (skills / title / experience) — extend the JSON contract in `JobMatchAnalyzer.tsx`
prompt, with server-side shape normalization per trap §1.4-3.
**Implemented**: reports persist with owner-only RLS; the metered `gemini-suggest` context now
normalizes a score breakdown and bounded recommendation patch list server-side; the analyzer
shows original/proposed text, evidence, Apply/Undo controls, and score history; approved edits
update the active resume and existing saved resumes autosave; Premium users can create a new
tailored copy with `parent_resume_id`, leaving the source untouched. The client has a second
normalization layer and stale-text guard tests.

**Remaining refinement**: keyword-specific “Add to skills” UI and explicit job/company extraction
can follow later. The candidate Job Tracker is intentionally out of scope for now.

### P-4 · Cover letter generation controls & template parity
**What**: (a) tone (`professional | warm | bold`) + length (`short ≈180w | standard ≈300w`)
selects in `JobDescriptionGenerator.tsx`, passed through `cover_letter_from_jd` (extend the
prompt; keep the no-invention rule verbatim); (b) "Regenerate with instructions" free-text box
("emphasize the Berlin project"); (c) explicit `company` + `role` fields on the form (stop
inferring from title), stored in `cover_letters.customization` jsonb — no migration needed;
(d) grow `coverLetterTemplates.tsx` from 3 → 8 templates reusing resume design tokens (respect
OVERHAUL_PLAN §1.3 rules); (e) mobile: preview is `hidden lg:flex` in `CoverLetterBuilder.tsx` —
add an Edit/Preview toggle for small screens; (f) plain-text download (.txt) for paste-into-form
applications.
**Done when**: a free-text JD produces a letter honoring tone+length; all templates render in
preview and both PDF modes; usable on a 390px viewport.

### P-5 · Import robustness & merge strategy
**Why**: importing a PDF twice currently appends/overwrites blindly; DOCX resumes can't import.
**What**: (a) merge UI in `PDFDataPreviewModal.tsx`: per-section choice Replace / Append /(skip)
when the target section already has data; (b) DOCX import: `extract-resume-data` accepts .docx
(mammoth in Deno via esm.sh) → same JSON path; (c) low-confidence highlighting: prompt the model
for a `confidence` per section, tint low ones amber in the preview.
**Done when**: re-importing the same file with "Append" doesn't duplicate identical entries
(dedupe by title+company/school); a .docx resume imports end-to-end.

### P-6 · Mobile & responsive pass — PARTIAL
**Current reality**: the resume builder has an Edit/Preview toggle at the `lg` breakpoint; the
cover-letter preview remains hidden below `lg`.
**What**: audit at 390px: resume builder panels (forms usable, preview reachable via toggle),
cover letter (P-4e), account dashboards (tables → cards), Job Match dialog. Fix top offenders.
**Done when**: core flows (build → AI → download; JD → letter; import) completable on mobile.

### P-7 · Loading/empty/error state audit
**What**: every react-query view gets skeletons (pattern exists in `AIManagement.tsx`); every
empty list gets a CTA empty-state (pattern exists in DocumentsDashboard); standardize toast copy
(errors state cause + next step).

### P-8 · Accessibility pass
**What**: labels on all inputs (several template-customization controls lack them), focus trap
audit in dialogs, `aria-valuenow` on Progress/score, contrast check on badge color pairs
(green-700-on-green-50 etc. are fine; verify template previews), keyboard path through the
builder.

### P-9 · Resume revision history and recovery
**Why**: autosave protects recent edits but also makes accidental destructive edits immediate;
users need a way back, especially when tailoring many versions.
**What**: append-only `resume_revisions` snapshots written server-side on meaningful save
boundaries (not every keystroke), owner-only RLS, a compact “Version history” drawer, preview and
restore-as-new-revision. Cap retention by plan and never overwrite the current row silently.
**Done when**: restoring an older revision creates a new current revision, the previous current
state remains recoverable, cross-user reads fail under RLS, and rapid autosaves do not create a
revision storm.

### P-10 · AI privacy and factual-source controls
**Why**: resumes and JDs contain personal data and all configured providers are third parties;
the no-invention promise also needs visible evidence, not prompt text alone.
**What**: disclose provider processing before first AI use; minimize prompt PII; add a clear
“generated from these resume sections” summary for cover letters/interview prep; store no raw AI
prompt in analytics; retain the no-invention instruction in every context.
**Done when**: first AI use requires informed acknowledgement, telemetry contains no resume/JD
body, and generated factual claims can be traced to supplied resume sections or are rejected.

---

## 6. Phase D — Differentiators (the reasons to choose FlowCreate)

### D-1 · Candidate Job Tracker ⭐ biggest retention lever
**Why**: market pain #3 — turns FlowCreate from a document generator into the job-search hub
users open daily. Teal proved the demand; nobody pairs it with a strong builder + real ATS.
**What**: new route `/job-tracker`. New table `job_search_entries` (NOT `job_applications` —
that's the B2B ATS's table, see trap §1.4-5): id, user_id, company, role, jd_text, url, status
(`saved|applied|interviewing|offer|rejected|ghosted`), resume_id, cover_letter_id,
match_report_id, salary_note, next_action, next_action_date, applied_at, notes, created_at,
updated_at; RLS owner-only. UI: kanban (columns = status) + table toggle; each card links its
tailored resume, letter, and match score; "next action" date surfaces overdue items at top.
Integrations: "Track this job" buttons on Job Match Analyzer and JD cover-letter generator
(they already hold the JD text); creating from either pre-fills company/role via a one-shot AI
extract.
**Done when**: full CRUD kanban; a job created from Job Match carries its report + resume link;
counts per column; free tier capped (e.g. 10 active) with upsell.

### D-2 · LinkedIn import
**Why**: market pain #8; cold-start is the biggest drop-off.
**What**: UI affordance in PDF import ("Have LinkedIn? Profile → More → Save to PDF, upload it
here") — the existing `extract-resume-data` already parses that PDF format; add a LinkedIn-aware
hint to `JSON_SCHEMA_PROMPT` (it front-loads a Summary page). Do NOT scrape linkedin.com (ToS).
**Done when**: a real LinkedIn-exported PDF fills ≥80% of profile fields in manual testing.

### D-3 · "Tailor for this job" resume versions
**Why**: market pain #4; we already have spawn-from-master (`ResumeSpawner`) — extend the idea.
**What**: button on Job Match results + tracker entries: clones the resume
(`resumes.resume_data` copy), names it "{Role} @ {Company}", opens the builder with a
suggestions panel of missing keywords to weave in (from the match report; user applies each —
no silent rewriting). Version list on the source resume ("Tailored versions: 3") in
DocumentsDashboard.
**Done when**: tailor → edit → download → tracker entry links the tailored version, original
untouched.

### D-4 · Interview Prep generator (premium)
**Why**: market pain #11; near-zero marginal cost on existing infra.
**What**: new context `interview_prep` in `gemini-suggest` (resume + JD → 10 likely questions:
5 behavioral tied to their actual experience entries, 5 technical from JD requirements, each
with a 2-3 bullet suggested answer skeleton drawing ONLY on resume facts). Surface as a tab in
the tracker entry and a button on Job Match results. Metered like everything else.
**Done when**: output references real resume entries by name; free users see upsell.

### D-5 · Recruiter View (trust feature nobody else has)
**Why**: market pain #2 — don't claim ATS-safe, demonstrate it.
**What**: “See what an ATS sees” must parse the ACTUAL semantic PDF artifact (or the exact same
semantic document model used to produce it), not merely call `innerText` on the preview. Show the
linearized result with explicit warnings for ignored photos/icons, ambiguous columns, missing
headings, inaccessible links, and unusual glyphs. Maintain a fixture matrix for every active
template and stop marketing a template as ATS-optimized when its fixture fails.
**Done when**: normalized Recruiter View text equals `pdftotext` output for the one-/two-/three-
page matrix; reading-order snapshots exist for every active template; risky templates display a
warning in the picker; CI fails if a previously safe template changes extraction order.

### D-6 · DOCX export (premium)
**What**: `docx` npm package, client-side; map `resume_data` → a clean single-column DOCX
(don't chase template visual parity — recruiters who demand .docx want parseable, not pretty;
say so in the UI). Same for cover letters.
**Done when**: exported .docx opens correctly in Word/Google Docs with all content.

### D-7 · One profile → many artifacts
**What**: from master profile / resume: "LinkedIn About" generator, "short bio" (3 lengths),
"email application snippet" (intro paragraph + attachment line). One dialog, one `gemini-suggest`
context each. Cheap, high-perceived-value, drives AI quota usage → conversions.

---

## 7. Phase G — Growth & retention

### G-1 · Onboarding wizard
**Current reality**: `UserOnboarding` is a localStorage-backed builder tour, not the outcome-based
wizard below. Keep it only if it does not compete with the new first-run path.
First-run flow: Import (PDF/LinkedIn) or start fresh → template pick (3 suggested by role) →
guided sections with completeness meter → first download. Track step conversion (G-4).
**Done when**: a new signup reaches a downloaded resume without seeing an empty dashboard.

### G-2 · Email lifecycle (needs `send-notification` fn verified/deployed + Resend key)
Weekly search summary (tracker stats, stale next-actions), quota-reset notice, "application
sitting in *applied* for 14 days — follow up?" nudges. All opt-in via existing
`notification_preferences`.

### G-3 · Honest-pricing positioning
Pricing page copy: "Free PDF download forever. No surprise paywall." — directly targets market
pain #1. Add plan-limit table (resumes, AI/mo, tracker slots, DOCX, interview prep).

### G-4 · Product analytics
PostHog (EU cloud or self-host) or a minimal `events` table: funnel signup → profile → first
resume → semantic download → image download → AI use → subscribe. The current
`analytics-tracker.tsx` only stores events in localStorage and logs in development; it is not
product analytics. Add consent/retention rules and never send resume/JD text. Without this,
every prioritization above is a guess.

### G-5 · Programmatic SEO
Expand `ResumeTemplateProfession` pages (exists) to role×template landing pages fed by the blog
automation; internal links from blog posts to builder with template preselected.

### G-6 · B2C↔B2B flywheel
"Apply with your FlowCreate profile" on ATS job posts (`ATSApply.tsx` exists — deepen: one-click
attach chosen resume version; recruiters see parsed profile, not just a PDF).

---

## 8. Phase F — Later bets (park these)
- Browser extension: capture JD from any job board → tracker entry + match score.
- Coach/team seats: career coaches managing client profiles (new role + sharing model).
- Full i18n of the UI (TranslationPanel already translates content).
- Public resume hosting with custom slug (flowcv-style) + view analytics (analytics exist).
- White-label ATS.

---

## 9. Conflict map and revised execution order (first 10 working sessions)

### 9.1 Active conflict map

| Roadmap work | Reserved by `PROJECT.md` | Rule |
|---|---|---|
| S-1c document-dashboard export, S-2, S-3b Account, S-5a, responsive Account work | M1/M2 | Defer until both milestones are marked complete, then re-read merged code |
| S-3b Admin | M3 | Defer until M3 is complete |
| Any registry/renderer/template task | M4–M6 | Do not edit `registry.ts` or `resumeTemplates.tsx`; reconcile the already-present 37-template state first |
| E2E tests around those shared surfaces | E2E/M7 | Add only task-specific regression tests outside files owned by that track; merge test plans afterward |

### 9.2 First 10 working sessions

| Session | Tasks | Rationale |
|---|---|---|
| 1 | S-1a/b | Fix the actual default export contract first; no shared-file collision |
| 2 | S-1d decision spike + D-5 foundation | Prove ATS behavior from artifacts before advertising it |
| 3 | P-1 remaining work | Preview/export page-break agreement is part of ATS credibility |
| 4 | S-3a + S-4 | Contain crashes on conflict-safe surfaces and expose real server errors |
| 5 | S-6 + S-8 | Make limits authoritative and lock incident fixes with tests |
| 6 | S-5b + S-9 + P-2 | Remove AI mock controls, repair docs/hygiene, show quota before calls |
| 7 | G-4 | Instrument privacy-safe funnel events before investing in large differentiators |
| 8 | P-3 | Persist match improvements and validate the structured-output contract |
| 9–10 | D-1 | Job tracker MVP only after metering, analytics, and match persistence are sound |

After `PROJECT.md` M1–M3 complete: S-1c → S-2 → S-3b → S-5a. Then D-3 → D-2 →
P-4 → P-5 → D-6 → D-4 → P-9 → P-10 → G-1 → rest. S-7 is already complete and
must not consume a session unless CI is red.

---

## 10. Per-task checklist template (copy into your working notes)

```
Task: <ID> <name>
[ ] Grepped for existing/partial implementations (multi-agent repo!)
[ ] Checked PROJECT.md milestones for conflicts
[ ] Schema change? → new migration file + regenerated types.ts + RLS policy + verified with db query
[ ] New AI feature? → plan metering + rate limit + 3-layer output-shape defense + getEdgeFunctionErrorMessage
[ ] New Select? → no empty-string values
[ ] tsc clean / vitest green (+ new regression test) / build passes
[ ] Edge functions deployed (list: ...)
[ ] Committed (root-cause style message) & pushed; retried transient env errors
```

---

## Changelog

### 2026-07-23 — critical review against `bac94ff`
- Corrected the document baseline and reconciled live implementation: 37 registered templates,
  17 edge-function source directories, working CI, 16 tests, A4 preview/pagination, autosave,
  entitlements, notifications, SEO metadata, cover letters, sharing, and blog scheduling.
- Added status-reconciliation, active-file reservation, ATS artifact-evidence, and
  acceptance-evidence rules without removing or weakening any incident rule.
- Rewrote S-1 around the real export surfaces, removed already-complete `data-resume-item` work,
  split conflict-safe builder work from `PROJECT.md`-owned dashboard work, and made real PDF
  parsing/link/page-break evidence mandatory.
- Split S-3 so Resume/Cover Letter boundaries can ship without colliding with Account/Admin
  milestones; tightened failure, retry, monitoring, and accessibility acceptance criteria.
- Marked S-7 complete, marked S-8/P-1/P-6 partial, and replaced test-count/page-count proxies with
  behavior-based acceptance criteria.
- Strengthened D-5 so Recruiter View derives from the actual export model/artifact and added an
  all-template extraction-order regression matrix.
- Added P-9 revision history/recovery and P-10 AI privacy/factual-source controls, two product gaps
  not covered by the original competitor analysis.
- Moved ATS export proof, Recruiter View, and pagination ahead of large differentiators; moved
  privacy-safe analytics before Job Tracker investment; deferred all active PROJECT.md conflicts.
