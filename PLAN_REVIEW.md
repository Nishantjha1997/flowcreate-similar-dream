# FlowCreate ROADMAP Review

**Review date:** 2026-07-23

**Repository baseline:** `bac94ff` (`ROADMAP.md` was created from the `e3923fc` code state)

**Verification baseline:** TypeScript clean; 3 Vitest files / 16 tests green; production build green.

## Executive assessment

The roadmap has strong product reasoning and unusually useful incident history, but its execution
table was not calibrated to the code that already exists. It mixed completed overhaul work with
new work, understated the number of templates and edge functions, and scheduled the strongest ATS
trust feature too late. It also directed Session 1 to touch Account/Admin surfaces currently owned
by parallel agents.

The revised roadmap preserves every incident rule, reconciles completed work, makes actual PDF
artifacts—not DOM intent—the source of ATS truth, and splits conflict-safe work from reserved files.
The new order is ATS export → ATS proof → pagination agreement → resilience → durable limits →
instrumentation → differentiators.

## A. Correctness review and mismatches

### Document and status mismatches

1. **Baseline wording was ambiguous.** The roadmap said it was written against `e3923fc`, while
   the requested review baseline and current head are `bac94ff`. `bac94ff` is the roadmap commit;
   the underlying source assessment was `e3923fc`. The header now states both.
2. **`PROGRESS.md` is stale.** It says the current task is P6-T3 while its own Completed section
   records P6–P10 gates. A future agent could redo completed work. The roadmap now requires
   reconciliation against code and git history.
3. **`PROJECT.md` is also behind the repository.** It marks template registry work in progress,
   but git history already contains the premium-template commit and the current registry has 37
   entries. Its milestone statuses still reserve the shared files, so the safe response is to
   avoid those files until that track reconciles its table—not to assume permission from stale
   text.

### Feature-inventory mismatches

4. **Template count was understated.** The roadmap described the post-overhaul 19-template state;
   current `TEMPLATE_REGISTRY` has 37 entries. The current inventory is corrected, while template
   files remain reserved by PROJECT M4–M6.
5. **Edge-function inventory was incomplete.** The repo has 17 function directories, including
   `blog-scheduler`, `self-delete-account`, `track-resume-view`, and admin functions omitted from
   the 12-function wording. The inventory now lists all 17 source directories and still requires
   live deployment verification.
6. **CI is already implemented.** `.github/workflows/ci.yml` installs, typechecks, tests, and
   builds on push/PR. S-7 was duplicate work and is now marked complete/monitor-only.
7. **SEO metadata is beyond the stated baseline.** `usePageMeta` already manages canonical,
   Open Graph/Twitter metadata, robots, and route-specific metadata; P6-T4 is complete rather than
   future work.
8. **Entitlements and plan selection are further along.** `useEntitlements`, resume-limit gating,
   premium-template gating, AI metering, and explicit admin monthly/yearly/lifetime grants already
   exist. The roadmap should build on them, not recreate them.
9. **Autosave's known timer defects are already fixed.** `useAutoSave` keeps current state and the
   save handler in refs, runs a stable interval, and clears status timers. It should be regression
   tested, not rewritten.
10. **A4 preview and mobile resume-builder work are already present.** The preview has zoom,
    `ResizeObserver` cleanup, page-break lines, and the builder has Edit/Preview tabs. P-1 and P-6
    are partial tasks, not greenfield tasks.

### Root-cause and file-pointer findings

11. **S-1's central root cause is correct.** `generatePDF` rasterizes HTML into JPEG pages; the
    file is not semantic. `printResume` uses real HTML and is the credible ATS path.
12. **S-1's “default everywhere” wording was inaccurate.** Resume Builder currently shows both
    `ATS PDF` and `Quick PDF` as equally secondary outline buttons. `ResumePreview` makes the image
    button primary, Cover Letter Builder is image-only, and `DocumentsDashboard` contains a
    separate image exporter. The revised task names each surface and defers the M1-owned dashboard.
13. **S-1's `data-resume-item` subtask was already complete.** Repeated experience, education,
    project, language, certification, and volunteer entries in `resumeTemplates.tsx` already use
    the attribute. It was removed from active work.
