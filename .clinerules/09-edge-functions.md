# Edge Functions

Supabase Edge Functions live in `supabase/functions/<name>/index.ts` and run on
the linked project `ufzxrojekrrvlweadnkq`.

## Current functions

Admin and account operations: `admin-add-org-member`, `admin-create-user`,
`admin-delete-user`, `admin-list-users`, and `self-delete-account`.

AI and document flows: `gemini-suggest`, `extract-resume-data`,
`extract-text-from-file`, and `blog-ai`.

Payments and billing: `create-razorpay-order`, `verify-razorpay-payment`,
`razorpay-webhook`, `create-stripe-checkout`, and `stripe-webhook`.

Content and notifications: `blog-scheduler`, `send-notification`, and
`track-resume-view`.

Shared code is under `supabase/functions/_shared/`. The shared rate limiter
uses atomic Postgres RPCs, and AI calls must enforce plan metering before
returning a successful result.

## Request contracts

Do not change an existing request or response shape without updating every
caller and its tests. The frontend calls `gemini-suggest` with a JSON body
containing `prompt`; resume extraction receives multipart form data with a
`file`; Razorpay order creation receives `{ planType }`; payment verification
receives Razorpay IDs, signature, and `planType`. Stripe and Razorpay webhooks
receive provider-native HTTP payloads and verify their signatures.

Every AI endpoint must validate input, normalize provider output, apply the
durable rate limit, and meter successful usage. Never trust a model to follow
the requested JSON shape.

## Secrets

Required secrets depend on the function. Common values are `SUPABASE_URL`,
`SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`. Provider secrets include
`GEMINI_API_KEY`, `OPENAI_API_KEY`, `DEEPSEEK_API_KEY`, `RAZORPAY_KEY_ID`,
`RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `STRIPE_SECRET_KEY`,
`STRIPE_WEBHOOK_SECRET`, and optional `RESEND_API_KEY`.

Service-role keys are server-only. Never put them in `VITE_*` variables or
return them to the browser.

## Error handling

Frontend callers must use `getEdgeFunctionErrorMessage()` from
`src/utils/edgeFunctionError.ts`. Do not expose the generic
`FunctionsHttpError.message` value to users. Edge functions should return a
safe public error and log internal details only on the server.

## Deployment and verification

Edge functions do not deploy from a Git push. Deploy each changed function:

```powershell
supabase functions deploy <name> --project-ref ufzxrojekrrvlweadnkq
```

Before committing, run `tsc --noEmit`, `vitest run`, and `npm run build`.
After schema changes, apply the append-only migration with
`supabase db push --linked` and regenerate `src/integrations/supabase/types.ts`.
