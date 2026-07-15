# Overhaul Progress
## Current task: P1-T4
## Completed
- P0-T1: Baseline verified; progress tracker created
- P1-T1: Created supabase/functions/_shared/aiProviders.ts (callTextModel + getAnyActiveKey)
- P1-T2: Updated gemini-suggest to route through any active provider; env GEMINI_API_KEY as fallback; gemini fallback-key retry preserved; response shape unchanged
- P1-T3: extract-resume-data: Gemini→multimodal path unchanged; non-Gemini→unpdf text extraction + callTextModel; no-key error message updated; scanned-PDF detection added
## Blocked / conflicts found
(none)
## Baseline notes
- build: OK @ 2026-07-16, tsc: OK @ 2026-07-16
