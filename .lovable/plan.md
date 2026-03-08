
# Project Completion Plan — Admin Dashboard & ATS Module

## Executive Summary

This plan tracks the full production-readiness of both the **Admin Dashboard** and the **ATS (Applicant Tracking System)** module. Items are marked ✅ (done), 🔧 (in progress), or ⬜ (todo).

---

## Current State Summary

### Admin Dashboard
| Component | Status | Notes |
|-----------|--------|-------|
| UserManagement | ✅ | Role changes, premium toggle, deletion via edge functions |
| ATSManagement | ✅ | Organization CRUD, stats, filtering |
| AIManagement | ✅ | API key management, primary/fallback, usage stats |
| EnhancedSystemStats | ✅ | Real-time stats from database |
| AdminAnalytics | ✅ | Platform-wide metrics: users, premium conversion, org growth |
| AuditLogs | ✅ | Searchable activity feed from ats_activities table |
| SecuritySettings | ⬜ | Local state only — not persisted to database |
| ContentManagement | ⬜ | Uses setTimeout mock — no DB persistence |
| ImprovementPlans | ⬜ | 100% hardcoded static data |
| TemplateManagement | 🔧 | resume_templates table exists; hook may still be in-memory |
| UserRegistrations | 🔧 | User list works; Add User uses edge function |
| QuickActions | ⬜ | Limited actions available |
| WebsiteCustomization | ⬜ | Saves settings but not applied site-wide |

### ATS Module
| Feature | Status | Notes |
|---------|--------|-------|
| Organization onboarding | ✅ | Multi-step wizard, creates org + membership |
| Job create/edit/publish | ✅ | Full form, status management, DB persistence |
| Job listing & filtering | ✅ | Real applicant counts from DB |
| Dashboard with live stats | ✅ | Active jobs, applications, interviews from DB |
| Application detail & lifecycle | ✅ | Status transitions, reviews, interview scheduling |
| Team management & invites | ✅ | Add members by email, role assignment |
| Public job board | ✅ | ATSPublicJobs browsing published jobs |
| Public application form | ✅ | ATSApply submits to job_applications |
| Kanban pipeline (drag-drop) | ⬜ | ATSJobDetail shows stages but no DnD |
| Interview calendar view | ⬜ | Interviews are scheduled but no calendar UI |
| Email notifications | ⬜ | No notifications for status changes |
| Talent pool management UI | ⬜ | Tables exist but no UI built |
| Job offers management UI | ⬜ | Tables exist but no UI built |

---

## Phase 1: Critical Fixes (Priority: HIGH)

### 1.1 ⬜ Persist Security Settings
- Store in `site_settings` table with key `security_settings`
- Load on mount, save on button click
- **Files**: `src/components/admin/SecuritySettings.tsx`

### 1.2 ⬜ Persist Content Management
- Replace `setTimeout` mock with `site_settings` upserts
- Load saved content on mount
- **Files**: `src/components/admin/ContentManagement.tsx`

### 1.3 🔧 Template Management DB Integration
- Verify `useTemplates` hook reads/writes to `resume_templates` table
- **Files**: `src/hooks/useTemplates.ts`

---

## Phase 2: ATS Feature Completion (Priority: HIGH)

### 2.1 ⬜ Kanban Pipeline with Drag-and-Drop
- Add `react-beautiful-dnd` (already installed) to ATSJobDetail
- Columns = pipeline_stages, cards = applications
- Drag card between columns → update `current_stage_id`
- Visual feedback with stage colors
- **Files**: `src/pages/ats/ATSJobDetail.tsx`

### 2.2 ⬜ Interview Calendar View
- Add calendar/timeline view for scheduled interviews
- Filter by date range, interviewer, status
- Quick reschedule capability
- **Files**: New `src/components/ats/InterviewCalendar.tsx`, update `ATSDashboard.tsx`

### 2.3 ⬜ Talent Pool Management UI
- CRUD for talent pools (tables already exist)
- Add candidates from applications or manually
- Tag-based organization, search/filter
- **Files**: New `src/pages/ats/ATSTalentPools.tsx`

### 2.4 ⬜ Job Offers Management UI
- Create/send offers from application detail
- Track offer status (draft → sent → accepted/rejected)
- Salary, benefits, start date configuration
- **Files**: New `src/components/ats/JobOfferForm.tsx`, update `ATSApplicationDetail.tsx`

### 2.5 ⬜ Email Notifications (Edge Function)
- Notify candidates on status changes
- Notify interviewers on schedule
- Notify team on new applications
- **Files**: New `supabase/functions/send-notification/index.ts`

---

