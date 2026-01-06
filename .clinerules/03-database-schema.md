# 🗄️ Database Schema

## Supabase Project
- **Project ID**: `tkhnxiqvghvejdulvmmx`
- **Types File**: `src/integrations/supabase/types.ts` (READ-ONLY, auto-generated)

## Core Tables

### `profiles`
User profile data for resume building.
```sql
- id: UUID (PK)
- user_id: UUID (FK to auth.users, UNIQUE)
- full_name, email, phone, address
- city, state, country, postal_code
- linkedin_url, github_url, website_url, portfolio_url
- professional_summary, current_position, experience_level
- industry, date_of_birth, avatar_url
- technical_skills: JSONB[]
- soft_skills: JSONB[]
- work_experience: JSONB[]
- education: JSONB[]
- projects: JSONB[]
- certifications: JSONB[]
- volunteer_experience: JSONB[]
- languages: JSONB[]
- achievements: JSONB[]
- profile_completeness: INTEGER
- auto_sync_enabled: BOOLEAN
- last_resume_sync: TIMESTAMP
- created_at, updated_at: TIMESTAMP
```

### `resumes`
Saved resume documents.
```sql
- id: UUID (PK)
- user_id: UUID (FK)
- resume_data: JSONB (full resume content)
- template_id: TEXT
- created_at, updated_at: TIMESTAMP
```

### `subscriptions`
Premium subscription status.
```sql
- id: UUID (PK)
- user_id: UUID (FK)
- is_premium: BOOLEAN
- plan_type: TEXT
- status: TEXT
- razorpay_customer_id, razorpay_payment_id: TEXT
- current_period_start, current_period_end: TIMESTAMP
- expires_at: TIMESTAMP
```

### `payments`
Payment transaction records.
```sql
- id: UUID (PK)
- user_id: UUID
- subscription_id: UUID (FK)
- razorpay_order_id, razorpay_payment_id: TEXT
- amount: NUMERIC
- currency: TEXT (default 'INR')
- status: TEXT
- payment_method: TEXT
```

### `user_roles`
Role-based access control.
```sql
- id: UUID (PK)
- user_id: UUID
- role: app_role ENUM ('admin', 'moderator', 'user')
```

### `site_settings`
Global site configuration.
```sql
- id: UUID (PK)
- setting_key: TEXT (UNIQUE)
- setting_value: JSONB
```

## ATS (Applicant Tracking System) Tables

### `organizations`
Companies using ATS.
```sql
- id: UUID (PK)
- name, slug (UNIQUE), description
- logo_url, website_url
- industry, company_size
- settings: JSONB
```

### `organization_members`
Team members in organizations.
```sql
- id: UUID (PK)
- organization_id: UUID (FK)
- user_id: UUID
- role: TEXT ('owner', 'admin', 'recruiter', 'hiring_manager')
- department: TEXT
- invited_by: UUID
- joined_at: TIMESTAMP
```

### `departments`
Organization departments.
```sql
- id: UUID (PK)
- organization_id: UUID (FK)
- name, description
```

### `jobs`
Job postings.
```sql
- id: UUID (PK)
- organization_id: UUID (FK)
- department_id: UUID (FK)
- created_by: UUID
- title, description, requirements, responsibilities
- location, job_type, experience_level
- salary_min, salary_max, salary_currency
- status: TEXT ('draft', 'published', 'closed')
- hiring_managers: UUID[]
- recruiters: UUID[]
- settings: JSONB
- published_at, closed_at: TIMESTAMP
```

### `pipeline_stages`
Hiring pipeline stages per job.
```sql
- id: UUID (PK)
- job_id: UUID (FK)
- name, description, color
- stage_order: INTEGER
- is_default: BOOLEAN
```

### `job_applications`
Candidate applications.
```sql
- id: UUID (PK)
- job_id: UUID (FK)
- current_stage_id: UUID (FK to pipeline_stages)
- candidate_name, candidate_email, candidate_phone
- candidate_linkedin
- resume_id: UUID (FK to resumes)
- resume_url: TEXT
- cover_letter: TEXT
- status: TEXT
- source: TEXT
- rating: INTEGER
- tags: TEXT[]
- ai_match_score: INTEGER
- ai_summary: TEXT
- assigned_to: UUID
- application_data: JSONB
```

### `interviews`
Interview scheduling.
```sql
- id: UUID (PK)
- application_id: UUID (FK)
- title, interview_type
- scheduled_at: TIMESTAMP
- duration_minutes: INTEGER
- location, meeting_link
- interviewers: UUID[]
- status: TEXT
- notes, feedback: TEXT
- created_by: UUID
```

### `job_offers`
Job offers to candidates.
```sql
- id: UUID (PK)
- application_id: UUID (FK)
- job_title
- salary_amount, salary_currency
- start_date, expires_at
- benefits: TEXT
- status: TEXT
- offer_letter_url: TEXT
```

### `talent_pools` & `talent_pool_candidates`
Candidate talent pools for future positions.

### `application_reviews`
Reviewer feedback on applications.

### `ats_activities`
Activity log for ATS actions.

## AI Management Tables

### `ai_api_keys`
Store multiple AI API keys with rotation.
```sql
- id: UUID (PK)
- provider: TEXT ('gemini', 'openai')
- name, key: TEXT
- is_active, is_primary, is_fallback: BOOLEAN
- usage_count: INTEGER
- last_used: TIMESTAMP
```

### `ai_token_usage`
Track AI token consumption.
```sql
- id: UUID (PK)
- provider: TEXT
- tokens_today, tokens_this_month, total_tokens: INTEGER
- cost_estimate: NUMERIC
```

## Database Functions

```sql
-- Check if current user is admin
is_admin() → BOOLEAN

-- Check if user is super admin
is_super_admin() → BOOLEAN

-- Check user role
has_role(_user_id UUID, _role app_role) → BOOLEAN
get_user_role(user_id UUID) → app_role

-- Organization access
is_org_member(org_id UUID) → BOOLEAN
has_org_role(org_id UUID, required_role TEXT) → BOOLEAN

-- Profile helpers
calculate_profile_completeness(profile_data JSONB) → INTEGER

-- Triggers
update_updated_at_column() - Auto-update updated_at
sync_resume_to_profile() - Sync resume data to profile
```

## Row Level Security (RLS)
All tables have RLS enabled with policies for:
- Users can read/write their own data
- Admins have elevated access
- Organization members can access org data based on role
- Public read for published jobs
