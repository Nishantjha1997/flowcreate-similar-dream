# FlowCreate — Production-Grade Polish & Feature-Completion Plan

> **Written**: 2026-07-23 against HEAD `59a6288` ("brand: install the selected FlowCreate FC
> identity"). Every status below was verified against **live code and the live Supabase project
> today** — not against planning docs, several of which are stale.
> **Companion doc**: `ROADMAP.md`. Its §1 (environment commands, flakiness retry rules,
> multi-agent rules, incident traps, Definition of Done) applies to every task here **verbatim**
> and is not repeated. Where this document's §A contradicts a status line in ROADMAP §2/§4/§5,
> this document is newer and wins.
> **Scope**: (1) finish every feature that is currently half-done; (2) raise the UI/UX to
> production-grade, premium-SaaS quality with evidence-based acceptance criteria.

---

## A. Verified status audit (evidence-based, 2026-07-23)

### A.1 DONE — verified working; do NOT rebuild (grep first, always)
| Item | Evidence |
|---|---|
| Semantic (ATS) PDF is primary export in Resume Builder AND Cover Letter Builder; image export demoted; shared `DocumentExportActions` component | `CoverLetterBuilder.tsx:121-128`; commits `923ac53`, `e841423` |
| ATS extraction preflight foundation | `src/utils/atsSemanticDocument.ts` + its test; commit `a18c227` |
| Section-level error boundaries on builder + cover letter surfaces | `src/components/ui/section-boundary.tsx`; used in `CoverLetterBuilder.tsx:139,152`; commits `554eaa1`(sic), `dc40fc8` |
| Real edge-function error messages rolled out | commit `5509fe0`; helper `src/utils/edgeFunctionError.ts` |
| Account password change is real (re-auth via `signInWithPassword` then `updateUser`) | `Account.tsx:112,137,143` — S-5a is DONE despite ROADMAP still calling it a mock |
| Dead AI-admin mock controls removed | commit `04cb8ee` |
| Durable DB-backed rate limiting + atomic AI metering (`consume_ai_usage`, row-locked) | migrations `20260730000001_durable_rate_limits.sql`, `20260731000000_ai_plan_quotas.sql`; `gemini-suggest/index.ts:132,364` |
| AI quota transparency: `useAIQuota` chip + "Upgrade for AI" CTA on the three AI surfaces | `CoverLetterEditor.tsx:41,159-168`, `JobMatchAnalyzer.tsx`, `AiSuggestionButton.tsx` |
| Job Match v2: persisted reports (`job_match_reports` migration `20260731010000`), score breakdown, bounded recommendation patches with server-side normalization, Apply/Undo, "Save tailored copy" (`parent_resume_id`) | `gemini-suggest/index.ts:18-93,151-170`; `JobMatchAnalyzer.tsx:108,228,290` |
| Cover letter: tone/length/instructions wired client AND server; options persisted into `customization`; mobile Edit/Preview toggle; TXT download; premium DOCX download | `JobDescriptionGenerator.tsx`; `gemini-suggest/index.ts:144-146,219-220`; `CoverLetterBuilder.tsx:20,53-66,133-136`; `src/utils/docxExport.ts` |
| Import dedupe (re-import duplicate-safe, explicit) | commit `c111434` |
| Builder pagination warnings kept out of exports + length guidance | commits `991c792`, `344b2e7` |
| SEO pages, sitemap, deep-link preservation; FC brand identity | commits `989abbe`, `07537b5`, `1c94158`, `59a6288` |
| All 17 edge functions deployed and current (mass redeploy 2026-07-22, AI functions again 2026-07-23) | `supabase functions list` timestamps checked today |

### A.2 HALF-DONE — the completion backlog (§C below)
| Gap | Evidence |
|---|---|
| **Zero navigation** to Cover Letter Builder or Master Profiles from Header/Footer | Select-String over `Header.tsx`+`Footer.tsx` for `cover-letter\|master-profiles`: 0 hits |
| Cover letter templates: still only 3 | `coverLetterTemplates.tsx:68-74` |
| Cover letter: no explicit Company/Role fields (server infers from JD); prompt still ends "Keep the tone professional yet warm" even when tone=bold; `length` never mapped to word targets server-side | `gemini-suggest/index.ts:219-227` |
| TXT button dangles outside the unified `DocumentExportActions` cluster | `CoverLetterBuilder.tsx:121-128` |
| Job Match: no per-keyword "Add to skills" chips; no company/role auto-extraction | ROADMAP P-3 "Remaining refinement"; grep shows no `add_skill` UI |
| Import: no DOCX resume import, no per-section confidence highlighting, no LinkedIn-PDF affordance | grep `docx\|mammoth\|confidence` in `extract-resume-data/index.ts`: 0 hits |
| Master Profile duality (S-2): Account tab still edits legacy `profiles` via `useUserProfile`; `/master-profiles` edits `master_profiles` | `Account.tsx:13,77,444-467` |
| Export parity (S-1c): `DocumentsDashboard` still image-only | `DocumentsDashboard.tsx:34` (`generatePDF` only) |
| Section boundaries missing on Account tabs / Admin panels (S-3b) | blocked by same stale reservations |
| Recruiter View has no user-facing UI; no all-template fixture matrix; no picker warnings | no `RecruiterView*` component exists; only the utility + one test |
| `nul` junk file still at repo root | `git status` today |
| `PROJECT.md` milestone table stale (M1–M4 "IN_PROGRESS", M5/M6 "PLANNED") while the work visibly landed (37-template registry, DocumentsDashboard, MasterProfileForm all exist) — its reservations still block S-1c/S-2/S-3b | `PROJECT.md:26-34` vs live code |

### A.3 NOT STARTED (tracked in ROADMAP; only the polish-relevant ones scheduled here)
P-7 states audit · P-8 accessibility · P-9 revision history · P-10 AI privacy ·
G-1 onboarding wizard · G-3 pricing honesty copy · G-4 product analytics ·
D-1 job tracker · D-2 LinkedIn import (UI part is cheap → folded into F-4) · D-4 interview prep ·
D-7 profile→artifacts.

---

## B. Gate Zero — reconcile `PROJECT.md` reservations (do this first)

**Why**: three of the highest-impact completion tasks (S-1c, S-2, S-3b) are deferred only because
`PROJECT.md` marks M1–M6 as active. Live code shows that work has landed. Stale reservations are
now the bottleneck, and leaving them unreconciled invites duplicate implementations.

**Procedure** (evidence, not assumption):
1. For each of M1–M6, diff the milestone's *Interface Contracts* (bottom of `PROJECT.md`) against
   live code (`Account.tsx` 4-tab layout, `DocumentsDashboard.tsx`, `MasterProfileForm.tsx`,
   `Admin.tsx` sidebar layout, registry count, premium template components).
2. `git log --oneline -- <file>` for each reserved file; confirm no commits in the last 48h from
   the reserving conversations (i.e., the tracks are dormant, not mid-flight).
3. Update `PROJECT.md` statuses to `DONE (verified <date>, commit <sha>)` for milestones whose
   contract is satisfied; leave anything unsatisfied reserved and list the delta.
4. Record the reconciliation in `PROGRESS.md` and in this file's changelog.

**Done when**: every milestone row carries a verified status with evidence, and the set of files
still legitimately reserved is explicit. Only then do F-5, F-6, F-8 below become eligible.

---

## C. Feature-completion tasks (finish the half-done work)

### F-1 · Product navigation & discoverability ⭐ cheapest high-impact fix in the repo
**Why**: FlowCreate keeps building features users cannot find — the Cover Letter Builder and
Master Profiles have **zero** entry points in Header/Footer (verified §A.2). This repo's history
shows "built but unlinked" is its most chronic failure mode.
**What**: (a) Header: a "Tools" or restructured primary nav exposing Resume Builder, Cover
Letters, Master Profiles, Templates, Pricing — desktop dropdown + mobile sheet; active-route
highlighting; (b) Footer "Product" column with the same set; (c) Account "My Documents" empty
state links to BOTH builders; (d) a `New Cover Letter` action beside `New Resume` wherever the
latter exists.
**Done when**: from any page, a user reaches each core surface in ≤ 2 clicks; nav shows active
state; mobile sheet covers the same set; a vitest render test asserts the Header contains links
to `/resume-builder`, `/cover-letter-builder`, `/master-profiles`, `/templates`, `/pricing`.

### F-2 · Cover letter — close the last gaps
**What**:
- **F-2a Company/Role fields**: explicit inputs above the JD box (`JobDescriptionGenerator.tsx`),
  stored in `customization` (no migration), sent to `cover_letter_from_jd`, injected into the
  prompt as authoritative ("Company: X. Role: Y — these override anything inferred from the JD").
- **F-2b Prompt correctness**: replace the hardcoded closing "Keep the tone professional yet
  warm" with tone-conditional guidance; map `length` to explicit word targets server-side
  (short ≈180, standard ≈300, long ≈450 words) — the client already promises these numbers in its
  labels (`JobDescriptionGenerator.tsx:68`).
- **F-2c Templates 3 → 8**: `coverLetterTemplates.tsx` is NOT reserved by PROJECT.md (separate
  from `resumeTemplates.tsx`). Add 5 designs reusing resume design tokens; obey OVERHAUL_PLAN
  §1.3 (inline hex/rgb, px strings). Every template must pass both export paths.
- **F-2d Unify the export toolbar**: fold the dangling TXT button into `DocumentExportActions`
  (one export menu: ATS PDF · Image PDF · DOCX (premium) · TXT), same order/labels in both
  builders.
- **F-2e Regenerate safety**: generating over a non-empty letter stashes the previous content and
  offers one-click "Restore previous" (toast action) — AI must never destroy user text
  irreversibly.
**Done when**: letter honors company/role verbatim; bold/short output measurably differs from
professional/long (word count within ±20% of target on 3 trial JDs); all 8 templates render in
preview + both PDF modes; export menu identical across builders; restore path has a test.

### F-3 · Job Match — finish v2 residuals
**What**: (a) each `missingKeywords` entry renders as a chip with **+ Add to skills** (writes
into `resume_data.skills` via the existing confirmed-patch path — never silent); (b) extract
company + role from the JD in the same `job_match` call (extend the JSON contract + server
normalization per trap §1.4-3) and show them in the report header + prefill the "Save tailored
copy" name ("{Role} @ {Company}"); (c) surface report history (already persisted) as a compact
score-trend list in the dialog with re-analyze delta ("62% → 78%").
**Done when**: adding a keyword round-trips into the saved resume and re-analysis reflects it;
tailored-copy names auto-fill; history shows ≥2 entries with deltas after two runs.

### F-4 · Import pipeline completion
**What**: (a) **DOCX resume import** in `extract-resume-data` (mammoth via esm.sh in the
text branch; accept `.docx` MIME in `PDFResumeUploader` + copy updates); (b) **per-section
confidence** from the model, normalized server-side, low-confidence sections tinted amber in
`PDFDataPreviewModal` with "review this" copy; (c) **LinkedIn affordance** (D-2's UI half): an
inline hint card "Have LinkedIn? Profile → More → Save to PDF → upload here" + a LinkedIn-format
hint appended to `JSON_SCHEMA_PROMPT`.
**Done when**: a real .docx resume imports end-to-end; a LinkedIn-exported PDF fills ≥80% of
fields in manual test; low-confidence sections are visually distinct; all three layers of shape
defense present (trap §1.4-3).

### F-5 · Master Profile unification (S-2 — largest remaining UX debt) — after Gate Zero
Execute exactly per ROADMAP S-2 (canonical store `master_profiles`; backfill migration; Account
tab reads/writes the DEFAULT master profile via `useMasterProfile`; `profiles` keeps only auth-y
fields). Add one requirement: a dismissible in-app notice on the Account profile tab for two
weeks post-ship ("Your profile now lives in Master Profiles — everything was migrated").
**Done when**: ROADMAP S-2 criteria + two-user RLS test + the PDF import on BOTH surfaces lands
in the same store (verified by editing in one and reading in the other).

### F-6 · Export parity everywhere (S-1c) — after Gate Zero
`DocumentsDashboard` and `ResumePreview` adopt `DocumentExportActions` with semantic primary,
image secondary, DOCX premium, TXT where applicable. One export contract, four surfaces.
**Done when**: no surface in the app offers image-PDF as the primary or only download; a grep for
`generatePDF(` outside `DocumentExportActions`/`usePDFGenerator` returns only intentional sites.

### F-7 · Recruiter View — make the trust feature visible (D-5 completion)
The engine exists (`atsSemanticDocument.ts`); build the product: "See what an ATS sees" button in
both builders → panel showing linearized text (from the SAME semantic document the ATS export
uses), with warnings (columns linearized, photos/icons ignored, links, unusual glyphs); fixture
matrix over every active template with reading-order snapshots in CI; warning badge on risky
templates in the picker.
**Done when**: ROADMAP D-5 criteria (normalized view == `pdftotext` of the artifact for the
1/2/3-page matrix; CI fails on extraction-order regressions; risky templates badged).

### F-8 · Section boundaries on Account/Admin (S-3b) — after Gate Zero
Wrap each Account tab's content and each Admin panel in `SectionBoundary`. Same acceptance as
S-3a (named fallback, retry remounts, `captureError` context, keyboard reachable).

### F-9 · Revision history (P-9) — premium-product table stakes
Per ROADMAP P-9 (append-only `resume_revisions`, snapshot on meaningful boundaries, history
drawer, restore-as-new-revision, plan-capped retention). Schedule after F-5 so it snapshots the
unified store.

### F-10 · Product analytics foundation (G-4)
Minimal `events` table (or PostHog EU) with consent + no resume/JD bodies; instrument: signup,
profile-complete, first-resume, semantic-download, image-download, AI-use, quota-wall,
upgrade-view, subscribe, cover-letter-created, match-run. Without this, the polish work below
can't be measured.

### F-11 · Hygiene
Delete the `nul` file (`cmd /c "del \\?\C:\Users\ADMIN\Desktop\Projects\flowcreate-similar-dream\nul"`);
decide `PROJECT.md` tracking (recommend: keep untracked, it's agent coordination state); sync
ROADMAP.md task statuses with §A of this file (changelog entry, not silent edits).

---

## D. UI polish workstreams — the premium pass

Each workstream = one audit sweep + fixes + evidence. Evidence bundle for every workstream:
before/after screenshots at 390/768/1440 in light AND dark mode, attached to the commit/PR
description. No "looks better to me" merges.

### U-1 · Design tokens & visual consistency
**Known offenders**: raw Tailwind color literals in app chrome that ignore theming — e.g.
`JobMatchAnalyzer.tsx` green/amber badge classes (`text-green-700 border-green-300 bg-green-50`),
alert tints in `PDFResumeUploader.tsx` (`border-green-200 bg-green-50`) — these go muddy in dark
mode; `text-[11px]` one-off font sizes in `JobDescriptionGenerator.tsx`; mixed button heights
(`h-7`/`h-8`/default) across toolbars.
**What**: (a) define semantic status tokens (`success`, `warning`, `info` foreground/background
pairs) in the Tailwind theme + CSS variables for both modes; migrate app-chrome usages (resume
TEMPLATES are exempt — they intentionally use inline hex per OVERHAUL_PLAN §1.3); (b) type scale:
limit UI to the Tailwind scale + one documented exception list; (c) spacing/radius: audit cards,
dialogs, inputs for consistent `rounded-*` and padding rhythm; (d) document the tokens in
`src/index.css` comments.
**Done when**: grep for `bg-green-|bg-amber-|bg-red-|text-green-|text-amber-` under
`src/components` (excluding templates + email HTML) returns only token-backed components; dark
mode screenshots show correct status colors; no `text-[NNpx]` arbitrary values outside templates.

### U-2 · Component standardization
**Known offenders**: two spinner idioms (`RefreshCw animate-spin` in `CoverLetterEditor`,
`Loader2` elsewhere); toast copy varies between "Failed to X: msg" and raw `msg`; dialogs vary in
max-width/scroll behavior (`sm:max-w-2xl max-h-[85vh] overflow-y-auto` ad hoc).
**What**: (a) one `<Spinner size>` primitive; migrate all spinners; (b) toast conventions —
error: "what failed — why — next step", success: past-tense confirmation; centralize copy
helpers; (c) a `<AppDialog>` wrapper fixing width tiers, scroll, focus, close affordances;
(d) icon size discipline (16px inline, 20px section headers).
**Done when**: grep shows a single spinner primitive; dialog wrapper adopted by the 6
highest-traffic dialogs (Job Match, PDF preview/import, template preview, share, delete-confirm,
upgrade); toasts across builders follow the convention.

### U-3 · States: loading, empty, error (P-7)
**What**: every react-query surface gets a skeleton matching final layout (no spinner-only page
loads); every list an empty state with icon + one-line value prop + primary CTA (documents,
analytics, notifications, master profiles, job match history, admin tables); every mutation
button a pending state; SectionBoundary fallbacks styled consistently with retry.
**Done when**: throttled-network walkthrough (DevTools "Slow 3G") of the 8 core routes shows no
layout shift > 0.1 CLS on data arrival, no blank white panels, and every empty list sells the
next action.

### U-4 · Motion & micro-interactions
**What**: standardize transitions (colors/opacity/transform, 150–200ms, ease-out); hover +
focus-visible states on every interactive card/row (documents grid, template cards, plan cards);
dialog/sheet enter-exit (Radix data-state animations already available via tailwindcss-animate);
button press feedback; `prefers-reduced-motion` disables all non-essential motion; keep the
existing `animate-fade-in` tab transitions but unify duration.
**Done when**: interaction inventory (documented in the PR) shows hover/focus/active/disabled for
the 12 most-used interactive components; reduced-motion Chrome emulation shows no movement beyond
opacity.

### U-5 · Mobile & responsive completion (P-6 remainder)
**Known offenders**: cover letter mobile toggle floats at `absolute top-[6.1rem] right-3`
(`CoverLetterBuilder.tsx:133`) — magic number, overlaps content on short viewports; Account
tables/tabs at 390px; Job Match dialog at 390px (breakdown grid + chips); admin tables (already
scrollable, verify).
**What**: move the toggle into the toolbar row (no absolute positioning); audit + fix the four
flows at 390px: build→AI→download, JD→letter→save, import→profile, match→apply-fix; tap targets
≥44px; sticky bottom action bar pattern for builder save/download on mobile.
**Done when**: all four flows completable one-handed at 390×844 with no horizontal scroll and no
overlapped controls; documented with screen recordings.

### U-6 · Accessibility to WCAG 2.1 AA (P-8)
**What**: axe-core pass on the 8 core routes; label every input (template customization controls
are known gaps); focus traps + Escape/return-focus in all dialogs; `aria-valuenow/min/max` on
Progress and score displays; contrast fixes surfaced by U-1 tokens; visible focus ring everywhere
(`focus-visible:ring`); skip-to-content link; `aria-live="polite"` on autosave/quota status
lines.
**Done when**: axe reports 0 critical/serious on the 8 routes; full keyboard walkthrough of
builder → export and JD → letter recorded; screen-reader smoke test (NVDA) of the builder form
sections notes no unlabeled controls.

### U-7 · Performance & perceived speed
**Current facts**: `Account` chunk 456.93 kB (121.75 kB gz), `Admin` 258 kB, `jspdf` 415 kB,
`index` 442 kB — build output 2026-07-23.
**What**: (a) bundle budgets in CI (fail > +10% regression); (b) split `Account.tsx` (it inlines
all profile sub-forms via `MasterProfileForm` + analytics + uploader — lazy-load tab content);
(c) verify `jspdf`/`html2canvas` only load on demand (they are dynamic imports in
`usePDFGenerator` — confirm nothing re-imports them statically; `docxExport` must be dynamic
too); (d) font loading: `font-display: swap` + preload the primary face; (e) route prefetch on
nav hover; (f) `npx update-browserslist-db` (build still warns).
**Done when**: Account route gz ≤ 60 kB initial (tab content lazy); Lighthouse mobile Performance
≥ 85 on landing + templates; no chunk regression in CI; browserslist warning gone.

### U-8 · Copy, trust & first-run surfaces
**What**: (a) pricing page: "Free PDF download forever — no surprise paywall" banner + full
plan-limit table incl. DOCX/AI/tracker rows (G-3); (b) empty dashboard first-run: replace with a
2-choice hero — "Import your resume (PDF/LinkedIn)" / "Start from a template" (G-1-lite; the full
wizard stays in ROADMAP); (c) 404 page branded with useful links; (d) error copy sweep — every
user-facing error states cause + next step (feeds U-2 toast conventions); (e) OG/social cards for
core routes (brand kit landed in `59a6288` — verify `og:image` per route via `usePageMeta`);
(f) Supabase auth email templates (confirm/reset) restyled to match the FC brand.
**Done when**: pricing states the free-download promise; a brand-new account's first screen
offers import-or-template (not an empty grid); auth emails render branded in Gmail light/dark;
social-card preview correct for `/`, `/templates`, `/pricing`, `/blog/*`.

---

## E. Execution order

| Session | Work | Why this order |
|---|---|---|
| 1 | Gate Zero + F-11 hygiene + F-1 navigation | Unblocks the reserved backlog; nav is the cheapest large win |
| 2 | F-2 cover letter completion (a–e) | Highest-touch user feature; small, contained diffs |
| 3 | U-1 tokens + U-2 components | Foundation the rest of the polish builds on |
| 4 | U-3 states + F-3 job match residuals | States sweep; match chips reuse the confirmed-patch path |
| 5 | F-5 master profile unification | Biggest UX debt; now unblocked; do alone — it touches data |
| 6 | F-6 export parity + F-7 recruiter view UI | One export contract everywhere, then prove it visibly |
| 7 | U-5 mobile + U-4 motion | Interaction quality pass on the now-final layouts |
| 8 | U-6 accessibility + F-8 boundaries | AA sweep after layouts stabilize |
| 9 | F-4 import completion + U-7 performance | DOCX/confidence/LinkedIn; then budgets on the final bundle |
| 10 | U-8 trust surfaces + F-10 analytics + F-9 revision history | Measure everything shipped; land data safety |

One task-block = one commit minimum granularity; sessions 3–10 each end with the full ROADMAP
§1.5 gate plus this plan's evidence bundle (screenshots/recordings/axe/Lighthouse as applicable).

---

## F. Standing rules for this plan
1. ROADMAP.md §1 applies to everything here (traps, retries, migrations, DoD).
2. UI changes ship with light+dark, 390/768/1440 screenshot evidence.
3. Resume/cover-letter TEMPLATE files keep inline hex/rgb px-string styles (OVERHAUL_PLAN §1.3);
   design tokens apply to app chrome ONLY.
4. Never regress the semantic-export contract: any new download surface uses
   `DocumentExportActions`.
5. Any AI-output-consuming UI added here follows the 3-layer shape defense and quota/CTA pattern
   already in `CoverLetterEditor.tsx`.

## Changelog
- 2026-07-23 — initial version, statuses verified against HEAD `59a6288` and live Supabase
  (functions list + migrations). Supersedes stale status wording in ROADMAP §2/§4/§5 for: S-1a/b
  (done), S-3a (done), S-4 (done), S-5a (done — real re-auth password change), S-5b (done),
  S-6 (done), P-2 (done), P-3 (done, residuals in F-3), P-4a/b/e/f (done), P-6 builder+cover
  letter (done), D-6 (done), D-3 partial (tailored copy), D-5 foundation (engine only).
- 2026-07-23 (Session 1) — **Gate Zero executed.** Diffed each of `PROJECT.md`'s M1-M6 Interface
  Contracts against live code: all six satisfied (M1 4-tab Account + DocumentsDashboard querying
  resumes+cover_letters; M2 MasterProfileForm with contracted props; M3 Admin sidebar+NAV_GROUPS
  layout; M4 40-entry registry, 19 `featured:false`; M5/M6 58 template style entries with safe
  fallback) and marked DONE in `PROJECT.md` with commit evidence. E2E/M7 confirmed NOT delivered
  (no `TEST_READY.md`) and left open, superseded by this plan's own S-8/U-6/U-7 tasks. File
  reservations on `Account.tsx`, `Admin.tsx`, `registry.ts`, `resumeTemplates.tsx`,
  `DocumentsDashboard.tsx`, `MasterProfileForm.tsx` released — F-5/F-6/F-8 now eligible.
  Reconciliation also logged in `PROGRESS.md`.
- 2026-07-25 (Session 2) — **F-2 done.** Company/Role fields added and injected as authoritative
  overrides server-side (F-2a); the cover_letter_from_jd prompt's tone/length handling fixed —
  tone-conditional guidance replaces a fixed "professional yet warm" line, and length now maps to
  an explicit word-count target instead of being ignored (F-2b); grew coverLetterTemplateStyles
  from 3 to 8 templates, same inline-hex/px-string export-safety discipline as resume templates
  (F-2c); folded the standalone TXT button into `DocumentExportActions` via a new optional
  `onTxtExport` prop, reordered to ATS PDF → Image PDF → DOCX → TXT (F-2d); added stash+Undo when
  AI generation overwrites existing content, which also surfaced and fixed a stale-closure risk in
  `CoverLetterEditor`'s setFormData usage (F-2e). New tests: `coverLetterTemplates.test.ts`,
  extended `DocumentExportActions.test.tsx`, new `JobDescriptionGenerator.test.tsx`.
- 2026-07-25 (Session 3) — **U-1 and U-2 infrastructure built; real but partial usage migration
  (honest scope below, per this plan's own PARTIAL convention).**
  - **U-1a/d (done):** added `success`/`warning`/`info` CSS token pairs to `:root`/`.dark`/
    `.neo-brutalism` in `index.css` (matching the existing `destructive` pattern) plus the
    corresponding `tailwind.config.ts` color entries, documented inline. Caught a real bug the
    build (not tsc, not vitest) surfaced: a `*/` inside the token doc-comment prematurely closed
    it, breaking the CSS build - fixed and re-verified.
  - **U-1b (partial, by design):** migrated 10 files where raw green/amber/red genuinely
    communicate status (Job Match score/keyword badges, PDF-upload success/warning alerts, the
    enhanced-toast variant system, autosave/progress/error/section-boundary indicators, Profile
    Insights). Left ~50 files untouched where the color is decorative/categorical (dashboard
    metric-card color-coding, admin stat tiles, marketing accent colors) - not status
    communication, so out of scope per U-1's own stated intent. Full remaining inventory: grep
    `bg-green-|text-green-|border-green-|bg-amber-|text-amber-|border-amber-|bg-red-|text-red-|
    border-red-` under `src` excluding templates.
  - **U-1c (partial):** fixed the plan's literal named offender
    (`JobDescriptionGenerator.tsx`'s `text-[11px]`) plus `NotificationBell.tsx`,
    `JobMatchAnalyzer.tsx`, `progress-indicator.tsx`. Two `NotificationBell.tsx` instances
    (`text-[10px]`/`text-[9px]`) are a documented, deliberate exception - they size digits inside
    fixed 16-20px circular unread-count badges where `text-xs` (12px) would overflow. ~55 more
    arbitrary sizes remain (`ResumeBuilderSidebar.tsx` alone has 15), mostly in admin/customization
    panels not yet audited.
  - **U-2a (done + partial usage):** built `src/components/ui/spinner.tsx`, a single
    `<Spinner size="xs"|"sm"|"md"|"lg" />` primitive replacing the app's two prior idioms (bare
    `Loader2`, and `RefreshCw` specifically in `CoverLetterEditor`, both with inconsistent sizes).
    Migrated the 7 AI/import/export-flow files already touched this session
    (`CoverLetterEditor`, `JobDescriptionGenerator`, `JobMatchAnalyzer`, `PDFResumeUploader`,
    `PDFUploader`, `DocumentExportActions`, `JobDescriptionInput`). ~58 more `animate-spin` sites
    remain on the old idiom.
  - **U-2b (done, at its actual stated scope - "toasts across builders"):** added
    `src/utils/toastMessages.ts` (`toastActionFailed`/`toastActionDone`) encoding the
    what-failed/why/next-step and past-tense-confirmation convention; applied in
    `CoverLetterEditor.tsx` and `JobDescriptionGenerator.tsx`. Not applied app-wide (the plan's own
    "Done when" scopes this to the builders, not every toast call in the app).
  - **U-2c (5 of the 6 named dialogs):** built `src/components/ui/app-dialog.tsx`
    (`AppDialogContent` with `size="sm"|"md"|"lg"|"xl"`, standardized scroll/max-height). Adopted
    in Job Match (`JobMatchAnalyzer.tsx`), PDF preview/import (`PDFDataPreviewModal.tsx`), template
    preview (`TemplatePreviewModal.tsx`), share (`DocumentsDashboard.tsx`), and upgrade
    (`AiSuggestionButton.tsx`). Delete-confirm dialogs use `AlertDialog`, a structurally different
    Radix primitive (no close button, different semantics for destructive confirmation) with its
    own reasonable shadcn defaults - deliberately left as-is rather than forced into a
    `Dialog`-shaped wrapper.
  - **U-2d (deferred):** icon size discipline audit not started - needs its own pass.
  - New tests: `spinner.test.tsx`, `toastMessages.test.ts`, `app-dialog.test.tsx`. Full suite
    (23 files / 66 tests) stayed green throughout this session's changes.
  - **Recommended next pass for U-1/U-2 completion**, if picked up later: knock out the remaining
    color/spinner/size instances file-by-file using the same semantic-vs-decorative judgment call
    documented above, then do U-2d.
- 2026-07-25 (Session 4) — **F-3 done; U-3 spot-checked (real gaps found and fixed, not
  exhaustive).**
  - **F-3a (Add to skills):** `buildAddSkillRecommendation()` synthesizes a normal `add_skill`
    `JobRecommendation` for a missing keyword, reusing `applyJobRecommendation`/
    `applyRecommendation`/`revertRecommendation` verbatim - no separate silent write path. Each
    missing-keyword badge now has an inline "+ Add to skills" toggle that flips to "Added ✓" (and
    can be undone) via the existing `appliedIds` state.
  - **F-3b (company/role extraction):** `gemini-suggest`'s `job_match` prompt now asks for
    `company`/`role` (extract verbatim or return empty string, never invent); `normalizeJobMatch`
    (server) and `normalizeJobMatchResult`/`formatRoleAtCompany` (client, `jobMatch.ts`) carry them
    through. Populated the previously-unused `job_match_reports.job_title`/`.company` columns
    (schema already had them from the original v2 migration; nothing wired them until now).
    Displayed as a report subtitle, and threaded through `onCreateTailoredVersion` (extended to
    `(resume, suggestedName?)` across `JobMatchAnalyzer` → `ResumeHeaderSection` →
    `ResumeBuilder.handleCreateTailoredVersion`) so the tailored copy's `version_label` uses the
    JD's real role/company instead of guessing from the candidate's own most recent job title.
  - **F-3c (score history/delta):** was already substantially built (history badges + a delta
    line) from the original Job Match v2 work; reworded the delta to the plan's literal
    "62% → 78%" arrow format alongside the existing +/- points figure.
  - Extended the existing `jobMatch.test.ts` (didn't know it existed until Glob under-reported it -
    confirmed present via a direct filesystem check, then matched its established fixture/import
    style rather than overwriting).
  - **U-3:** did not attempt the full "throttled-network walkthrough of 8 core routes" - that
    requires an interactive browser session this environment doesn't have. Instead spot-checked
    the plan's named surfaces against real code: `DocumentsDashboard` (done in Session 1),
    `MasterProfile.tsx` and `ResumeViewAnalytics.tsx` had a skeleton and an icon+copy empty state
    but no actual CTA button - added one to each. `NotificationBell.tsx` empty states had no icon -
    added one. Admin tables (`UserManagement.tsx` spot-checked) already have skeletons and empty
    copy - didn't find a real gap there. Job Match's own history section intentionally shows
    nothing until a 2nd report exists, which is correct (not a list needing its own empty state).
    Full CLS/Slow-3G verification remains open for whoever has a browser session to run it.
  - Verified: tsc clean, 23 test files / 69 tests passing, production build succeeds. Deployed:
    `gemini-suggest`.
- 2026-07-25 (Session 5) — **F-5 done: Master Profile unification (ROADMAP S-2).**
  - **F-5a (backfill migration):** `20260731020000_master_profile_backfill.sql` — for every user
    with real content in `profiles` (name/summary/position/skills/experience/education/projects/
    certifications) but zero rows in `master_profiles`, inserts one default master profile mapping
    `profiles` columns into `profile_data`. Deliberately excludes `avatar_url`/`is_discoverable`
    (those stay on `profiles`) and skips users whose `profiles` row is genuinely empty, so no
    empty master profiles get created for accounts that never touched their profile.
  - **F-5b (Account.tsx rewrite):** the "Master Profile" tab now reads content from
    `useMasterProfile().defaultProfile.profile_data` and writes content there too; `avatar_url`/
    `is_discoverable` still read/write `profiles` via `useUserProfile`. `PersonalInfoForm` edits
    both kinds of field through the same `onUpdate` callback (confirmed via
    `avatar_url: imageData.src` / `is_discoverable: checked` call sites), so `saveProfileChanges`
    splits `pendingChanges` by field name at save time and routes each half to its own mutation,
    while `mergedProfile` still presents one unified object to every display consumer (header card,
    completeness card, insights, tab-completion check).
  - **F-5c (migration notice):** dismissible banner on the profile tab
    ("Your profile now lives in Master Profiles — everything was migrated"), gated on both a
    `localStorage` dismiss flag and a hardcoded 2026-08-08 cutoff (2 weeks post-ship), matching
    this repo's existing `localStorage`-flag dismissal pattern (`onboarding_completed`).
  - **Bonus fixes surfaced by tracing every consumer of the old `profiles`-only content, not just
    the one page named in the plan:**
    - `useResumeProfileSync.ts` ("Fill from Profile" in the resume builder) read only
      `useUserProfile()`, so it would've silently gone stale/empty for anyone who'd only ever
      edited via the now-unified store. Now merges `defaultProfile.profile_data` over the auth
      profile the same way Account.tsx does.
    - `AccountSettings.tsx` at `/account/settings` (linked from Header's user-menu "Settings" item
      — confirmed live and reachable, not dead code) is a second full profile-editing surface that
      still wrote content straight to `profiles`. Its Security tab has real functionality Account.tsx
      doesn't (`SecuritySettingsForm`: email change, account deletion) so the fix was NOT to
      redirect/delete it — applied the identical split-write fix instead, so both editing surfaces
      now agree with `/master-profiles`.
    - `ResumeSpawner.tsx` already read `masterProfile.profile_data` generically — no change needed,
      confirms the two page-level surfaces (`Account.tsx`'s tab, `/master-profiles`) now converge
      on the same table/row for a user's default profile.
  - **Done-when checklist vs. what was actually verified:**
    - PDF import lands in the same store on both surfaces — verified structurally (both write via
      merge-into-`profile_data` update on the same `master_profiles` row, both invalidate the
      `['masterProfiles']` query key), not via a live browser click-through (no interactive browser
      session in this environment, same limitation noted for U-3 in Session 4).
    - Two-user RLS test — verified structurally instead of via a live two-account run: RLS is
      enabled on `master_profiles` (`20260719000000_master_profiles.sql:33`, re-asserted
      idempotently by `20260726_audit_fixes.sql:6`) with a standard owner-only policy
      (`USING/WITH CHECK auth.uid() = user_id`, `FOR ALL`) — same shape used elsewhere in this
      schema. An actual two-session RLS test needs two authenticated users, which this environment
      can't drive.
  - Verified: tsc clean, 23 test files / 69 tests passing, production build succeeds. No edge
    functions touched by F-5.
- 2026-07-25 (Session 6) — **F-6 done: export parity everywhere (S-1c).**
  - **`ResumePreview.tsx`** (the "Preview & Download" dialog rendered live in the resume builder's
    header via `EnhancedResumePreview`) had its own ad-hoc button pair with image-PDF listed
    *first* ("Download PDF") and semantic/ATS PDF second ("ATS PDF / Print") — the exact inversion
    the plan's done-when criterion calls out. Replaced both buttons with `DocumentExportActions`,
    wiring the same `printResume`/`generatePDF` from `usePDFGenerator` it already had, just in the
    correct semantic-primary/image-secondary order and with the shared component's styling.
  - **`DocumentsDashboard.tsx`** had the worse case: each resume card's only download action was a
    single icon button calling a third, independent image-PDF implementation (hand-rolled
    html2canvas/jsPDF pagination, duplicated from `usePDFGenerator`, with the classic
    `heightLeft -= pageHeightCanvas` loop that's fragile across page boundaries) — image-PDF as the
    *only* download, not just the primary one. Fixed by:
    - Adding an optional per-call filename override to `usePDFGenerator`'s `printResume`/
      `generatePDF` (`(element, fileNameOverride?)`, falling back to the hook's constructor
      argument) — needed because `DocumentsDashboard` renders many resumes from one shared hook
      instance, unlike every other caller which instantiates the hook per-document. Backward
      compatible; no other call site passes the new argument.
    - Extracting the existing off-screen-mount logic into `mountResumeOffscreen()` and handing the
      result to `printResume`/`generatePDF` directly, deleting the duplicated pagination code
      entirely rather than writing a fourth implementation.
    - Adding DOCX export too (`exportResumeDocx` from `docxExport.ts` already takes a plain
      `ResumeData` + filename — no DOM rendering needed), gated on the `isPremium` prop the
      component already receives, matching the premium-gate pattern in `ResumeBuilder.tsx`.
    - Restructuring each resume card's action footer into two rows (icon row: Edit/Clone/Share/
      Delete; `DocumentExportActions` row below) since the previous single 5-column icon grid had
      no room for text-labeled pill buttons.
  - **Done-when grep verified**: `generatePDF(` now appears at exactly 4 sites app-wide —
    `DocumentsDashboard.tsx`, `ResumePreview.tsx`, `ResumeBuilder.tsx`, `CoverLetterBuilder.tsx` —
    and all four are the intentional secondary/image-export callback wired into a
    `DocumentExportActions` instance, not a primary or standalone download path.
  - Verified: tsc clean, 23 test files / 69 tests passing, production build succeeds. No edge
    functions touched by F-6.
