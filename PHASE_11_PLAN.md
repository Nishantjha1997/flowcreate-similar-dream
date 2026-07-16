# FlowCreate — SaaS Overhaul Plan: Phase 11 UX Refinement & Template Overhaul (Executor Edition)

> **Audience**: An AI coding assistant (e.g. DeepSeek v4 / GLM 5.2) executing tasks one at a time.
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
  - Restructure `getTabConfig` to expose only 4 clean tabs matching FlowCV:
    1. `documents` (Label: "My Documents", Icon: `FileText`, default tab)
    2. `profile` (Label: "Master Profile", Icon: `User`)
    3. `analytics` (Label: "Analytics", Icon: `Eye`)
    4. `security` (Label: "Security & Settings", Icon: `Lock`)
  - Place existing profile data forms inside the `profile` tab.
- **Acceptance**: Account page displays exactly 4 tabs.
- **Commit Message**: `[P11-T1] Simplify user dashboard tabs layout`

---

### P11-T2 — Implement Unified Master Profile Form
- **Create**: `src/components/profile/MasterProfileForm.tsx`
- **Action**:
  - Build a layout hosting the 8 sub-forms: PersonalInfoForm, ProfessionalInfoForm, WorkExperienceForm, EducationForm, SkillsForm, ProjectsForm, CertificationsForm, VolunteerForm.
  - Implement a split-pane layout: a vertical sub-navigation on the left (or list of anchor links) to switch between sections, and the scrollable form fields on the right.
- **Modify**: `src/pages/Account.tsx` to render `<MasterProfileForm />` under the `profile` tab.
- **Acceptance**: Profile data can be entered under a single tab.
- **Commit Message**: `[P11-T2] Implement unified master profile form`

---

### P11-T3 — Create Documents Dashboard Component
- **Create**: `src/components/profile/DocumentsDashboard.tsx`
- **Action**:
  - Display a split layout:
    - **Resumes**: Grid of cards displaying resume name, active template key badge, and options: Edit, Clone, Delete, Download, and Share.
    - **Cover Letters**: Grid of cards displaying letter title, linked resume (if any), and actions: Edit, Delete, Download.
  - Include "Create New Resume" and "Create New Cover Letter" action cards.
- **Modify**: `src/pages/Account.tsx` to render `<DocumentsDashboard />` under the `documents` tab.
- **Acceptance**: Documents tab lists all resumes and cover letters in a clean card grid.
- **Commit Message**: `[P11-T3] Create documents dashboard component`

---

### P11-T4 — Overhaul Admin Dashboard Layout
- **Modify**: `src/pages/Admin.tsx`
- **Action**:
  - Replace the horizontal 13-tab list (`TabsList`) with a side-navigation layout.
  - Sidebar menu on the left, scrollable pane hosting selected `TabsContent` on the right.
  - Mobile screens collapse sidebar into drawer sheet.
- **Acceptance**: The 13 admin tabs are readable, clean, and fit on any screen resolution without overflow.
- **Commit Message**: `[P11-T4] Overhaul admin dashboard layout to side navigation`

---

### P11-T5 — Refine Admin UI Theme & Visual Polish
- **Modify**: `src/pages/Admin.tsx`, `src/components/admin/EnhancedSystemStats.tsx`
- **Action**:
  - Apply consistent glassmorphism effects, active state indicators on sidebar buttons, and spacing refinements.
- **Acceptance**: Admin dashboard looks premium under both light/dark themes.
- **Commit Message**: `[P11-T5] Refine admin UI theme and visual polish`

---

### P11-T6 — Decommission Outdated Resume Templates
- **Modify**: `src/templates/registry.ts`
- **Action**:
  - Set `featured: false` on the following subpar templates to hide them from the gallery front-page:
    1. `coral-creative`
    2. `sidebar-modern`
    3. `azure-classic`
  - Retain their registry definitions and legacyId mappings so that existing user resumes referencing these keys continue to render correctly (backward compatibility).
- **Acceptance**: The 3 templates are no longer displayed on `/templates` or the selector grid but render correctly when loaded on old resumes.
- **Commit Message**: `[P11-T6] Decommission outdated resume templates`

---

### P11-T7 — Implement Premium FlowCV-Inspired Templates
- **Modify**: `src/templates/registry.ts`
- **Action**: Register 4 new templates:
  1. `atlantic-blue`: Single column, horizontal blue accent separator line, elegant professional layout. (Premium)
  2. `mercury-flow`: High-contrast left sidebar column (`#1e293b`), main body on the right, tag pill skills layout. (Premium)
  3. `saffron-line`: Elegant serif typography, thin top saffron accent border, clean serif spacing. (Premium)
  4. `blue-steel`: Navy blue accent block header, two columns, tech startup focus. (Premium)
- **Modify**: `src/utils/resumeTemplates.tsx`
  - Implement full rendering logic and css styles for the 4 templates.
  - Obey all print/slicing constraints: hex/rgb colors only, px-string dimensions, fallback font stacks, and no CSS variables.
- **Acceptance**: The 4 templates display in the gallery selector and E2E render in the builder preview.
- **Commit Message**: `[P11-T7] Implement premium FlowCV-inspired templates`
