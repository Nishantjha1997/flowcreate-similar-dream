# FlowCreate — Product Enhancement & Polish Roadmap

> **Written**: 2026-07-23, against commit `e3923fc`.
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

### 1.5 Definition of Done (every task below)
1. `tsc --noEmit` clean; 2. vitest suite passes (16+ tests — add regression tests for anything
you fix); 3. production build succeeds; 4. affected edge functions deployed; 5. committed with a
message explaining root cause / rationale (see git log for the house style); 6. pushed to `main`.

---

## 2. Current feature inventory (2026-07-23)

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

**Admin** — `/admin`: user management, AI key management (`AIManagement.tsx` — keys tab real;
Settings tab is **dead mock UI**, see S-5), blog manager + AI blog automation (`blog-ai` edge fn),
payment notifications, website customization, ATS management.

**Edge functions** (verify live set with `supabase functions list`): `gemini-suggest`,
`extract-resume-data`, `extract-text-from-file`, `blog-ai`, `admin-create-user`,
`create-razorpay-order`, `verify-razorpay-payment`, plus (per REFINED_PLAN, verify deployed):
`stripe-webhook`, `create-stripe-checkout`, `razorpay-webhook`, `send-notification`.

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

### S-1 · Make text-based PDF the primary export ⭐ highest product-credibility item
**Why**: `generatePDF` (the default "Download PDF" everywhere) rasterizes via html2canvas →
JPEG-in-PDF: text not selectable, invisible to ATS parsers — fatal flaw for an ATS-branded
product. A text-safe path already exists (`printResume` in `usePDFGenerator.tsx`) but is a
secondary print-dialog flow users must discover.
**What**: (a) swap button prominence: primary CTA = "Download PDF (ATS-friendly)" → `printResume`;
demote image export to "Exact-look PDF (image)" with a tooltip explaining the tradeoff;
(b) wire `printResume` into `CoverLetterBuilder.tsx` (currently image-only, `handleDownload`);
(c) mid-term: direct text-PDF generation without the print dialog (evaluate `jspdf.html()` vs
`@react-pdf/renderer` renderers for the top-5 templates — spike task, decide with data);
(d) add `[data-resume-item]` attributes to any template sections missing them so
`break-inside: avoid` works (see printStyles in `usePDFGenerator.tsx:44`).
**Done when**: exported default PDF has selectable text; copy-paste from it preserves reading
order; cover letter has the same option; both builders label the two modes clearly.

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

### S-3 · Section-level ErrorBoundaries
**Why**: one render crash anywhere blanks the whole app (single boundary in `App.tsx`) — this
turned a `.map` type bug into a full-app outage twice.
**What**: reusable `<SectionBoundary name="...">` (fallback card: "This section hit an error" +
retry + auto `captureError`) wrapped around: each resume-builder form panel, each Account tab's
content, cover letter editor + preview, each admin panel, the PDF import modal.
**Done when**: throwing inside `ProjectsForm` degrades only that card (add a test).

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

### S-7 · CI pipeline
**Why**: local Windows flakiness makes verification unreliable; parallel agents push without a
shared gate.
**What**: `.github/workflows/ci.yml`: on push/PR → install, `tsc --noEmit`, `vitest run`,
`vite build`. Also run `npx update-browserslist-db@latest` once (build warns data is 21 months
old).
**Done when**: badge green on `main`; a PR with a type error fails.

### S-8 · Regression tests for every bug class already hit
**What**: (a) `parseExtractedJson` unit tests (string vs array `technologies`/`skills`/
`languages` — port the function to a testable location or test via fixture);
(b) a lint/test that fails on `<SelectItem value="">` (simple grep-based vitest);
(c) cover-letter save flow: first save inserts then navigates to `?edit=<id>`, second save
updates (mock supabase); (d) `getEdgeFunctionErrorMessage` unit tests (Response context, non-JSON
body, plain Error).
**Done when**: suite ≥ 30 tests, each mapping to a documented incident.

