# FlowCreate — Refined Implementation Plan
## Review of IMPLEMENTATION_PLAN.md + Built Deliverables

> **Date**: 2026-07-15
> **Method**: The original plan was validated against the *actual frontend code*
> (every `.from()`, `.rpc()`, `.invoke()` call audited), the 8 deployed edge
> functions, and the 20 legacy migration files.
> **Deliverables built** (this repo, no existing source modified):
> - `supabase/setup/20260715000000_complete_schema.sql` — complete consolidated migration (31 tables, 18 functions, 27 triggers, full RLS, storage, realtime, seeds, cron)
> - `supabase/functions/create-stripe-checkout/` — Stripe Checkout session creator
> - `supabase/functions/stripe-webhook/` — full Stripe subscription lifecycle
> - `supabase/functions/razorpay-webhook/` — Razorpay webhook (closes the replay hole)
> - `supabase/functions/send-notification/` — in-app + email (Resend) dispatcher
> - `.env.example` — frontend env template + edge-secret inventory
> - `SETUP_CHECKLIST.md` — end-to-end setup runbook

---

## 1. Critical corrections to the original plan

These are cases where running the plan's SQL as written would have **broken the
live application**. All are fixed in the consolidated migration.

### 1.1 CHECK constraints contradicted the frontend's status vocabularies
The plan copied constraint values that don't match what the React code writes:

| Table.column | Plan's CHECK | What the code actually writes | Fix applied |
|---|---|---|---|
| `job_applications.status` | `new, reviewing, interview, offer, hired, rejected, withdrawn` | `new, reviewing, shortlisted, interviewing, offered, hired, rejected` | CHECK now: `new, reviewing, shortlisted, interviewing, offered, hired, rejected, withdrawn` |
| `application_reviews.recommendation` | `strong_yes, yes, maybe, no, strong_no` | `hire, neutral, reject` | CHECK now: `hire, neutral, reject` |
| `job_offers.status` | `…, rejected, …` (no `declined`) | `declined` | Both kept |
| `interviews.interview_type` | `onsite` (no `in-person`) | `in-person` | Both kept |
| `organization_members.role` | 6 roles, no `member` | `admin-add-org-member` edge fn defaults to `'member'` | `member` added |

With the plan's constraints, **every review submission, every "shortlist" move,
and every declined offer would have failed** with a CHECK violation.

### 1.2 The `handle_new_user` trigger was missing entirely
Neither the plan nor the legacy migrations create anything on signup, but the
app expects a `profiles` row keyed by `user_id`. Added: `handle_new_user()`
trigger on `auth.users` that provisions `profiles`, `notification_preferences`,
and `usage_limits`. It deliberately does **not** create a `subscriptions` row —
the `admin-create-user` edge function does a plain `INSERT` into
`subscriptions` and would hit a unique-key conflict (and `usePremiumStatus`
treats a missing row as free tier anyway).

### 1.3 Wrong seed shape for design mode
Plan seeded `design_mode = {"enabled": false}`. `useDesignMode` reads
`setting_value.mode` (`'default' | 'neo-brutalism'`). Fixed to `{"mode": "default"}` —
with the plan's seed, the design-mode feature would silently never work.

### 1.4 Wrong template seed set
The plan invented 20 template rows (`bold`, `healthcare`, `startup`…). The
migration uses the 20 `template_key`s **production actually had**
(`modern`, `classic`, `professional`, `technical`, `developer`, `data-scientist`,
`creative`, `elegant`, `medical`, `academic`, `executive`, `ats-pro`, `compact`,
`minimalist` + the six `ats-*` keys). All 7 keys the builder renders are covered.