14. **S-3's root cause is correct, but its scope was unsafe.** Only the global `ErrorBoundary`
    exists. A section boundary is needed, but Account and Admin are reserved by PROJECT M1–M3.
    S-3 is now split into conflict-safe builder/cover-letter work and deferred Account/Admin work.
15. **S-4's count is essentially correct.** There are 17 real client invoke callers (18 grep hits
    including a comment in `client.ts`); only four caller files currently use
    `getEdgeFunctionErrorMessage`. The listed rollout files match the missing callers.
16. **S-5 is accurate.** Account still simulates password changes with `setTimeout`, and
    AIManagement still exposes unpersisted fallback, model, rotation, alert, and rate controls.
    Account work must wait for M1/M2; AI settings can be handled separately.
17. **S-6 is accurate.** `gemini-suggest` still uses per-isolate rate limiting and a non-atomic
    read/then-upsert AI counter. The proposed database transaction is the right direction, but its
    acceptance must test concurrent requests and successful-call charging semantics.
18. **S-8 was partly stale.** The suite already has registry, adapter, and customization tests,
    but none of the four incident regression groups listed in S-8 are fully covered. A raw target
    of 30 tests is a poor completion proxy; behavior-specific tests are now the bar.
19. **P-1 was partly implemented.** Boundary lines exist; exact print alignment, item-crossing
    warnings, and field guidance do not. Acceptance now compares controlled preview and PDF
    fixtures rather than merely counting lines.
20. **P-4 and P-6 are correctly identified as incomplete, but not greenfield.** JD-based cover
    letter generation already exists; controls, more templates, text download, and mobile preview
    remain. Resume mobile tabs exist; Cover Letter mobile preview does not.
21. **G-1 could be misread as already done.** `UserOnboarding` is a local tour, not the proposed
    import/template/completeness/first-download wizard. The roadmap now distinguishes them.
22. **G-4 is not implemented.** `analytics-tracker.tsx` only writes to localStorage and logs in
    development. It does not provide product analytics or durable funnel data.

## B. Prioritization review

The original S → P → D → G phase ordering is directionally good: trust and reliability should
precede retention bets. The original 10-session table, however, contradicted FlowCreate's ATS
brand promise by putting content overflow at the end and Recruiter View after major feature work.
A button labelled ATS-friendly is not evidence, and a semantic DOM is not the artifact users send.

The revised order starts with S-1a/b, then an export decision spike and D-5 foundation, followed by
preview/export page-break agreement. Section boundaries remain important but move behind the
first credibility proof and are limited to conflict-safe surfaces. Durable metering and incident
tests precede new AI-heavy features. Privacy-safe product analytics moves before Job Tracker so
the team can measure activation and retention rather than guessing.

This is a better order for an ATS-credibility product:

1. Make semantic export the obvious default.
2. Parse and show the real artifact/model as Recruiter View.
3. Make page boundaries agree with that export.
4. Contain UI crashes and expose actionable edge errors.
5. Make limits atomic and lock incident fixes with tests.
6. Instrument conversion without collecting resume/JD bodies.
7. Then invest in persistent Job Match and Job Tracker.

## C. Missing product and technical work

### Added to the roadmap

1. **Resume revision history and recovery (P-9).** Autosave without undo makes destructive edits
   immediate. Tailoring and AI assistance increase that risk. Append-only snapshots and restore
   are a core document-product safety feature.
2. **AI privacy and factual-source controls (P-10).** Resumes/JDs contain PII and are sent to
   third-party model providers. Users need disclosure, data minimization, and visible sourcing for
   the no-invention promise.
3. **All-template ATS extraction matrix.** ATS optimization needs regression fixtures for every
   active template, including left/right sidebars and multi-page content. Marketing status should
   follow fixture results.
4. **Semantic vs image export consistency across all entry points.** Builder-only fixes leave
   Account downloads and reusable preview dialogs misleading. The work is split to respect M1.

### Recommended follow-ups not expanded into full tasks yet

- Server-authoritative resume-count enforcement so crafted REST calls cannot bypass plan limits.
- Billing self-service: cancellation, invoice access, payment-failure recovery, and clear lifetime
  semantics before scaling paid acquisition.
