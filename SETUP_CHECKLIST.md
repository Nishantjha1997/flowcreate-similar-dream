# FlowCreate — New Supabase Project Setup Checklist

Step-by-step rebuild onto a fresh Supabase project. Everything referenced here
already exists in this repo:

| Artifact | Path |
|---|---|
| Consolidated migration | `supabase/setup/20260715000000_complete_schema.sql` |
| Blog automation migration | `supabase/migrations/20260730000000_blog_automation.sql` |
| Blog cron installer | `supabase/setup/blog_automation_cron.sql` |
| New edge functions | `supabase/functions/{create-stripe-checkout, stripe-webhook, razorpay-webhook, send-notification, blog-scheduler}` |
| Env template | `.env.example` |
| Plan review & decisions | `REFINED_PLAN.md` |

---

## Phase 0 — Prerequisites (10 min)

- [ ] Supabase account + organization chosen (see REFINED_PLAN.md, Decision 1)
- [ ] Supabase CLI installed and logged in: `supabase --version`, `supabase login`
- [ ] Razorpay account with **test keys** (key id, key secret)
- [ ] Google Gemini API key (aistudio.google.com)
- [ ] Optional now / needed for global launch: Stripe account (test keys), Resend account

## Phase 1 — Create the project (5 min)

- [ ] Dashboard → New project. Region: **ap-south-1 (Mumbai)** for an India-first launch
- [ ] Record: Project URL, `anon` key, `service_role` key, project ref (the subdomain)
- [ ] Database password stored in your password manager

## Phase 2 — Apply the schema (10 min)

Option A — SQL Editor (simplest):
- [ ] Open Dashboard → SQL Editor → paste the full contents of
      `supabase/setup/20260715000000_complete_schema.sql` → Run
- [ ] Confirm it finishes without errors (a NOTICE about pg_cron is OK — see below)