### 1.5 The legacy migrations cannot rebuild the database
Important context the plan glossed over: the 20 files in `supabase/migrations/`
are **not self-contained** — `resumes`, `user_roles` (and the `app_role` enum),
`subscriptions`, `analytics_events`, and `usage_limits` are referenced/altered
but never created (they only existed in the old Lovable project's base schema).
Two files also create `ai_api_keys`/`ai_token_usage` twice and use functions
before defining them. **Do not replay them** — archive them and use the
consolidated file (checklist Phase 2, Option B).

### 1.6 `calculate_profile_completeness` could never exceed ~46%
The deployed version divided 7 checks by a hardcoded total of 15, and nothing
ever called it. Fixed to 12/12 and wired to a `BEFORE INSERT OR UPDATE` trigger
on `profiles`, so `profile_completeness` is now actually maintained.

---

## 2. Security review findings & fixes

### Fixed in the new migration / functions

1. **Payment replay hole (medium-high).** `verify-razorpay-payment` re-extends
   `current_period_end` on every valid call with no "already processed" check —
   replaying a captured payment re-extends the subscription. The new
   `razorpay-webhook` applies a payment **only if no `payments` row exists for
   that `razorpay_payment_id`**, and the `webhook_events` table gives all
   webhook processing exactly-once semantics (unique `(provider, event_id)`;
   failed events re-process, processed ones return 200 no-ops). When you're
   ready to touch existing code, port the same guard into
   `verify-razorpay-payment` (5-line change, noted in §7 backlog).

2. **Anonymous analytics spam (medium).** Legacy policy let `anon` insert
   arbitrary rows into `analytics_events`. Tightened to authenticated users
   only, and `user_id` must be NULL or the caller's own. (The frontend
   currently doesn't insert events at all — nothing breaks.)

3. **Orphaned rows on user deletion (medium).** `admin-delete-user` manually
   deletes 6 tables and misses the rest. All user-owned tables now have real
   FKs to `auth.users` with `ON DELETE CASCADE`; financial records
   (`payments`, `invoices`) use `SET NULL` so accounting history survives
   account deletion. The edge function's manual deletes become harmless
   redundancy.

4. **`user_roles` had no uniqueness.** Duplicate role rows made
   `get_user_role()` (bare `LIMIT 1`, no ordering) nondeterministic. Added
   `UNIQUE(user_id, role)` and deterministic ordering (admin > moderator > user).

5. **Org onboarding bootstrap gap.** With the documented policies, a brand-new
   org has no members, so **nobody** could insert the first `owner` row
   (member-management requires being an org admin). Added a bootstrap policy:
   a user may insert themselves as `owner` only when the org has no members
   yet (via a `SECURITY DEFINER` helper to avoid RLS self-recursion).

6. **Audit trail.** New `audit_logs` table + generic `fn_audit()` trigger on
   the sensitive tables (`user_roles`, `subscriptions`,
   `organization_subscriptions`). Append-only for clients; admin-read-only.

7. **RLS hygiene throughout**: explicit `TO authenticated`/`TO anon` role
   targets on every policy (legacy had none, so policies were evaluated for
   anon too), `(SELECT auth.uid())` initplan pattern for per-statement rather
   than per-row evaluation, and `WITH CHECK` added on admin `FOR ALL` policies.

### Known issues that remain (require touching existing code — deferred by request)

| Issue | Where | Suggested fix (later) |
|---|---|---|
| UI shows ₹199/₹1,999/₹2,500 but server charges ₹299/₹2,499/₹4,999 | `Pricing.tsx` vs `create-razorpay-order` | Align both to the DB `subscription_plans` rows; ideally have the pricing page read plans from the DB |
| In-memory rate limiting (per-instance, resets on cold start) | `_shared/rateLimiter.ts` | Upstash Redis or a Postgres-based counter |
| No rate limit at all | `admin-delete-user`, `admin-add-org-member` | Add `checkRateLimit` calls |
| AI keys plaintext in `ai_api_keys.key` | admin AI key manager | Supabase Vault or pgsodium column encryption |
| Gemini key passed as URL query param (log-leak risk) | `gemini-suggest`, `extract-resume-data` | Send via `x-goog-api-key` header |
| Non-constant-time HMAC compare | `verify-razorpay-payment` | Use the `timingSafeEqual` helper from `razorpay-webhook` |
| `btoa(String.fromCharCode(...bytes))` can blow the stack on large PDFs | `extract-resume-data` | Chunked base64 encoding |
| `admin-add-org-member` acts on `memberId` without org scoping; leaks `error.message` | same | Scope by `organizationId`, genericize errors |
| Discoverable profiles expose full PII (education, work history, links) to *any* org member | `profiles` RLS | Acceptable short-term (opt-in via `is_discoverable=false` default); longer-term serve discovery through the column-limited view only |
| Wildcard CORS on all functions | all edge functions | Restrict `Access-Control-Allow-Origin` to your domain at launch |
| Avatars stored as base64 inside profile/resume JSONB (bloats rows) | `AvatarUploader.tsx` | Move to the new `avatars` storage bucket |

---

## 3. SaaS architecture improvements (implemented)

1. **Plan catalog as source of truth — `subscription_plans`.** Slugs match the
   `planType` strings the payment flow already sends (`monthly`/`yearly`/
   `lifetime`), with a `product` axis (`resume` | `ats`), prices in minor
   units, and `limits`/`features` JSONB for gating. `create-stripe-checkout`
   already reads prices from this table; the Razorpay functions should be
   migrated to it next.

2. **Org-level billing separated from user-level billing.** The existing
   `subscriptions` table is per-user (Resume Builder). ATS plans are
   per-organization, so a new `organization_subscriptions` table (one row per
   org, seats, trial support) carries ATS billing instead of overloading the
   user table. This is the standard B2B/B2C split for a dual-product SaaS.

3. **Entitlements API.** `get_user_entitlements(uuid)` and
   `get_org_entitlements(uuid)` return `{plan, status, limits, features}` in
   one call — frontend and edge functions can gate on DB-defined limits
   instead of the hardcoded "1 resume" constant. Free-tier defaults apply when
   no subscription row exists.

4. **Idempotent webhooks — `webhook_events`.** Unique `(provider, event_id)`,
   status machine `received → processed | failed`, failed events re-processable
   on provider retry. Both webhook functions use it.

5. **Subscription expiry actually enforced.** The frontend only reads
   `is_premium`, and nothing ever set it back to false. `expire_subscriptions()`
   runs hourly via pg_cron with a 3-day grace period after `current_period_end`
   (webhook-driven `past_due` → expiry), also expiring org trials and stale
   `sent` job offers.

6. **Notifications infrastructure.** `notifications` (+ Realtime publication →
   live bell UI later) and `notification_preferences` (auto-provisioned per
   user, respected by `send-notification`, which does in-app + optional Resend
   email).

7. **Storage done properly.** Four buckets with MIME/size limits and
   path-scoped RLS (`{user_id}/…` for avatars/resumes, `{org_id}/…` for
   logos/offer letters). Note the frontend doesn't use storage yet (avatars
   are base64 in JSONB) — the buckets are ready for that migration.

