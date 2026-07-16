# DEEPSEEK v4 PROJECT MANAGER PROMPT

Copy and paste the prompt below into DeepSeek v4 to have it evaluate, rate, and refine this implementation plan against the codebase.

***

```markdown
Role: Senior Technical Project Manager & Architect
Task: Codebase Analysis, Plan Evaluation, and Refinement

You are acting as a Senior Technical Project Manager and Architect. Your job is to understand the codebase of the "FlowCreate" project, evaluate a proposed plan for bug fixes and feature expansions, rate the plan's feasibility and completeness, refine it with concrete technical solutions, and output a final, updated plan.

### 1. Codebase Overview
This is a Resume Builder & Applicant Tracking System (ATS) platform.
- Frontend: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, TanStack Query.
- Backend: Supabase (PostgreSQL database with RLS, Supabase Auth, Edge Functions).
- Payments: Razorpay.
- PDF Generation: html2canvas + jsPDF in `src/hooks/usePDFGenerator.tsx`.
- Template Engine: `src/templates/registry.ts` and `src/utils/resumeTemplates.tsx`.

---

### 2. Proposed Implementation Plan
Here is the plan you need to evaluate:

#### Part A: Bug Fixes & Refinements
1. **Remove landing page "AI-Powered Resume Builder" pill**:
   - Location: `src/components/HeroSection.tsx` (Apple-style hero view).
   - Change: Remove the overline badge block (lines 61-65) containing the blinking green dot and "AI-Powered Resume Builder" text to make the site look less "generic AI-generated".

2. **Fix PDF Export Aspect Ratio & A4 Slicing**:
   - Location: `src/hooks/usePDFGenerator.tsx` and `src/components/resume/ResumePreviewSection.tsx`.
   - Bug: The builder renders a preview with a width of `794px` (representing A4 at 96dpi, which corresponds to `1123px` page height). However, `usePDFGenerator.tsx` clones the resume offscreen at `816px` width (US Letter). Because of this width mismatch, the PDF exporter slices the canvas at `1154px` heights instead of `1123px`. This causes page-break indicators in the builder to be misaligned with actual PDF page boundaries, cutting text lines in half.
   - Proposed Fix: Standardize `usePDFGenerator.tsx` offscreen clone width to exactly `794px` to match the builder's CSS width. Configure `html2canvas` with `windowWidth: 794` and `width: 794`.

#### Part B: Competitive Features Roadmap (FlowCV.com Parity)
- **Phase 1: Cover Letter Builder**: A separate builder layout matching the resume templates in style. AI assistant prompts based on resume data.
- **Phase 2: Shareable Feedback Links & Comments**: Allow users to share a public link `/r/:share_token` where peers can add annotations/comments.
- **Phase 3: View Analytics**: Track views (IP/location/User-Agent) for shared resume links.
- **Phase 4: Multi-Resume Profiles & Translation**: Spawn multiple tailored resumes from a Master Profile.

---

### 3. Your Instructions
Please perform the following steps:

1. **Understand the Codebase**: Analyze how the templates (`src/utils/resumeTemplates.tsx`), builder (`src/pages/ResumeBuilder.tsx`), preview (`src/components/resume/ResumePreviewSection.tsx`), and exporter (`src/hooks/usePDFGenerator.tsx`) work together.
2. **Evaluate & Rate the Plan**:
   - Is standardizing the exporter to `794px` sufficient to resolve all layout shifting and slicing bugs for complex templates (e.g. grid-based or sidebar layouts)?
   - Rate the overall plan on a scale of 1-10 (Feasibility, Completeness, Risk).
3. **Refine & Enhance**:
   - Suggest any specific CSS rules (like `box-sizing: border-box`, `max-width`, or `overflow` overrides) that need to be injected into the cloned element before capturing to guarantee perfect rendering in `html2canvas`.
   - Specify database schema changes or edge function extensions needed for the new FlowCV-like features.
4. **Output Final Plan**: Provide the updated, final plan in Markdown format, ready to be written back to the project files.
```