## Phase 3: Admin Enhancements (Priority: MEDIUM)

### 3.1 ⬜ Real Audit Logs for Admin Actions
- Current AuditLogs reads `ats_activities` — extend to track admin actions too
- Create `audit_logs` table for admin-specific events (role changes, settings, user mgmt)
- Log from UserManagement, SecuritySettings, ContentManagement
- **Migration**: New `audit_logs` table
- **Files**: `src/components/admin/AuditLogs.tsx`, admin components

### 3.2 ⬜ Website Customization → Apply Site-Wide
- Create `useSiteSettings` hook to fetch and apply branding
- Update Header, Footer, Index to use dynamic settings
- Apply colors via CSS variables
- **Files**: New `src/hooks/useSiteSettings.ts`, `src/components/Header.tsx`, `src/components/Footer.tsx`

### 3.3 ⬜ Enhanced Quick Actions
- Add: Bulk operations, export data, clear cache, send announcements
- **Files**: `src/components/admin/QuickActions.tsx`

### 3.4 ⬜ User Management Pagination & Search
- Server-side pagination for large user lists
- Debounced search
- **Files**: `src/components/admin/UserRegistrations.tsx`, `src/components/admin/UserManagement.tsx`

### 3.5 ⬜ Dynamic Improvement Plans
- Store roadmap items in `site_settings` or dedicated table
- Admin CRUD for roadmap items with status tracking
- **Files**: `src/components/admin/ImprovementPlans.tsx`

---

## Phase 4: Production Hardening (Priority: HIGH before launch)

### 4.1 ⬜ Rate Limiting Enforcement
- Implement in Edge Functions using `rateLimiter.ts`
- Check limits from `site_settings` security config
- Return 429 when exceeded

### 4.2 ⬜ Confirmation Dialogs for Destructive Actions
- Type-to-confirm for org deletion, user deletion
- Confirmation for bulk operations
- **Files**: Various admin & ATS components

### 4.3 ⬜ Real-Time Activity Monitoring
- Supabase Realtime subscriptions for live dashboard updates
- Alert thresholds for anomalies (spike in failed logins, etc.)

### 4.4 ⬜ Proper Error Boundaries
- Wrap each admin tab in error boundary
- Graceful fallback UI for failed data loads

---

## Edge Functions Required

| Function | Status | Purpose |
|----------|--------|---------|
| `admin-create-user` | ✅ | Create users with service role |
| `admin-list-users` | ✅ | Fetch user emails/metadata from auth.users |
| `create-razorpay-order` | ✅ | Payment processing |
| `verify-razorpay-payment` | ✅ | Payment verification |
| `gemini-suggest` | ✅ | AI resume suggestions |
| `extract-resume-data` | ✅ | PDF parsing |
| `send-notification` | ⬜ | Email notifications for ATS events |
| `admin-resend-verification` | ⬜ | Trigger verification email resend |

---

## Database Changes Required

### New Tables Needed
- `audit_logs` — Admin action tracking (role changes, settings, user mgmt)

### Existing Tables (no changes needed)
- `resume_templates` ✅ — Already exists
- `talent_pools` ✅ — Already exists  
- `talent_pool_candidates` ✅ — Already exists
- `job_offers` ✅ — Already exists
- `interviews` ✅ — Already exists
- `ats_activities` ✅ — Already exists

---

## Implementation Priority Order

```
1. Kanban drag-drop pipeline          [High - Core ATS differentiator]
2. Security Settings persistence      [High - Security config must persist]
3. Content Management persistence     [High - CMS must work]
4. Talent Pool UI                     [Medium - Tables ready, needs UI]
5. Job Offers UI                      [Medium - Tables ready, needs UI]
6. Interview Calendar                 [Medium - Better scheduling UX]
7. Admin Audit Logs table             [Medium - Compliance]
8. Site-wide customization apply      [Medium - Branding]
9. Email notifications                [Medium - User engagement]
10. Pagination/Search                 [Low - Performance at scale]
11. Dynamic Improvement Plans         [Low - Nice-to-have]
12. Rate Limiting enforcement         [Pre-launch - Security]
13. Error boundaries                  [Pre-launch - Reliability]
```

---

## Estimated Remaining Effort

| Phase | Items | Effort |
|-------|-------|--------|
| Phase 1: Critical Fixes | 3 items | ~4-6 hours |
| Phase 2: ATS Completion | 5 items | ~15-20 hours |
| Phase 3: Admin Enhancements | 5 items | ~10-15 hours |
| Phase 4: Production Hardening | 4 items | ~8-12 hours |
| **Total Remaining** | **17 items** | **~37-53 hours** |
