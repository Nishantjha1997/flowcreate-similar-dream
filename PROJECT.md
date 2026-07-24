# Project: FlowCreate Dashboard Simplification & 14 Premium Templates

## Architecture
This project modifies the user and admin dashboards to improve user experience and adds 14 new premium, pixel-perfect resume templates modeled after FlowCV layouts in React/Vite/Supabase.
- **Frontend Framework**: React 18 with Vite and TypeScript.
- **UI Components**: Radix UI (shadcn/ui), Tailwind CSS (using direct Tailwind classes or inline styles for templates to prevent PDF breakages).
- **Backend / Database**: Supabase JS client querying `resumes`, `cover_letters`, and `master_profiles` tables.
- **Templates Engine**: `src/templates/registry.ts` for template registration metadata, and `src/utils/resumeTemplates.tsx` for template components rendering.

## Code Layout
- `src/pages/Account.tsx` — Main user dashboard component (to be overhauled into 4 tabs).
- `src/pages/Admin.tsx` — Main admin dashboard component (to be overhauled into sticky vertical navigation).
- `src/pages/MasterProfile.tsx` — Master profile page (to use `MasterProfileForm.tsx`).
- `src/components/profile/DocumentsDashboard.tsx` — (New) Document management grid for resumes & cover letters.
- `src/components/profile/MasterProfileForm.tsx` — (New) Scrollable profile grouping the 8 sub-forms with sticky sidebar navigation.
- `src/templates/registry.ts` — Template definitions and metadata.
- `src/utils/resumeTemplates.tsx` — Template rendering components, layout selectors, and dot-matrix helper component.

## Milestones

> **Reconciled 2026-07-23** (FlowCreate Gate Zero, see `POLISH_PLAN.md` §B). The statuses below
> were verified against live code, not against the reserving conversations, which appear dormant
> (no commits from their tags in recent history). Do not revert this reconciliation without
> re-diffing the Interface Contracts below against current code.

### E2E Testing Track (Parallel)
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| E2E | Test Suite | Create comprehensive test suite (Tiers 1-4) for user/admin dashboard layout and 14 premium templates, and publish `TEST_READY.md`. | None | **STALE — no artifact found.** `TEST_READY.md` does not exist anywhere in the repo (verified via repo-wide glob 2026-07-23). Treat as not delivered; do not assume E2E coverage exists. Superseded going forward by `POLISH_PLAN.md` tasks S-8 (incident regression tests) and U-6 (accessibility/axe pass), which do not depend on this track. |

### Implementation Track
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Dashboard Simplification | Overhaul `Account.tsx` to 4 tabs, create `DocumentsDashboard.tsx` grid querying resumes and cover letters. | None | **DONE (verified 2026-07-23, commit `546d08f`, refined since).** `Account.tsx` has exactly 4 tabs (`documents`, `profile`, `analytics`, `security` — grep of `TabsContent value=`). `DocumentsDashboard.tsx` exists and queries both `resumes` (`userResumes`) and `cover_letters` (`userCoverLetters`) via react-query, rendered in a responsive grid with edit/delete/share/clone actions. Contract satisfied. |
| M2 | Master Profile Form | Create `MasterProfileForm.tsx` scrollable view with sticky side-navigation grouping the 8 profile sub-forms. | None | **DONE (verified 2026-07-23, commit `546d08f`).** `src/components/profile/MasterProfileForm.tsx` exists; consumed in `Account.tsx` with the exact contracted props (`profile`, `onUpdate`, `isNeoBrutalism`, `isPremium`) and in `src/pages/MasterProfile.tsx`. Contract satisfied. |
| M3 | Admin Layout Redesign | Overhaul `Admin.tsx` to use vertical sticky grid layout with grouped sidebar sections instead of horizontal tabs. | None | **DONE (verified 2026-07-23).** `Admin.tsx` has `NAV_GROUPS`, a collapsible sidebar (`sidebarOpen` state), and a sidebar+content grid layout (no horizontal `TabsList` driving primary nav). Last touched by `b404b98` and earlier `[ADMIN]`/`[FIX]` commits predating this milestone's tag — the redesign already existed before this milestone was declared; the tracker was simply never flipped. Contract satisfied. |
| M4 | Template Registry Updates | Decommission 3 legacy templates (`featured: false`) and register the 14 new templates in `registry.ts`. | None | **DONE — and exceeded (verified 2026-07-23, commit `546d08f`, refined by `2ac6189`/`eca9d9b`).** `registry.ts` is the single source of truth (`TEMPLATE_REGISTRY`) with **40** entries (not 14), **19** marked `featured: false` (broader curation than the original "3 legacy" plan, same mechanism). Do not re-run this milestone; if more templates are wanted, that is new scope, not M4 completion. |
| M5 | Premium Templates Part 1 | Implement styling and JSX components for templates 1-7 in `resumeTemplates.tsx`. | M4 | **DONE — and exceeded.** `resumeTemplates.tsx`'s `templateStyles` map has **58** style entries (covers every registry key plus legacy aliases), with a safe fallback (`templateStyles[resolvedKey] || templateStyles['clean-slate']`) for any unresolved key. |
| M6 | Premium Templates Part 2 | Implement styling and JSX components for templates 8-14 in `resumeTemplates.tsx`. | M4, M5 | **DONE — and exceeded.** Same evidence as M5; all 14 originally-planned templates plus the pre-existing 13 (P2/P3 phase) are present and rendering. |
| M7 | Final E2E Pass & Hardening | Verify project against E2E test suite (Tiers 1-4), then generate adversarial tests (Tier 5) for white-box edge case coverage. | M1, M2, M3, M6, E2E | **NOT DONE — correctly still open.** Its `E2E` dependency never delivered an artifact. This milestone's intent (systematic hardening/adversarial coverage) is carried forward by `POLISH_PLAN.md` §D (U-3 states, U-6 accessibility, U-7 performance budgets) rather than by this now-dormant track. |

**Effect of this reconciliation**: the file reservations this table previously implied
(`Account.tsx`, `Admin.tsx`, `registry.ts`, `resumeTemplates.tsx`, `DocumentsDashboard.tsx`,
`MasterProfileForm.tsx`) are **released**. `POLISH_PLAN.md` tasks F-5, F-6, and F-8, which were
blocked pending this reconciliation, are now eligible to proceed (still subject to their own
stated caution/ordering).

## Interface Contracts
### DocumentsDashboard Component
- **Props**: None (or standard user info props).
- **Behavior**: Uses React Query or custom hooks to query `resumes` and `cover_letters` in parallel, rendering them in a responsive card grid with edit/delete/share actions.

### MasterProfileForm Component
- **Props**:
  ```typescript
  interface MasterProfileFormProps {
    profile: any;
    onUpdate: (data: any) => Promise<void>;
    isNeoBrutalism?: boolean;
    isPremium?: boolean;
  }
  ```
- **Behavior**: Displays a side nav mapping to `#personal-info`, `#professional-info`, `#education`, `#work-experience`, `#skills`, `#projects`, `#certifications`, and `#volunteer`. Smooth scrolls on click, tracks current viewport header using `IntersectionObserver` to highlight active section in sidebar.

### DotMatrix & Proficiency Parsing Helpers
- **`parseProficiency(val: string | undefined): number`**: Parse rating 1-5 from text label or parenthesized value.
- **`cleanLabel(val: string): string`**: Clean up rating details from text label.
- **`DotMatrix({ value, color })`**: Renders 5 inline circular dots (filled up to value, bordered color, transparent empty).
