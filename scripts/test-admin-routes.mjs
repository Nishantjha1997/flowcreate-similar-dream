// Deterministic smoke checks for admin deep links and responsive release guards.
// This deliberately avoids a browser/database dependency so CI can catch a
// route regression before it reaches the dashboard deployment.
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const app = read('src/App.tsx');
const admin = read('src/pages/Admin.tsx');
const blogAutomation = read('src/components/admin/BlogAutomation.tsx');
const providerSecrets = read('supabase/functions/admin-provider-secrets/index.ts');
const vercel = read('vercel.json');

assert(app.includes('<Route path="/admin/:section?"'), 'admin route must support direct section deep links');
for (const alias of [
  '"ai-management": "ai"',
  '"ai-providers": "ai"',
  '"payment-gateways": "payments"',
  '"content-management": "content"',
]) {
  assert(admin.includes(alias), `missing admin route alias: ${alias}`);
}
assert(vercel.includes('"source": "/admin/:path*"'), 'Vercel must rewrite admin deep links to the SPA shell');
assert(blogAutomation.includes('publish automatically only after the server-side quality gates pass'), 'blog automation copy must describe automatic publishing');
assert(providerSecrets.includes("body.action === 'update'"), 'secure provider service must support POST update actions from the AI Providers page');

console.log('admin route and responsive release checks passed');
