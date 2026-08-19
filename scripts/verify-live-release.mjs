// Read-only production smoke test for the Supabase release migration.
// It extracts the public anon key from the deployed bundle, then checks only
// schema presence and that provider-secret tables reject anonymous reads.
const siteUrl = (process.env.MAKECV_SITE_URL || 'https://makecv.site').replace(/\/$/, '');
const html = await (await fetch(`${siteUrl}/`)).text();
const scriptPath = html.match(/src="([^"]+\.js)"/)?.[1];
if (!scriptPath) throw new Error('Could not locate the deployed application bundle');
const bundle = await (await fetch(new URL(scriptPath, `${siteUrl}/`))).text();
const tokens = bundle.match(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g) || [];
const projectToken = tokens.find((token) => {
  try { return JSON.parse(Buffer.from(token.split('.')[1], 'base64url')).ref; } catch { return false; }
});
if (!projectToken) throw new Error('Could not locate the public Supabase key in the deployed bundle');
const ref = JSON.parse(Buffer.from(projectToken.split('.')[1], 'base64url')).ref;
const api = `https://${ref}.supabase.co/rest/v1`;
const headers = { apikey: projectToken, Authorization: `Bearer ${projectToken}` };

const checks = [
  ['subscription_plans.razorpay_plan_id_usd', '/subscription_plans?select=razorpay_plan_id_usd&limit=1', true],
  ['blog_automation_runs.indexing_status', '/blog_automation_runs?select=indexing_status&limit=1', true],
  ['razorpay_subscription_checkouts table', '/razorpay_subscription_checkouts?select=id&limit=1', true],
  ['subscriptions.razorpay_subscription_id', '/subscriptions?select=razorpay_subscription_id,provider_status&limit=1', true],
  ['payments.razorpay_subscription_id', '/payments?select=razorpay_subscription_id&limit=1', true],
  ['ai_api_keys anonymous access is denied', '/ai_api_keys?select=id&limit=1', false],
  ['payment_gateway_keys anonymous access is denied', '/payment_gateway_keys?select=id&limit=1', false],
];

let failed = 0;
for (const [label, path, shouldSucceed] of checks) {
  const response = await fetch(`${api}${path}`, { headers });
  const passed = shouldSucceed ? response.ok : response.status === 401 || response.status === 403;
  console.log(`${passed ? 'PASS' : 'FAIL'} ${label} (HTTP ${response.status})`);
  if (!passed) failed += 1;
}
if (failed) {
  console.error(`${failed} live release check(s) failed. Apply the Supabase migration and deploy the Edge Functions.`);
  process.exitCode = 1;
} else {
  console.log('Live Supabase release checks passed.');
}