- A staging environment and migration/deploy promotion runbook; current work targets one linked
  production project.
- Accessibility and output tests for non-Latin names, long URLs, emoji, and RTL text before i18n.
- Data export/portability and account-deletion verification across auth, storage, analytics, and
  financial retention records.

## D. Conflict risk

| Work | Collision | Mitigation |
|---|---|---|
| S-1 Account/download consistency | PROJECT M1 owns `DocumentsDashboard`/Account | Ship builders now; defer dashboard export |
| S-2 master-profile unification | M1/M2 own Account and profile form | Defer until both milestones complete |
| S-3 Account/Admin boundaries | M1–M3 own both shells | Split S-3a/S-3b |
| S-5 Account security replacement | M1/M2 own Account | Handle AI mock settings separately; defer Account |
| Any template/renderer changes | M4–M6 own registry and renderer | No edits until milestone reconciliation |
| Broad E2E edits | E2E/M7 active | Add only local regression tests, merge suites later |

`OVERHAUL_PLAN.md` contract risks are also explicit: no generated-type hand edits, no migration
rewrites, no existing edge request/response changes, no unapproved dependencies, and all template
styles must remain inline hex/rgb with px-string font sizes. The revised first block avoids schema,
edge-shape, and template contracts entirely.

## E. Acceptance-criteria review

The weakest original criteria used proxies: “build passes,” “three-page resume shows two lines,”
“suite ≥30,” or “output references real entries.” These are easy to satisfy while the product is
still wrong.

The roadmap now requires:

- Actual saved PDFs from a defined one-/two-/three-page and multi-column matrix.
- Selectable text, clickable links, extraction/copy order, and clipping checks in Chrome + Edge.
- UI tests proving the primary/secondary handlers are wired correctly.
- Preview break positions matching the print artifact within a stated tolerance.
- Error-boundary failure, monitoring context, keyboard reachability, and retry/remount tests.
- Two-user RLS tests for new owner-scoped tables.
- Parallel-request tests for rate and quota functions.
- Free and premium account tests for gating.
- Exact 390px completion checks for mobile workflows.
- AI output normalization and factual-source checks, not prompt compliance assumptions.

## Ratings

### Completeness — 8/10

The plan covers stabilization, polish, differentiated job-search workflows, growth, and later bets,
with concrete file pointers and market rationale. It missed revision recovery, AI privacy/source
traceability, an all-template ATS artifact matrix, and consistent export behavior outside the main
builder. Those gaps are material but straightforward to add.

### Technical accuracy — 7/10

The central diagnoses—raster PDF risk, dual master-profile stores, generic Edge Function errors,
in-memory limits, mock settings, and personal-vs-ATS namespaces—are accurate. Accuracy was reduced
by stale counts/statuses and by treating existing page-break, SEO, CI, autosave, and entitlement
work as future tasks. The revised roadmap reconciles these points.

### Prioritization — 7/10

Stabilization first was correct, but the original session table delayed Recruiter View and export
alignment despite ATS credibility being the core promise. It also scheduled conflict-prone S-3
work immediately. The revised order earns a stronger effective priority: prove export, align
pagination, then resilience/metering, then measured differentiators.

### Executability by an agent — 8/10

The incident rules, file pointers, commands, and one-task/one-commit discipline are excellent for
agents. Executability suffered from stale progress and acceptance criteria that lacked fixtures,
accounts, browsers, tolerances, or concurrency checks. The new reconciliation rule, conflict map,
and evidence requirements remove most ambiguity.

### Market insight — 9/10

The competitor pain analysis focuses on real category complaints: bait paywalls, ATS anxiety,
manual tailoring, quota surprises, poor mobile support, and missing job tracking/DOCX. The major
improvement is turning ATS safety from marketing copy into observable artifact evidence. Privacy,
recovery, and billing self-service deserve more market treatment in a future revision.

## Overall score — 8/10

This is a strong roadmap with better-than-average operational memory and product insight. Its main
weakness was not strategy but synchronization: completed work and parallel ownership were not
reflected in the active sequence. After revision it is safe to execute, prioritizes the brand's
credibility claim, and has acceptance criteria that can falsify a broken implementation.