8. **Feature flags** with `plan_requirements` tied to plan slugs, plus
   `rollout_percentage` for gradual rollouts.

### Considered and deliberately NOT done
- **Soft deletes (`deleted_at`)** — would silently change behavior under the
  current UI (hard `DELETE` calls, no filtering). Revisit when the frontend
  can be modified; the audit log covers the "who deleted what" need meanwhile.
- **Replacing per-user `subscriptions.is_premium`** with a normalized model —
  the boolean IS the paywall contract for the whole app; changing it breaks
  `usePremiumStatus`. The richer columns coexist alongside it instead.
- **A `tenants` super-table** — organizations already are the tenant boundary;
  RLS via `is_org_member`/`has_org_role` is the right Supabase pattern.
  `has_org_role` was upgraded to a proper role hierarchy (owner ≥ admin ≥
  hiring_manager ≥ recruiter ≥ interviewer ≥ viewer/member) instead of the
  legacy "owner OR exact match".

---

## 4. Missing pieces the plan didn't have (now included)

- **Tables (8 new)**: `subscription_plans`, `organization_subscriptions`,
  `invoices`, `notifications`, `notification_preferences`, `feature_flags`,
  `audit_logs`, `webhook_events` (the plan proposed 6; `organization_subscriptions`
  and `webhook_events` were missing).
- **Functions the plan omitted**: `handle_new_user`, `org_has_members`,
  `set_profile_completeness`, `expire_subscriptions`, `get_user_entitlements`,
  `get_org_entitlements`, `fn_audit`, `generate_invoice_number`.
- **~20 missing indexes**: every FK now has one (`resumes.user_id`,
  `payments.user_id/subscription_id`, `interviews.application_id`,
  `job_offers.application_id`, `application_reviews.application_id`,
  `departments.organization_id`, `talent_pool_candidates.*`, …), plus
  composite `jobs(organization_id, status)`, partial indexes for unread
  notifications and discoverable profiles.
- **Data-integrity constraints**: `UNIQUE(job_id, candidate_email)` on
  applications (blocks duplicate/spam applications), `UNIQUE(talent_pool_id,
  candidate_email)`, `UNIQUE(provider)` on `ai_token_usage` (enables upserts),
  salary range check on jobs, DEFERRABLE unique on `pipeline_stages(job_id,
  stage_order)` so stage reordering can swap orders in one transaction,
  `NOT NULL` on all `updated_at`/JSONB defaults.
