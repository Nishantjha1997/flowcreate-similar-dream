# Overhaul Progress
## Current task: P2-T5
## Completed
- P0-T1: Baseline verified; progress tracker created
- P1-T1: Created supabase/functions/_shared/aiProviders.ts (callTextModel + getAnyActiveKey)
- P1-T2: Updated gemini-suggest to route through any active provider; env GEMINI_API_KEY as fallback; gemini fallback-key retry preserved; response shape unchanged
- P1-T3: extract-resume-data: Gemini→multimodal path unchanged; non-Gemini→unpdf text extraction + callTextModel; no-key error message updated; scanned-PDF detection added
- P1-T4: Updated AI copy in PDFUploader, PDFResumeUploader, AIManagement to reference Gemini/DeepSeek/OpenAI
- P2-T1: Created src/templates/registry.ts with TemplateDefinition, TEMPLATE_REGISTRY (7 templates), resolveTemplateKey, getTemplate
- P2-T2: Routed all template-key resolution through the registry; updated useResumeSave to persist canonical key; updated Account.tsx, ResumeVisualPreview.tsx, ResumeData.ts, resumeTemplates.tsx
- P2-T3: Replaced hardcoded templates arrays in ResumeBuilderSidebar.tsx and Templates.tsx with TEMPLATE_REGISTRY map loops
- P2-T4: Updated src/pages/Examples.tsx to route template name lookups and cards through TEMPLATE_REGISTRY mapping; updated TemplatesSection.tsx, TemplatesCarousel.tsx, and ResumeTemplatePreview.tsx to utilize registry keys and exact styled box parameters.
## Blocked / conflicts found
(none)
## Baseline notes
- build: OK @ 2026-07-16, tsc: OK @ 2026-07-16