### S-9 · Docs & hygiene
**What**: (a) `.clinerules/09-edge-functions.md` is dangerously stale (claims Lovable
auto-deploys, wrong `gemini-suggest` request shape, missing 5 functions) — rewrite from live
code; (b) delete stray `nul` file at repo root (Windows artifact; needs
`git rm --cached` + careful shell quoting: `del \\?\C:\...\nul`); (c) add `.agents/` to
`.gitignore`; (d) consolidate `IMPLEMENTATION_PLAN`/`OVERHAUL_PLAN`/`REFINED_PLAN` status into a
short README section pointing here.

---

## 5. Phase P — Polish existing features to "complete"

### P-1 · Builder content-overflow & pagination UX
**Why**: market pain #7; long content silently overflows or splits mid-item in exports.
**What**: live page-boundary indicator lines in the preview (A4 height math exists in
`src/constants/pdfDimensions.ts`); per-item "this entry crosses a page" badge; soft character
guidance on description fields (e.g. "3–5 bullets ≈ 400 chars").
**Done when**: a 3-page resume shows two boundary lines that match the printed output.

### P-2 · AI quota transparency
**Why**: market pain #6; today users discover limits via a 403 toast.
**What**: `useAIQuota()` hook (reads `get_user_entitlements` cap + `usage_limits.ai_requests`,
30-day window logic copied from `gemini-suggest`); small "`{used}/{cap}` AI uses" chip rendered
beside every AI button (`AiSuggestionButton`, Job Match dialog, cover letter AI buttons); at cap,
buttons become upsell CTAs linking to `/pricing`. Free plan (cap 0) shows "Premium ✨" chip
instead of erroring after click.
**Done when**: no AI button ever produces the 403 path for a user who could have known.

### P-3 · Job Match Analyzer v2
**Why**: currently one-shot and ephemeral; Jobscan's stickiness comes from tracked improvement.
**What**: (a) new table `job_match_reports` (id, user_id, resume_id, jd_text, jd_hash, score,
matched jsonb, missing jsonb, suggestions jsonb, created_at; RLS `auth.uid() = user_id`);
(b) save each analysis, list history per resume with score trend; (c) "Re-analyze" after edits
shows delta ("62% → 78%"); (d) per-keyword "Add to skills" one-click insert (writes into
`resume_data.skills`, marked as user-confirmed — never silent edits); (e) score breakdown
sections (skills / title / experience) — extend the JSON contract in `JobMatchAnalyzer.tsx`
prompt, with server-side shape normalization per trap §1.4-3.
**Done when**: analyses persist across sessions; the add-keyword flow round-trips into the saved
resume.

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

### P-6 · Mobile & responsive pass
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
**What**: "See what an ATS sees" button in builder/preview: renders the resume through a plain
text extraction of the ACTUAL export path (for print-PDF: serialize the DOM text in reading
order; flag: images ignored, columns linearized in DOM order — which is exactly what parsers
do). Show side-by-side with warnings ("your two-column template linearizes as: ...").
**Done when**: view matches copy-paste from the exported text PDF; templates with risky
structures show a warning badge in the template picker.

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
resume → download → AI use → subscribe. Without this, every prioritization above is a guess.

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

## 9. Suggested execution order (first 10 working sessions)

| Session | Tasks | Rationale |
|---|---|---|
| 1 | S-1a/b (swap export prominence, cover letter print) + S-3 | Biggest credibility fix + stop full-app crashes; both small |
| 2 | S-4 + S-5a + S-9b/c | Error-message rollout is mechanical; kill mock security tab |
| 3 | S-6 + S-8 | DB-backed limits/metering + regression tests |
| 4 | S-7 + S-9a | CI + docs so parallel agents stop tripping |
| 5 | P-2 | Quota chips (small, immediately felt) |
| 6 | S-2 | Master profile unification (coordinate with PROJECT.md M1/M2 first) |
| 7 | P-3 | Job Match v2 (persistence + add-keyword) |
| 8 | P-4 | Cover letter controls + mobile toggle |
| 9–10 | D-1 | Job tracker MVP (table, kanban, links from Job Match/letter) |

Then: D-3 → D-2 → P-1 → D-5 → P-5 → D-6 → D-4 → G-1 → G-4 → rest.

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