- **Missing policies**: public SELECT on organizations with open jobs (so the
  public job board can show company names), org-admin DELETE on applications,
  reviewer-own UPDATE on reviews, INSERT policy on `usage_limits` (the plan
  had SELECT/UPDATE but no INSERT — users could never get a row).
- **Realtime publication** (`site_settings` — required by `useDesignMode` —
  plus `notifications`) and **storage buckets**: mentioned by the plan but with
  no SQL; both are concrete in the migration now.

---

## 5. Pricing review

### The bug first
Three price lists currently disagree:
- UI (`Pricing.tsx`): ₹199 / ₹1,999 / ₹2,500
- Server (`create-razorpay-order` + `verify-razorpay-payment`): **₹299 / ₹2,499 / ₹4,999** ← what users are charged
- Original plan document: ₹399 / ₹2,999 / ₹3,999

The migration seeds `subscription_plans` to match the **server** (what's
actually billed). Fix the UI before launch — displaying one price and charging
another is a legal/compliance problem, not just a bug.

### Resume Builder — the split is right, the USD numbers were too low
Free/Pro/Lifetime is the correct model for this market (high churn, short
usage windows — people stop paying once hired; competitors like Rezi
successfully sell lifetime for exactly this reason).

| Plan | Recommended INR | Recommended USD | Rationale |
|---|---|---|---|
| Free | ₹0 — 1 resume, no AI | $0 | Acquisition + template SEO |
| Pro Monthly | **₹299** (keep server price) | **$4.99–7.99** | Zety/Resume.io charge $20+/mo; even $7.99 undercuts heavily. Plan's $4.99 is fine for launch |
| Pro Yearly | **₹2,499** (~30% off) | **$39.99** | Anchor discount vs monthly |
| Lifetime | **₹4,999** | **$79.99** | Plan's $49.99 was only ~10× monthly — too cheap. Keep lifetime ≥16× monthly so it doesn't cannibalize subscriptions. Cap or retire it once MRR matters |

### ATS — competitive but restructure the tiers
Flat per-org pricing at ₹1,499–3,999 ($19–49) is aggressive vs BreezyHR
($157+/mo), Workable ($189+/mo), Zoho Recruit (~$30/user/mo) — good as a
wedge. Two changes:

1. **Add a free ATS tier** (1 active job, 3 members). ATS buyers won't pay
   before trying, and an empty ATS marketplace kills the resume-side
   `is_discoverable` flywheel. Seeded as `ats-free`, and orgs without a
   subscription row default to it via `get_org_entitlements`.
2. **Make Starter meaningfully bigger than Free** — plan's "2 active jobs" was
   too close to free. Seeded: Starter ₹1,999/$25 (5 jobs, 5 members),
   Growth ₹4,999/$59 (20 jobs, 15 members, AI scoring, talent pools),
   Enterprise custom (`is_public=false`).

AI scoring/talent pools as Growth-only differentiators is the right gate — AI
costs you money per use; don't give it away at ₹1,999.

---

## 6. Revised execution order

The plan's 4-week sequence was right in spirit; two reorderings matter:

**Day 1 — Rebuild (unchanged, now one SQL file)**
Run `SETUP_CHECKLIST.md` Phases 1–4: project, schema, auth, frontend wiring.

**Day 2–3 — Payments hardening BEFORE new features** *(moved up from Week 2)*
Deploy existing functions + `razorpay-webhook` (the replay hole is open on
day one otherwise), register the Razorpay webhook, fix the pricing display
mismatch. Payments are already live in the product; hardening them precedes
any new surface area.

**Week 1 — Notifications + gating** *(as planned)*
`send-notification` wiring into ATS flows (new application, interview
scheduled, offer updates), entitlements-based feature gating replacing the
hardcoded free-limit, admin plan management UI.

**Week 2 — Stripe** *(only if going global now — see Decision 2/5)*
`create-stripe-checkout` + `stripe-webhook` are ready; the work is frontend
(gateway selection by geo, checkout redirect) and Stripe dashboard setup.

**Week 3 — Auth & onboarding** *(as planned — note Google OAuth config is
Day-1 since Login/Register already ship the button)*
LinkedIn OAuth, onboarding tour, profile prompts, transactional email templates.

**Week 4 — Production hardening** *(as planned)*
Sentry, distributed rate limiting, GDPR export/delete, CI/CD (lint → build →
`supabase db push` → deploy), E2E tests for signup→build→save→pay.

---

## 7. Backlog of small code fixes (for when source edits are allowed)

