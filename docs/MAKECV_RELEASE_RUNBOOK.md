# MakeCV release runbook

This runbook is the implementation and verification checklist for the MakeCV
rebrand, admin repair, AI-provider setup, Razorpay subscriptions, mobile QA,
and automated blog/Search Console publishing.

## 1. Build and test locally

Use Node 20 or newer.

```bash
npm ci
npm run typecheck
npm run lint -- --quiet
npm test
npm run test:blog
npm run test:payments
npm run test:ai-boundary
npm run test:edge
npm run build
npm run seo:validate
npm run verify:live
```

`npm run build` runs the sitemap generator and static SEO prerender. The blog
smoke test is deterministic. It only runs a live scheduler tick when both
`BLOG_SCHEDULER_URL` and `BLOG_SCHEDULER_SECRET` are present.

Acceptance criteria:

- TypeScript, lint, and all tests pass.
- `test:blog` reports the sanitizer, article-quality gates, slug handling, and
  scheduler wiring checks as passed.
- `test:ai-boundary` confirms browser bundles never read or transmit provider
  secrets directly; all AI generation goes through the authenticated Edge
  Function.
- SEO validation reports no duplicate canonicals/titles and confirms the
  sitemap, RSS, robots, JSON-LD, prerendered routes, and 404 page.
- `verify:live` confirms that the additive billing/indexing columns exist in
  Supabase and that provider-secret tables reject anonymous reads. Run it after
  the Supabase release workflow succeeds.

## 2. Configure Supabase

Create a database backup before changing production. This repository is linked
to Supabase project `ufzxrojekrrvlweadnkq`. From the repository root:

```bash
supabase link --project-ref ufzxrojekrrvlweadnkq
supabase db push
```

Deploy every changed function:

```bash
supabase functions deploy admin-provider-secrets
supabase functions deploy test-ai-provider
supabase functions deploy create-razorpay-order
supabase functions deploy verify-razorpay-payment
supabase functions deploy create-razorpay-subscription
supabase functions deploy verify-razorpay-subscription
supabase functions deploy cancel-razorpay-subscription
supabase functions deploy razorpay-webhook
supabase functions deploy blog-scheduler
```

The repository also contains a manual GitHub Actions workflow at
`.github/workflows/supabase-release.yml`. Add `SUPABASE_ACCESS_TOKEN` and
`SUPABASE_DB_PASSWORD` as repository secrets, then run **Supabase release**
from the Actions tab to apply the migration and deploy the functions without
installing the CLI locally.

Set server-only secrets in Supabase (never prefix these with `VITE_`):

```bash
supabase secrets set \
  RAZORPAY_KEY_ID=... \
  RAZORPAY_KEY_SECRET=... \
  RAZORPAY_WEBHOOK_SECRET=... \
  RAZORPAY_MONTHLY_PLAN_ID_INR=plan_... \
  RAZORPAY_YEARLY_PLAN_ID_INR=plan_... \
  RAZORPAY_MONTHLY_PLAN_ID_USD=plan_... \
  RAZORPAY_YEARLY_PLAN_ID_USD=plan_... \
  BLOG_SCHEDULER_SECRET="$(openssl rand -hex 32)" \
  GOOGLE_SEARCH_CONSOLE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}' \
  GOOGLE_SEARCH_CONSOLE_SITE_URL=https://makecv.site/ \
  GOOGLE_SEARCH_CONSOLE_SITEMAP_URL=https://makecv.site/sitemap.xml \
  VERCEL_DEPLOY_HOOK_URL=https://api.vercel.com/v1/integrations/deploy/...
```

`SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are
provided automatically to Edge Functions. Add `GEMINI_API_KEY` only if a
server fallback key is desired; provider keys can instead be stored through
Admin → AI Management.

Install the database cron using
[`supabase/setup/blog_automation_cron.sql`](../supabase/setup/blog_automation_cron.sql).
Create Vault secrets named `makecv_project_url` and `blog_scheduler_secret`
before running it. The job runs every five minutes and calls the protected
`blog-scheduler` function.

## 3. Configure Vercel

Set these project environment variables for Production and Preview as
appropriate:

```text
VITE_SUPABASE_URL=https://ufzxrojekrrvlweadnkq.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<anon-key>
VITE_SUPABASE_PROJECT_ID=<project-ref>
SUPABASE_URL=https://ufzxrojekrrvlweadnkq.supabase.co
BLOG_SCHEDULER_SECRET=<same scheduler secret used by the API route>
```

Deploy with the repository's normal Vercel integration. The build command is
`npm run build`, output is `dist`, and `vercel.json` schedules
`/api/blog-scheduler` once daily as a Hobby-plan-compatible fallback. The API
route refuses to run when the Supabase URL or scheduler secret is missing.
For the intended five-minute automation cadence, install
`supabase/setup/blog_automation_cron.sql` after deploying the
`blog-scheduler` function; Supabase `pg_cron` is the authoritative scheduler
and avoids Vercel Hobby's once-per-day cron limit. On Vercel Pro, the fallback
cron can be changed back to `*/5 * * * *` if Supabase cron is not used.

After deployment, verify:

```bash
curl -i https://makecv.site/sitemap.xml
curl -i https://makecv.site/robots.txt
curl -i https://makecv.site/rss.xml
```

The old Vercel host redirects permanently to `https://makecv.site`.

