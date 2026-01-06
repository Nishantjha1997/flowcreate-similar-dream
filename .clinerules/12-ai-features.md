# 🤖 AI Features

## Overview
AI-powered features using Google Gemini API for resume enhancement and data extraction.

## Features

### 1. Resume PDF Parsing
Extracts structured data from uploaded PDF resumes.

**Component**: `src/components/profile/PDFResumeUploader.tsx`
**Edge Function**: `supabase/functions/extract-resume-data/`

**Flow**:
1. User uploads PDF resume
2. PDF sent to edge function
3. Gemini AI parses and extracts:
   - Personal information
   - Work experience
   - Education
   - Skills
   - Projects
4. Structured data returned
5. User previews and confirms import
6. Data saved to profile

**Requires**: `GEMINI_API_KEY` secret

### 2. AI Content Suggestions
Generates improved content for resume sections.

**Component**: `src/components/resume/AiSuggestionButton.tsx`
**Edge Function**: `supabase/functions/gemini-suggest/`

**Types of Suggestions**:
- Professional summary generation
- Experience bullet point improvement
- Skills recommendations based on role
- Achievement quantification

**Request Example**:
```typescript
{
  type: 'summary',
  context: {
    jobTitle: 'Software Engineer',
    experience: [...],
    skills: [...]
  }
}
```

### 3. ATS Match Scoring (Planned)
AI-powered candidate-job matching for ATS module.

## AI Key Management

### Location
`supabase/functions/_shared/aiKeyManager.ts`

### Features
- Multiple API keys support
- Key rotation on rate limits
- Usage tracking
- Fallback keys

### Database Tables

#### ai_api_keys
```sql
- provider: TEXT ('gemini', 'openai')
- name: TEXT
- key: TEXT (encrypted)
- is_active: BOOLEAN
- is_primary: BOOLEAN
- is_fallback: BOOLEAN
- usage_count: INTEGER
- last_used: TIMESTAMP
```

#### ai_token_usage
```sql
- provider: TEXT
- tokens_today: INTEGER
- tokens_this_month: INTEGER
- total_tokens: INTEGER
- cost_estimate: NUMERIC
```

## Client-Side AI Utility

### Location
`src/utils/ai/gemini.ts`

**Note**: Currently, AI calls go through edge functions to keep API keys secure.

## Configuration

### Required Secrets
| Secret | Purpose |
|--------|---------|
| `GEMINI_API_KEY` | Primary AI provider |
| `OPENAI_API_KEY` | Fallback (optional) |

### Admin AI Management
**Component**: `src/components/admin/AIManagement.tsx`

Admin panel for:
- Adding/removing API keys
- Monitoring usage
- Setting rate limits
- Enabling/disabling providers

## Error Handling

### No API Key
When `GEMINI_API_KEY` is not configured:
```typescript
{
  error: "AI features require configuration",
  message: "Please configure GEMINI_API_KEY",
  requiresSetup: true
}
```

### Rate Limiting
- Edge functions implement retry logic
- Falls back to secondary key if available
- Returns user-friendly error message

## Usage Limits

### Free Tier
- Limited AI suggestions per day
- Basic PDF parsing

### Premium Tier
- Unlimited AI suggestions
- Priority processing
- Advanced parsing features

## Future AI Features

1. **Smart Content Generation**
   - Auto-generate entire resume sections
   - Job-specific tailoring

2. **Interview Preparation**
   - AI-generated interview questions
   - Answer suggestions

3. **Career Recommendations**
   - Skills gap analysis
   - Career path suggestions

4. **ATS Optimization**
   - Keyword optimization
   - Format recommendations
