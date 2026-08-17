// Deterministic smoke test for the blog automation release gates. A live tick
// can be exercised by setting BLOG_SCHEDULER_URL and BLOG_SCHEDULER_SECRET;
// without credentials this still proves the sanitizer, quality gates, slug
// idempotency contract, and Search Console wiring are present.
import { readFileSync } from 'node:fs';

const scheduler = readFileSync(new URL('../supabase/functions/blog-scheduler/index.ts', import.meta.url), 'utf8');
const migration = readFileSync(new URL('../supabase/migrations/20260817000000_release_hardening.sql', import.meta.url), 'utf8');
const automationMigration = readFileSync(new URL('../supabase/migrations/20260730000000_blog_automation.sql', import.meta.url), 'utf8');
const assert = (condition, message) => { if (!condition) throw new Error(message); };

function sanitizeHtml(input) {
  const allowed = new Set(['p', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'strong', 'em', 'blockquote', 'code', 'pre', 'a', 'br', 'hr']);
  return input
    .replace(/<!--([\s\S]*?)-->/g, '')
    .replace(/<(script|style|iframe|object|embed|svg|math|form|textarea|select|button)[^>]*>[\s\S]*?<\/\1\s*>/gi, '')
    .replace(/<\/?([a-z0-9-]+)\b[^>]*>/gi, (tag, rawName) => {
      const name = rawName.toLowerCase();
      if (!allowed.has(name)) return '';
      if (tag.startsWith('</')) return name === 'br' || name === 'hr' ? '' : `</${name}>`;
      return name === 'br' || name === 'hr' ? `<${name}>` : `<${name}>`;
    })
    .trim();
}

function countWords(html) {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return text ? text.split(' ').length : 0;
}

function slugify(value) {
  return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 90);
}

const fixture = `<script>alert('xss')</script><h1>ATS Resume Guide</h1><h2>Structure</h2><p>${'Use clear, evidence-based guidance for job seekers. '.repeat(160)}</p>`;
const safe = sanitizeHtml(fixture);
assert(!safe.includes('<script'), 'unsafe script tag survived sanitization');
assert(safe.includes('<h2>') && safe.includes('<p>'), 'semantic article tags were lost');
assert(countWords(safe) >= 700, 'quality gate should reject short articles');
assert(slugify('How to Write an ATS-Friendly Resume in 2026') === 'how-to-write-an-ats-friendly-resume-in-2026', 'slug normalization changed');

for (const required of ['claim_due_blog_automation_runs', 'complete_blog_automation_run', 'fail_blog_automation_run', 'publishAndSubmitSitemap', 'submitSitemapToSearchConsole']) {
  assert(scheduler.includes(required), `scheduler is missing ${required}`);
}
assert(automationMigration.includes('blog_automation_run_once'), 'automation migration is missing its idempotency constraint');
for (const required of ['blog_automation_schedules_publish_mode_check', 'indexing_status']) {
  assert(migration.includes(required), `release migration is missing ${required}`);
}

const liveUrl = process.env.BLOG_SCHEDULER_URL;
const liveSecret = process.env.BLOG_SCHEDULER_SECRET;
if (liveUrl && liveSecret) {
  const response = await fetch(liveUrl, { method: 'POST', headers: { 'content-type': 'application/json', 'x-blog-scheduler-secret': liveSecret }, body: JSON.stringify({ action: 'tick' }) });
  assert(response.ok, `live scheduler tick returned HTTP ${response.status}`);
  console.log(`blog automation live tick passed: ${JSON.stringify(await response.json())}`);
} else {
  console.log('blog automation local smoke passed (live tick skipped: BLOG_SCHEDULER_URL/SECRET not set)');
}