## 4. Configure Razorpay safely

Create four recurring plans in Razorpay: monthly INR, yearly INR, monthly USD,
and yearly USD. Their amounts must match the canonical database catalog:

| Plan | INR | USD |
| --- | ---: | ---: |
| Monthly | ₹299 | $5 |
| Yearly | ₹2,499 | $39 |

Set the returned `plan_...` IDs in the server secrets above. Configure a
Razorpay webhook pointing to:

```text
https://ufzxrojekrrvlweadnkq.supabase.co/functions/v1/razorpay-webhook
```

Use the same `RAZORPAY_WEBHOOK_SECRET` and enable subscription events:
`subscription.authenticated`, `subscription.activated`,
`subscription.charged`, `subscription.pending`, `subscription.halted`,
`subscription.cancelled`, and `subscription.completed`, plus
`payment.captured` and `payment.failed`.

Test in Razorpay test mode first. Confirm that a successful checkout creates
one subscription and one payment row, replaying the webhook does not create a
duplicate, and cancellation updates the local lifecycle fields.

## 5. Configure DeepSeek and other AI providers

1. Sign in as an admin and open `/admin/ai-management`.
2. Add the DeepSeek key, choose DeepSeek, and save it.
3. Click **Test connection**.
4. Set it as Primary or Fallback as appropriate.

The browser receives only masked metadata. Raw provider keys are read and
written by `admin-provider-secrets` with `service_role`, and AI calls use the
server-side key manager. The current DeepSeek model is `deepseek-chat`.

## 6. Configure automated blogs and indexing

1. Open `/admin/blog-automation` and create an enabled schedule.
2. Choose a supported category and a clear topic prompt; automation publishes
   only after the 700-word/semantic-HTML/metadata quality gates.
3. Run the local wiring smoke test:

   ```bash
   BLOG_SCHEDULER_URL=https://ufzxrojekrrvlweadnkq.supabase.co/functions/v1/blog-scheduler \
   BLOG_SCHEDULER_SECRET=<secret> \
   npm run test:blog
   ```

4. Confirm the run becomes `succeeded`, a published `blog_posts` row exists,
   and the run shows Google status `submitted`, `not configured`, or `failed`.

The worker triggers a Vercel rebuild so the new post enters `sitemap.xml`, then
submits that sitemap to Google Search Console using the service account. This
submits the sitemap; Google still controls crawling and indexing timing.

For Search Console setup, enable the Search Console API in Google Cloud,
create a service account, grant it access to the exact property
`https://makecv.site/`, and store its JSON in
`GOOGLE_SEARCH_CONSOLE_SERVICE_ACCOUNT_JSON`.

## 7. Mobile and admin acceptance matrix

Test at 390px, 768px, and desktop widths:

- `/admin`, `/admin/ai-management`, `/admin/blog-automation`,
  `/admin/payment-gateways`, and `/admin/content` load directly and preserve
  their selected section after refresh.
- No horizontal page scroll, clipped buttons, overlapping labels, or unreadable
  tables.
- AI key cards wrap controls and never reveal raw secrets.
- Blog schedule forms, run history, and indexing badges remain usable on a
  narrow viewport.
- Pricing buttons invoke the correct one-time or recurring Razorpay flow.

## 8. Rollback and incident handling

- If a deployment fails, revert the Vercel deployment; database migrations are
  additive except for the intentional provider-secret and publish-mode policy
  hardening.
- Disable a failing blog schedule after repeated failures; inspect the run's
  `error_code` and `error_message` before re-enabling it.
- Rotate Razorpay, AI, scheduler, or Google credentials immediately if exposed.
- Never restore direct browser policies on `ai_api_keys` or
  `payment_gateway_keys`; use the protected admin function instead.
