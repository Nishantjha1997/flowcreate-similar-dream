# ADR 0001: Semantic PDF export

- Status: Accepted for the current release
- Date: 2026-07-23
- Scope: Resume Builder and Cover Letter Builder
- Decision owner: FlowCreate product engineering

## Context

FlowCreate has two export paths:

1. `printResume` clones the rendered document into a print window and uses browser paged-media
   output. The saved PDF can contain real text and links.
2. `generatePDF` renders the document with `html2canvas` and places JPEG page slices into jsPDF.
   It preserves visual appearance, but the PDF pages are images and are not a credible default for
   an ATS-oriented product.

The product needs a primary export that preserves selectable text, links, logical reading order,
and page boundaries. A direct download would be more convenient than a print dialog, but it must
not weaken those properties or create a second template system that silently drifts from the UI.

## Options evaluated

| Criterion | Browser print (`printResume`) | `jsPDF.html()` | `@react-pdf/renderer` |
|---|---|---|---|
| Uses current HTML/template styles | Yes; it clones the actual rendered document | Partly; the HTML plug-in depends on `html2canvas`, whose CSS support and pagination differ from the browser | No; templates must be rebuilt with React PDF primitives and its styling model |
| Selectable text | Expected, but must be proved from saved Chrome and Edge artifacts | Not accepted without artifact proof; the HTML path's `html2canvas` dependency makes semantic output an unsafe assumption | Yes when content is rendered with `Text` primitives |
| Clickable links | Browser print can retain anchors; must be proved for each fixture | Not accepted without artifact proof | Explicit `Link` primitives are available |
| Reading order | Follows DOM order, which can diverge from visual order in columns | Can inherit DOM/CSS conversion ambiguity | Deterministic, but only after building and maintaining a separate document tree |
| Visual fidelity across 37 templates | Highest because it reuses the live renderer | Medium and conversion-dependent | Low initially; reaching parity requires a second implementation of every template |
| Pagination | Browser paged-media fragmentation with `@page` and `break-inside` | Conversion-specific and requires separate calibration | Deterministic in its own layout engine, but not the browser preview's pagination |
| Bundle/runtime cost | No new dependency | Reuses installed jsPDF/html2canvas; current production chunks are about 415 kB and 201 kB before gzip | New dependency and font/layout runtime, plus a second renderer |
| Maintenance cost | Lowest: one renderer, one print stylesheet | Medium: browser renderer plus conversion-specific fixes | Highest: browser templates and PDF templates must stay in lockstep |
| Direct file download | No; the user confirms “Save as PDF” in the print dialog | Yes | Yes |

## Decision

Keep browser print as the primary **Download PDF (ATS-friendly)** path for the current release.
Keep the rasterized jsPDF path as the explicitly secondary **Exact-look PDF (image)** option.
Do not add `@react-pdf/renderer`, and do not switch to `jsPDF.html()`, until the artifact fixture
matrix described below exists and demonstrates a measurable improvement over browser print.

This is deliberately a trust decision, not a convenience decision. Browser print reuses the live
renderer and has the smallest drift surface. `jsPDF.html()` does not remove the project's existing
`html2canvas` uncertainty. `@react-pdf/renderer` can produce semantic documents, but introducing a
parallel renderer before the 37-template registry stabilizes would create a large correctness and
maintenance burden.

If one-click semantic download becomes a launch requirement, the next spike should compare a
single normalized document model rendered by both the browser and a PDF-native implementation.
It must start with one ATS-safe template, not attempt visual parity across all templates.

## Artifact contract

An export may be called ATS-friendly only when all of these checks pass on the saved PDF itself:

1. Text can be selected and copied.
2. `pdftotext -layout` output contains every visible section and item exactly once.
3. Normalized extraction order matches the expected recruiter-view fixture.
4. Email, phone, portfolio, LinkedIn, and website links remain clickable where supplied.
5. No section is clipped at a page boundary.
6. Unusual glyphs, bullets, accented names, and non-ASCII text survive extraction.
7. The result passes in current stable Chrome and Edge.

The minimum release matrix is:

- `clean-slate` single-column resume;
- one left-sidebar template;
- one right-sidebar template;
- one controlled two-page resume;
- one controlled three-page resume;
- one cover letter.

Each fixture must store its expected normalized text order. D-5 Recruiter View must consume the
same normalized semantic document model or verified PDF extraction output. It must never infer
ATS safety from `innerText` alone.

## Consequences

- The primary action opens the browser print dialog rather than downloading immediately.
- Users receive a plain-language distinction between ATS-friendly and exact-look image output.
- Template work remains single-source while parallel template milestones are active.
- D-5 implementation starts with fixtures and extraction evidence before UI scoring or marketing
  claims.
- A future direct-download renderer is possible, but it must prove semantic and maintenance value
  against this contract.

## Evidence and references

- Live implementation: `src/hooks/usePDFGenerator.tsx`.
- Chrome documents browser paged-media fragmentation and `@page` support:
  <https://developer.chrome.com/blog/print-margins/>
- jsPDF documents that its `html` method depends on `html2canvas`:
  <https://github.com/parallax/jsPDF#optional-dependencies>
- React PDF documents its PDF primitives and on-the-fly rendering API:
  <https://react-pdf.org/advanced>