Option B — CLI migration flow (better long-term):
- [ ] Archive the legacy incomplete migrations:
      `mkdir supabase/migrations_archive && mv supabase/migrations/*.sql supabase/migrations_archive/`
      (they are NOT runnable on a fresh project — they reference tables that
      were only in the old project's base schema)
- [ ] Copy the consolidated file in as the sole migration:
      `cp supabase/setup/20260715000000_complete_schema.sql supabase/migrations/`
- [ ] `supabase link --project-ref <project-ref>` then `supabase db push`

Post-checks:
- [ ] Table Editor shows 31 tables (23 rebuilt + 8 new SaaS tables)
- [ ] `select public.is_admin();` runs (returns false — you have no session)
- [ ] If the pg_cron NOTICE appeared: Dashboard → Database → Extensions → enable
      `pg_cron`, then re-run just §13 of the SQL file

## Phase 3 — Auth configuration (10 min)

- [ ] Authentication → Providers → Email: enabled (confirm email ON for production)
- [ ] Authentication → Providers → Google: enable, add OAuth client id/secret
      (the app's Login/Register pages already call `signInWithOAuth({provider:'google'})`)
- [ ] Authentication → URL Configuration:
      - Site URL: your domain (or `http://localhost:8080` for dev)
      - Redirect URLs: add `http://localhost:8080/**` and your production domain
        (the app redirects to `/resume-builder` after OAuth and `/reset-password` for recovery)
- [ ] Customize email templates (confirmation, reset) — optional but recommended

## Phase 4 — Frontend wiring (10 min)

- [ ] `cp .env.example .env` and fill in the new project values
- [ ] Confirm `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` point to
      the new project. The browser client and AI calls already read these values.
- [ ] Regenerate DB types:
      `supabase gen types typescript --project-id <project-ref> > src/integrations/supabase/types.ts`
- [ ] `npm install && npm run dev` — app loads, signup works, a `profiles` row
      appears automatically (handle_new_user trigger)

## Phase 5 — Edge function secrets + deploy (15 min)

- [ ] Set secrets (CLI shown; Dashboard → Edge Functions → Secrets also works):
      ```
      supabase secrets set RAZORPAY_KEY_ID=rzp_test_xxx
      supabase secrets set RAZORPAY_KEY_SECRET=xxx
      supabase secrets set GEMINI_API_KEY=xxx
      supabase secrets set BLOG_SCHEDULER_SECRET=<random-32-plus-byte-value>
      # Optional: rebuild the generated sitemap after an auto-publish
      supabase secrets set VERCEL_DEPLOY_HOOK_URL=https://api.vercel.com/v1/integrations/deploy/...
      # when adopting Stripe / notifications:
      supabase secrets set STRIPE_SECRET_KEY=sk_test_xxx
      supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx
      supabase secrets set RAZORPAY_WEBHOOK_SECRET=xxx
      supabase secrets set RESEND_API_KEY=re_xxx
      supabase secrets set NOTIFY_FROM_EMAIL="FlowCreate <notifications@yourdomain.com>"
      supabase secrets set SITE_URL=https://yourdomain.com
      ```
- [ ] Deploy the existing 8 functions:
      ```
      supabase functions deploy gemini-suggest
      supabase functions deploy extract-resume-data
      supabase functions deploy create-razorpay-order
      supabase functions deploy verify-razorpay-payment
      supabase functions deploy admin-create-user
      supabase functions deploy admin-list-users --no-verify-jwt
      supabase functions deploy admin-delete-user --no-verify-jwt
      supabase functions deploy admin-add-org-member --no-verify-jwt
      ```
      (the three `--no-verify-jwt` functions do their own admin checks in code,
      matching the old `config.toml`)
- [ ] Deploy the new functions:
      ```
      supabase functions deploy send-notification
      supabase functions deploy create-stripe-checkout
      supabase functions deploy stripe-webhook --no-verify-jwt
      supabase functions deploy razorpay-webhook --no-verify-jwt
      supabase functions deploy blog-ai
      supabase functions deploy blog-scheduler --no-verify-jwt
      ```
      Webhooks MUST be `--no-verify-jwt` (providers can't send Supabase JWTs;
      security is the signature verification inside each function).
- [ ] Optionally add the new functions to `supabase/config.toml` so future
      deploys keep the flags:
      ```toml
      [functions.stripe-webhook]
      verify_jwt = false
      [functions.razorpay-webhook]
      verify_jwt = false
      [functions.blog-scheduler]
      verify_jwt = false
      ```

### Blog automation cron

- [ ] Apply `supabase/migrations/20260730000000_blog_automation.sql`.
- [ ] Set `BLOG_SCHEDULER_SECRET` as an Edge Function secret (shown above).
- [ ] Dashboard → Integrations → Vault: create `flowcreate_project_url` with
      your Supabase project URL and `blog_scheduler_secret` with the exact same
      random value used for `BLOG_SCHEDULER_SECRET`.
- [ ] Dashboard → Integrations → Cron → Create job:
      - Name: `flowcreate-blog-scheduler`
      - Schedule: `*/5 * * * *`
      - SQL:
        ```sql
        select net.http_post(
          url := (select decrypted_secret from vault.decrypted_secrets
                  where name = 'flowcreate_project_url') || '/functions/v1/blog-scheduler',
          headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'x-blog-scheduler-secret',
            (select decrypted_secret from vault.decrypted_secrets
             where name = 'blog_scheduler_secret')
          ),
          body := '{"action":"tick"}'::jsonb
        );
        ```
      Or run `supabase/setup/blog_automation_cron.sql` after the Vault secrets
      exist; it installs the same job without storing a secret in source code.
- [ ] In Admin → Blog Automation, create a schedule in **Draft** mode first,
      click **Run now**, and confirm a post plus a successful run are created.
- [ ] Enable auto-publish only after checking article quality and links.
- [ ] Optional SEO sync: Vercel → Project Settings → Git → Deploy Hooks → create
      `blog-sitemap`, then set its URL as `VERCEL_DEPLOY_HOOK_URL`. Each
      auto-publish will request one rebuild so the generated sitemap includes it.

## Phase 6 — Payment provider webhooks (10 min)

Razorpay (do this even before Stripe — it closes the replay hole):
- [ ] Razorpay Dashboard → Settings → Webhooks → Add:
      URL `https://<project-ref>.functions.supabase.co/razorpay-webhook`,
      secret = the `RAZORPAY_WEBHOOK_SECRET` you set, events:
      `payment.captured`, `payment.failed`

Stripe (when adopting global payments):
- [ ] Stripe Dashboard → Developers → Webhooks → Add endpoint:
      URL `https://<project-ref>.functions.supabase.co/stripe-webhook`, events:
      `checkout.session.completed`, `customer.subscription.updated`,
      `customer.subscription.deleted`, `invoice.paid`, `invoice.payment_failed`
- [ ] Copy the signing secret into `STRIPE_WEBHOOK_SECRET`

## Phase 7 — Bootstrap your admin account (5 min)

- [ ] Sign up in the app with your own email
- [ ] SQL Editor:
      ```sql
      INSERT INTO public.user_roles (user_id, role)
      SELECT id, 'admin' FROM auth.users WHERE email = 'you@example.com'
      ON CONFLICT (user_id, role) DO NOTHING;
      ```
- [ ] Reload the app → `/admin` is accessible

## Phase 8 — Verification pass

Resume builder:
- [ ] Sign up new user → `profiles`, `notification_preferences`, `usage_limits` rows exist
- [ ] Build + save a resume → row in `resumes`; second save on free tier is blocked
- [ ] PDF export downloads
- [ ] AI suggestions respond (needs `GEMINI_API_KEY`)
- [ ] Razorpay test payment (card 4111 1111 1111 1111) → `subscriptions.is_premium`
      flips true, `payments` row created, in-app notification appears
- [ ] Replay safety: re-deliver the webhook from the Razorpay dashboard →
      `webhook_events` shows duplicate, no second `payments` row

ATS:
- [ ] Create organization via `/ats/onboarding` → org + owner membership rows
      (the new bootstrap RLS policy allows the first owner insert)
- [ ] Create job with pipeline stages → publish → visible in `/ats/jobs/browse`
- [ ] Apply via public form → application appears in kanban; duplicate
      application with the same email is rejected
- [ ] Schedule interview, add review (`hire`/`neutral`/`reject`), create offer,
      mark `declined` — all statuses save without CHECK violations

Admin:
- [ ] `/admin` user list loads (admin-list-users)
- [ ] Grant/revoke premium works
- [ ] Design-mode toggle propagates live (Realtime on `site_settings`)

## Known price mismatch to resolve before launch (see REFINED_PLAN.md §5)

`src/pages/Pricing.tsx` displays ₹199 / ₹1,999 / ₹2,500 but
`create-razorpay-order` charges ₹299 / ₹2,499 / ₹4,999. The seeded
`subscription_plans` match the edge function (what users are billed). Align
the UI (or change both the seeds and `PLAN_PRICES` in the two Razorpay
functions) — displaying one price and charging another is a compliance risk.
