# DEEPSEEK PHASE 11 EVALUATION PROMPT

Copy and paste the prompt below into DeepSeek / GLM 5.2 to have it evaluate, rate, and refine the Phase 11 plan.

***

```markdown
Role: Senior Technical Project Manager & Architect
Task: Evaluate, rate, and refine Phase 11 UX Overhaul & Template Redesign Plan

You are acting as a Senior Technical Project Manager and Architect. Your job is to understand the codebase of the "FlowCreate" project, evaluate a proposed Phase 11 plan for dashboard simplification, admin UX refinement, and modern resume template designs (inspired by FlowCV.com), rate the plan's feasibility and completeness, refine it with concrete technical solutions, and output a final, updated plan.

### 1. Codebase Overview
- Frontend: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui.
- User Dashboard: `src/pages/Account.tsx` displays the user dashboard. Currently contains 11 tabs, mixing documents list with 8 profile forms.
- Admin Panel: `src/pages/Admin.tsx` contains 13 tabs in a single horizontal row, causing severe overflow and layout issues.
- Template Engine: `src/templates/registry.ts` and `src/utils/resumeTemplates.tsx`.

---

### 2. Proposed Phase 11 Plan
- **P11-T1**: Simplify `src/pages/Account.tsx` to display exactly 4 tabs (`documents`, `profile` [Master Profile], `analytics`, `security`).
- **P11-T2**: Create a unified `MasterProfileForm.tsx` grouping the 8 sub-forms (PersonalInfo, WorkExperience, etc.) with a vertical left navigation sub-tab list and scrollable container.
- **P11-T3**: Create `DocumentsDashboard.tsx` to display resumes and cover letters in card grids with CRUD options, plus "New Document" CTAs.
- **P11-T4**: Overhaul `src/pages/Admin.tsx` to replace the horizontal 13-tab row with a vertical side navigation layout, collapsing into a mobile drawer menu.
- **P11-T5**: Refine CSS visual polish and styling constraints (active states, animations, theme compatibility) in both the user dashboard and admin view.
- **P11-T6**: Decommission outdated templates (`coral-creative`, `sidebar-modern`, `azure-classic`) by setting `featured: false` in `registry.ts`.
- **P11-T7**: Design and implement 4 new premium modern templates (`atlantic-blue`, `mercury-flow`, `saffron-line`, `blue-steel`) in `resumeTemplates.tsx` and `registry.ts` following FlowCV designs.

---

### 3. Your Instructions
Please perform the following steps:

1. **Evaluate & Rate the Plan**:
   - Assess the UX improvement of moving from 11 tabs to 4 tabs on the user side.
   - Rate the overall plan on a scale of 1-10 (Feasibility, Completeness, Risk).
2. **Refine & Enhance**:
   - Suggest how `MasterProfileForm` can handle auto-saving across multiple sub-sections cleanly without losing focus or resetting states.
   - Suggest a clean sidebar layout structure using standard Tailwind classes (like flex containers, responsive grids, and drawer menus) for `Admin.tsx`.
   - Provide concrete CSS inline styles and layouts for the 4 new templates in `resumeTemplates.tsx` to match premium FlowCV layouts (Atlantic Blue, Mercury Flow, Saffron Line, Blue Steel).
3. **Output Final Plan**: Provide the updated, final Phase 11 plan in Markdown format (Executor Edition format, detailing files, subtasks, verify commands, and commit messages), ready to be written back to the project files.
```
