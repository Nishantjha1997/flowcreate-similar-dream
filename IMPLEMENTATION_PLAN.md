# FlowCreate Refinement & Feature Expansion Plan

This plan outlines the steps to refine existing features (fixing the PDF format bug, removing the AI badge) and introduces a roadmap to reach feature parity with FlowCV.com.

## 1. Refinements & Bug Fixes (Immediate Execution)

### Remove "AI-Powered" Badge
- **File**: `src/components/HeroSection.tsx`
- **Change**: Remove the rounded badge containing the text "AI-Powered Resume Builder" from the Apple-inspired hero section to reduce the "AI-generated" appearance of the landing page.

### Fix PDF Export Formatting (A4 Size Standardization)
- **Problem**: The on-screen resume preview renders at A4 dimensions (`794px` width), but the PDF exporter (`usePDFGenerator.tsx`) forces an off-screen clone width of `816px` (US Letter). This width mismatch causes flexbox/grid layouts in newer, complex templates to break, resulting in cut-offs and misaligned margins.
- **File**: `src/hooks/usePDFGenerator.tsx`
- **Change**: 
  - Standardize the off-screen clone width to exactly `794px` (A4 standard at 96dpi).
  - Explicitly enforce `.resume-content` box-sizing to prevent padding leaks during the `html2canvas` capture.
  - Ensure the cloned DOM node scales to A4 (`210mm x 297mm`) perfectly without overflow.

---

## 2. Feature Expansion (FlowCV Parity)

Based on a competitive analysis of FlowCV.com, the following features are missing from our platform:

### Phase A: Cover Letter Builder
- A dedicated builder interface mirroring the Resume Builder.
- Shared design system (templates apply identically to Cover Letters).
- AI generation for cover letter content based on the user's resume data and a target job description.

### Phase B: Shareable Feedback Links & Tracking
- Allow users to generate a unique public URL (e.g., `flowcreate.com/r/john-doe`).
- **Feedback Mode**: Allow peers to add comments directly on the resume layout.
- **Tracking Mode**: Provide basic analytics (view count, last viewed timestamp) so users know when employers open their resume.

### Phase C: Personal Website Builder
- A one-click converter that takes the user's resume data (experience, projects, skills) and deploys it as a responsive, single-page portfolio website.

### Phase D: Multi-Resume & Localization
- Allow users to maintain a master profile and spawn multiple tailored resume variants for different job applications.
- Built-in AI translation for applying to international roles.
