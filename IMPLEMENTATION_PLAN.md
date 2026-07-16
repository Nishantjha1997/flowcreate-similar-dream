# Final Updated Implementation Plan: FlowCreate Refinement & competitive expansion

This plan details the finalized specifications for immediate bug fixes (slicing fixes, landing page polish) and the technical architecture for competitive features (FlowCV parity) based on our technical project manager review.

---

## User Review Required

> [!IMPORTANT]
> - **Shared Constants**: We are introducing a central constants file `src/constants/pdfDimensions.ts` to ensure the on-screen preview and the PDF generator never drift out of sync.
> - **Competitive Features Phasing**: Phase 1 (Cover Letter) and Phase 2 (Shareable Feedback) require database migrations. We will apply them in sequence.

---

## 1. Immediate Refinements & Bug Fixes (Part A)

### A1. Remove landing page "AI-Powered Resume Builder" pill
- **File**: [HeroSection.tsx](file:///c:/Users/ADMIN/Desktop/Projects/flowcreate-similar-dream/src/components/HeroSection.tsx#L61-L65)
- **Change**: Delete the overline badge block (lines 61-65) containing the blinking green dot and "AI-Powered Resume Builder" text to make the site look less "generic AI-generated".

### A2. Introduce Shared A4 Dimensions Constants
- **File**: `[NEW] src/constants/pdfDimensions.ts`
- **Content**:
  ```typescript
  /** A4 width at 96dpi (210mm) */
  export const A4_WIDTH_PX = 794;
  /** A4 height at 96dpi (297mm) */
  export const A4_HEIGHT_PX = 1123;
  /** A4 width in mm */
  export const A4_WIDTH_MM = 210;
  /** A4 height in mm */
  export const A4_HEIGHT_MM = 297;
  ```

### A3. Fix PDF Export Aspect Ratio & A4 Slicing
- **File**: [usePDFGenerator.tsx](file:///c:/Users/ADMIN/Desktop/Projects/flowcreate-similar-dream/src/hooks/usePDFGenerator.tsx)
- **Action**:
  - Replace the clone creation block with A4 standard px (`A4_WIDTH_PX`).
  - Set `overflow: 'hidden'` on the clone root to prevent horizontal/sidebar bleeding.
  - Set `width: A4_WIDTH_PX + 'px'` and `maxWidth: '100%'` on the clone root.
  - Configure `html2canvas` options with `windowWidth: A4_WIDTH_PX` and `width: A4_WIDTH_PX` to lock dimensions.
  - Set page height math variables using `A4_HEIGHT_PX`, `A4_WIDTH_MM`, `A4_HEIGHT_MM`.

### A4. Update Preview Section to Use Shared Constants
- **File**: [ResumePreviewSection.tsx](file:///c:/Users/ADMIN/Desktop/Projects/flowcreate-similar-dream/src/components/resume/ResumePreviewSection.tsx)
- **Action**:
  - Import `A4_WIDTH_PX` and `A4_HEIGHT_PX`.
  - Replace hardcoded `794px` and `1123px` on lines 30, 38, 75, and 221 with the imported constants.

---

## 2. Competitive Features (Part B)

### Phase 1: Cover Letter Builder
- **Database Migration**: `supabase/migrations/20260717000000_cover_letters.sql`
  - Create table `public.cover_letters` with RLS and owner-access policies.
- **Frontend Pages/Components**:
  - `src/pages/CoverLetterBuilder.tsx` (Split pane, left editor, right preview).
  - `src/components/cover-letter/CoverLetterEditor.tsx` (Rich editor, AI suggest button).
  - `src/components/cover-letter/CoverLetterPreview.tsx` (Single page A4 PDF preview using `usePDFGenerator`).
- **Backend/AI**:
  - Extend `gemini-suggest` edge function to handle `context: 'cover_letter'` using Linked Resume data.

### Phase 2: Shareable Feedback Links & Peer Review
- **Database Migration**: `supabase/migrations/20260718000000_resume_sharing.sql`
  - Create table `public.resume_shares` (public read access by token, owner manage).
  - Create table `public.resume_comments` (public insert, owner resolve).
- **Frontend Pages/Components**:
  - `src/pages/SharedResumeView.tsx` (Public read-only view under `/r/:share_token`).
  - `src/components/sharing/CommentPanel.tsx` (Floating annotations and review panel).
  - "Share for Feedback" action in `ResumeBuilder.tsx` header.

### Phase 3: View Analytics
- **Implementation**:
  - Edge function `supabase/functions/track-resume-view/index.ts` logs events to `analytics_events` on `/r/:share_token` hit.
  - Create dashboard `src/components/analytics/ResumeViewAnalytics.tsx` with charts of views/referrers over time.

### Phase 4: Multi-Resume Profiles & Translation
- **Database Migration**: `supabase/migrations/20260719000000_master_profiles.sql`
  - Create `public.master_profiles` table containing superset resume JSON data.
- **Implementation**:
  - Add language selector to `ResumeBuilder` leveraging `gemini-suggest` translation mode.
  - Multi-resume spawner page to generate tailored resumes from Master Profile.

---

## Verification Plan

### Automated Tests
- Run `npm run test` to confirm Vitest tests pass cleanly.

### Manual Verification
1. Inspect landing page to verify the "AI-Powered Resume Builder" pill is completely removed.
2. Download a PDF and verify page boundaries align exactly with the builder indicators.
