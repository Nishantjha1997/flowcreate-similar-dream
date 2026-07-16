# FlowCreate — SaaS Overhaul Plan: Phase 11 User & Admin UX Refinement (Executor Edition)

> **Audience**: An AI coding assistant (e.g. DeepSeek v4) executing tasks one at a time.
> **Companion file**: `GEMINI_MASTER_PROMPT.md` — your operating manual. Read it FIRST.

---

## 1. Non-negotiable Guidelines
1. Execute tasks strictly in order (`P11-T1`, `P11-T2`, ...).
2. One task = one commit. Never batch tasks.
3. Run `node node_modules/typescript/bin/tsc --noEmit -p tsconfig.app.json` and `npm run build` after every task. Both must succeed before committing.

---

## 2. Phase 11 Execution Roadmap

### P11-T1 — Simplify User Dashboard Tabs Layout
- **Modify**: `src/pages/Account.tsx`
- **Action**: 
  - Restructure `getTabConfig` to expose only 4 clean tabs:
    1. `documents` (Label: "My Documents", Icon: `FileText`, default tab)
    2. `profile` (Label: "Master Profile", Icon: `User`)
    3. `analytics` (Label: "Analytics", Icon: `Eye`)
    4. `security` (Label: "Security & Settings", Icon: `Lock`)
  - Keep the tab contents matching this simplified structure. Place existing profile data forms inside the `profile` tab.
- **Acceptance**: Account page displays exactly 4 tabs. Typecheck and build succeed.
- **Commit Message**: `[P11-T1] Simplify user dashboard tabs layout`

---

### P11-T2 — Implement Unified Master Profile Form
- **Create**: `src/components/profile/MasterProfileForm.tsx`
- **Action**:
  - Build a single layout that hosts the 8 sub-forms: PersonalInfoForm, ProfessionalInfoForm, WorkExperienceForm, EducationForm, SkillsForm, ProjectsForm, CertificationsForm, VolunteerForm.
  - Use a split-pane layout: a vertical sub-navigation on the left (or list of anchor links) to switch between sections, and the scrollable form fields on the right.
  - Enforce consistent save and status updates.
- **Modify**: `src/pages/Account.tsx` to render `<MasterProfileForm />` under the `profile` tab.
- **Acceptance**: Master Profile allows entering all resume data under a single tab.
- **Commit Message**: `[P11-T2] Implement unified master profile form`

---

### P11-T3 — Create Documents Dashboard Component
- **Create**: `src/components/profile/DocumentsDashboard.tsx`
- **Action**:
  - Display a split layout:
    - **Resumes Section**: Grid of resume cards. Each card displays the resume name, active template key badge, and a dropdown/button group for: Edit, Clone, Delete, Download, and Share.
    - **Cover Letters Section**: Grid of cover letter cards displaying the letter title, linked resume (if any), and actions: Edit, Delete, Download.
  - Include large, clean "Create New Resume" and "Create New Cover Letter" action cards.
- **Modify**: `src/pages/Account.tsx` to render `<DocumentsDashboard />` under the `documents` tab.
- **Acceptance**: Documents tab lists all resumes and cover letters in a clean, visual card grid with E2E functionality.
- **Commit Message**: `[P11-T3] Create documents dashboard component`

---

### P11-T4 — Overhaul Admin Dashboard Layout
- **Modify**: `src/pages/Admin.tsx`
- **Action**:
  - Replace the horizontal 13-tab list (`TabsList`) with a side-navigation layout.
  - Use a grid/flex container:
    - Left side: A sidebar menu containing the 13 navigation buttons with lucide icons.
    - Right side: Scrollable pane hosting the selected `TabsContent`.
  - For mobile screens (`md` breakpoint and below), collapse the sidebar into a toggleable hamburger button that slides out a sheet drawer.
- **Acceptance**: The 13 admin tabs are readable, clean, and fit on any screen resolution without overflow.
- **Commit Message**: `[P11-T4] Overhaul admin dashboard layout to side navigation`

---

### P11-T5 — Refine Admin UI Theme & Visual Polish
- **Modify**: `src/pages/Admin.tsx`, `src/components/admin/EnhancedSystemStats.tsx`
- **Action**:
  - Apply consistent glassmorphism effects (`backdrop-blur`, borders with `border-white/10` or matching neo-brutalism borders).
  - Add active state indicators on the sidebar buttons (left border highlighting, color shifting).
  - Clean up card spacings, margins, and card headers to match premium design principles.
- **Acceptance**: Admin dashboard looks premium and professional under both light/dark themes.
- **Commit Message**: `[P11-T5] Refine admin UI theme and visual polish`
