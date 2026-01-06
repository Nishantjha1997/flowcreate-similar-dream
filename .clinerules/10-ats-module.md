# 🏢 ATS (Applicant Tracking System) Module

## Overview
A complete ATS solution for recruiters and hiring teams to manage job postings, candidates, and the hiring pipeline.

## Module Structure
All ATS pages are in `src/pages/ats/`

## Features

### 1. Organization Management
- Create and configure organizations
- Invite team members
- Role-based access (owner, admin, recruiter, hiring_manager)
- Organization settings and branding

### 2. Job Posting
- Create and edit job postings
- Rich text job descriptions
- Requirements and responsibilities
- Salary range configuration
- Department assignment
- Experience level and job type
- Publish/unpublish jobs

### 3. Candidate Pipeline
- Visual Kanban-style pipeline
- Customizable stages per job
- Drag-and-drop candidate movement
- Stage-specific actions

### 4. Application Management
- View all applications
- Filter by status, stage, rating
- Candidate profile view
- Resume attachment
- AI-generated match scores
- Tags and notes

### 5. Interview Scheduling
- Schedule interviews
- Multiple interview types
- Interviewer assignment
- Calendar integration (planned)
- Feedback collection

### 6. Talent Pools
- Create talent pools
- Add candidates for future positions
- Tag and categorize

### 7. Job Offers
- Generate offer letters
- Track offer status
- Salary and benefits configuration

## Pages

### ATSLanding (`/ats`)
Marketing page for ATS product. Features and pricing for recruiters.

### ATSLogin (`/ats/login`)
Dedicated login for ATS users.

### ATSSignup (`/ats/signup`)
ATS-specific registration flow.

### ATSOnboarding (`/ats/onboarding`)
Organization setup wizard:
1. Company name and details
2. Industry and size
3. Initial team invites

### ATSDashboard (`/ats/dashboard`)
Main dashboard with:
- Active jobs summary
- Recent applications
- Pipeline overview
- Quick actions
- Activity feed

### ATSJobs (`/ats/jobs`)
Job listings management:
- All jobs list
- Filter by status
- Quick actions

### ATSJobCreate (`/ats/jobs/new`)
Create new job posting:
- Job details form
- Requirements editor
- Pipeline stage setup
- Team assignment

### ATSJobDetail (`/ats/jobs/:jobId`)
Single job view with:
- Job details
- Pipeline stages
- Candidates per stage
- Drag-drop pipeline

### ATSApplicationDetail (`/ats/applications/:applicationId`)
Candidate application view:
- Candidate info
- Resume preview
- Application history
- Interview schedule
- Reviews and feedback
- Actions (move stage, reject, etc.)

### ATSSettings (`/ats/settings`)
Organization settings:
- Company profile
- Team management
- Billing (planned)
- Integrations (planned)

### ATSPublicJobs (`/ats/jobs/browse`)
Public job board for candidates to browse open positions.

### ATSApply (`/ats/apply/:jobId`)
Public application form for candidates.

## Data Models

### Organization
```typescript
{
  id: string;
  name: string;
  slug: string; // unique URL slug
  description?: string;
  logo_url?: string;
  website_url?: string;
  industry?: string;
  company_size?: string;
  settings?: object;
}
```

### Job
```typescript
{
  id: string;
  organization_id: string;
  title: string;
  description: string;
  requirements?: string;
  responsibilities?: string;
  location?: string;
  job_type?: string; // 'full-time', 'part-time', etc.
  experience_level?: string;
  salary_min?: number;
  salary_max?: number;
  status: 'draft' | 'published' | 'closed';
  hiring_managers: string[];
  recruiters: string[];
}
```

### Pipeline Stage
```typescript
{
  id: string;
  job_id: string;
  name: string;
  stage_order: number;
  color?: string;
  is_default?: boolean;
}
```

### Application
```typescript
{
  id: string;
  job_id: string;
  current_stage_id?: string;
  candidate_name: string;
  candidate_email: string;
  candidate_phone?: string;
  resume_url?: string;
  cover_letter?: string;
  status: string;
  rating?: number;
  ai_match_score?: number;
  tags: string[];
}
```

## Hooks

### useAdminOrganizations
```typescript
const { organizations, loading } = useAdminOrganizations();
```

### useAdminATSStats
```typescript
const { stats, loading } = useAdminATSStats();
// Returns: totalJobs, activeJobs, totalApplications, etc.
```

## Access Control

### Organization Roles
| Role | Permissions |
|------|-------------|
| owner | Full access, can delete org |
| admin | Manage jobs, team, settings |
| recruiter | Manage applications, schedule interviews |
| hiring_manager | View pipeline, review candidates |

### RLS Policies
- Users can only access their organization's data
- Public can view published jobs
- Applications visible to org members only