Each is ≤ 30 minutes, listed by priority:
1. `Pricing.tsx`: align displayed prices with `subscription_plans` (or fetch from DB).
2. `verify-razorpay-payment`: add the payments-row replay guard (mirror `razorpay-webhook`).
3. `client.ts` + `utils/ai/gemini.ts`: env-based URLs (required for the new project anyway — see checklist Phase 4).
4. `useResumeSave.ts`: read the limit from `get_user_entitlements` instead of the hardcoded `1` / "₹199/month" upsell copy.
5. Add rate limiting to `admin-delete-user` / `admin-add-org-member`.
6. Send Gemini key via header, not query string; chunked base64 in `extract-resume-data`.
7. Wire a notification bell to `notifications` + Realtime.

---

## 8. Answers to the open questions

**Decision 1 — Supabase org & region:**
Use your existing Supabase organization (one org, separate projects for
staging/prod when needed). Region **ap-south-1 (Mumbai)** — your payment rail
(Razorpay), pricing (INR-first), and geo-detection all say the initial user
base is India; latency to Mumbai matters more than to us-east. Stripe/global
users are served fine from Mumbai (~200ms is acceptable for a CRUD app).

**Decision 2 — Stripe now or Razorpay-only first?**
**Ship Razorpay-only first, add Stripe in week 2–3.** Rationale: Razorpay is
already built and tested end-to-end; Stripe blocks launch on business
verification and new frontend work. The Stripe checkout + webhook functions
are already written in this repo, so "adding Stripe" later is dashboard config
plus a frontend gateway switch — days, not weeks. Don't hold the rebuild
hostage to it.

**Decision 3 — Hosting:**
**Vercel** for the frontend. The repo's Docker/Nginx path adds ops burden with
zero benefit at this stage; Vercel gives preview deployments (pairs with the
Week-4 CI/CD), edge CDN, and free-tier headroom. Keep the Dockerfile for
optional self-hosting. Domain: buy the `.com`, put marketing + app on the same
domain initially (`/` marketing, `/resume-builder` app) — you already route
this way.

**Decision 4 — API keys:**
Only you can answer inventory, but the setup is sequenced so nothing blocks:
Gemini key is free from AI Studio (needed for AI features only), Razorpay
test keys need no KYC (live keys do — start that now, it takes days), Stripe
can wait per Decision 2. The checklist marks exactly where each key is needed.

**Decision 5 — Target market:**
**India-first, global-ready.** Everything in the stack agrees (Razorpay, INR
pricing, geo-detection, Mumbai region). Keep USD display for non-IN visitors
via the existing ipapi.co check, and treat Stripe as the "global switch" you
flip after Indian launch validates conversion. Don't split focus on day one.

**Decision 6 — ATS pricing:**
**Free beta with plan scaffolding live** — the seeded `ats-free` tier IS the
beta (1 job, 3 members), and paid tiers exist in `subscription_plans` from day
one (`is_active=true`). This gets you: real usage data before price-testing,
the candidate-discovery flywheel the resume side needs, and zero migration
pain when you start charging (orgs are already on plan rows; you just enforce
limits via `get_org_entitlements` and open checkout). Announce beta pricing
("free during beta, Starter will be ₹1,999/mo") so paying later isn't a
surprise.

---

## 9. Final object inventory (what the migration creates)

| Category | Count | Names |
|---|---|---|
| Tables | 31 | 23 rebuilt + `subscription_plans`, `organization_subscriptions`, `invoices`, `notifications`, `notification_preferences`, `feature_flags`, `audit_logs`, `webhook_events` |
| Views | 1 | `discoverable_candidates` (security_invoker) |
| Enums | 1 | `app_role` |
| Functions | 18 | role checks ×4, org checks ×3, `handle_new_user`, `sync_resume_to_profile`, completeness ×2, entitlements ×2, `expire_subscriptions`, `fn_audit`, `update_updated_at_column`, `generate_invoice_number`, (+`is_super_admin` alias) |
| Triggers | 27 | 19 updated_at, signup provisioning, resume sync, completeness, 3 audit, (+`on_auth_user_created`) |
| RLS policies | ~90 | every table covered; `webhook_events`/`audit_logs` service-role-write-only |
| Storage buckets | 4 | `avatars`, `org-logos` (public), `resumes`, `offer-letters` (private) |
| Realtime | 2 | `site_settings`, `notifications` |
| Cron jobs | 1 | `expire-subscriptions-hourly` |
| Seeds | — | 20 templates, design_mode, 8 plans, 5 feature flags |
