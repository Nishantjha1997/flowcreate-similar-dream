// Generates public/sitemap.xml + public/robots.txt at build time.
// Runs automatically via the npm "prebuild" hook (and in Vercel builds).
//
// Sources:
//   - static marketing/legal routes (list below)
//   - all profession slugs parsed from src/data/professions.ts
//   - all PUBLISHED blog posts fetched live from Supabase (anon key)
//
// Domain comes from VITE_SITE_URL (set it in Vercel when the custom domain
// goes live) — falls back to the current vercel.app deployment.
// On any fetch failure the script degrades gracefully (keeps going without
// blog slugs) and NEVER fails the build.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// Standalone Node scripts don't get Vite's automatic .env loading — parse it
// manually (build environments like Vercel set these as real env vars, so
// this is purely for local `npm run build`).
function loadDotEnv() {
  const envPath = join(root, '.env');
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (!m) continue;
    const key = m[1];
    let val = (m[2] ?? '').trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    if (process.env[key] === undefined) process.env[key] = val;
  }
}
loadDotEnv();

const SITE_URL = (process.env.VITE_SITE_URL ?? 'https://flowcreate-similar-dream.vercel.app').replace(/\/$/, '');

// ── Supabase credentials: env (incl. .env) first, then client.ts's fallback ──
function clientFallback(pattern) {
  try {
    const src = readFileSync(join(root, 'src/integrations/supabase/client.ts'), 'utf8');
    return src.match(pattern)?.[1] ?? null;
  } catch { return null; }
}
const SUPABASE_URL = process.env.VITE_SUPABASE_URL
  ?? clientFallback(/VITE_SUPABASE_URL \?\? "([^"]+)"/);
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY
  ?? clientFallback(/VITE_SUPABASE_PUBLISHABLE_KEY \?\?\s*"([^"]+)"/);

// ── Route sets ────────────────────────────────────────────────────────────
const staticRoutes = [
  { path: '/',                     changefreq: 'weekly',  priority: '1.0' },
  { path: '/resume-builder',       changefreq: 'weekly',  priority: '0.9' },
  { path: '/templates',            changefreq: 'weekly',  priority: '0.9' },
  { path: '/cover-letter-builder', changefreq: 'monthly', priority: '0.8' },
  { path: '/pricing',              changefreq: 'monthly', priority: '0.8' },
  { path: '/features',             changefreq: 'monthly', priority: '0.8' },
  { path: '/examples',             changefreq: 'monthly', priority: '0.7' },
  { path: '/blog',                 changefreq: 'weekly',  priority: '0.8' },
  { path: '/resources',            changefreq: 'monthly', priority: '0.7' },
  { path: '/career-advice',        changefreq: 'monthly', priority: '0.7' },
  { path: '/help',                 changefreq: 'monthly', priority: '0.6' },
  { path: '/about',                changefreq: 'monthly', priority: '0.6' },
  { path: '/ats',                  changefreq: 'monthly', priority: '0.7' },
  { path: '/ats/jobs/browse',      changefreq: 'weekly',  priority: '0.6' },
  { path: '/terms',                changefreq: 'yearly',  priority: '0.3' },
  { path: '/privacy',              changefreq: 'yearly',  priority: '0.3' },
  { path: '/refund-policy',        changefreq: 'yearly',  priority: '0.3' },
  { path: '/shipping-policy',      changefreq: 'yearly',  priority: '0.3' },
];

function professionRoutes() {
  try {
    const src = readFileSync(join(root, 'src/data/professions.ts'), 'utf8');
    const slugs = [...src.matchAll(/slug:\s*'([^']+)'/g)].map((m) => m[1]);
    return slugs.map((s) => ({ path: `/resume-template/${s}`, changefreq: 'monthly', priority: '0.7' }));
  } catch (e) {
    console.warn('sitemap: could not parse professions.ts —', e.message);
    return [];
  }
}

async function blogRoutes() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.warn('sitemap: no Supabase credentials available — skipping blog posts');
    return [];
  }
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/blog_posts?select=slug,updated_at,published_at&status=eq.published&order=published_at.desc`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const posts = await res.json();
    console.log(`sitemap: ${posts.length} published blog posts`);
    return posts.map((p) => ({
      path: `/blog/${p.slug}`,
      changefreq: 'monthly',
      priority: '0.7',
      lastmod: (p.updated_at ?? p.published_at ?? '').slice(0, 10) || undefined,
    }));
  } catch (e) {
    console.warn('sitemap: blog fetch failed —', e.message);
    return [];
  }
}

const urlXml = ({ path, changefreq, priority, lastmod }) =>
  `  <url><loc>${SITE_URL}${path}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}<changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`;

const all = [...staticRoutes, ...(await blogRoutes()), ...professionRoutes()];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${all.map(urlXml).join('\n')}
</urlset>
`;
writeFileSync(join(root, 'public', 'sitemap.xml'), sitemap);
console.log(`sitemap: wrote ${all.length} URLs for ${SITE_URL}`);

const robots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /account
Disallow: /login
Disallow: /register
Disallow: /forgot-password
Disallow: /ats/dashboard
Disallow: /ats/settings
Disallow: /ats/onboarding
Disallow: /ats/login
Disallow: /ats/signup

Sitemap: ${SITE_URL}/sitemap.xml
`;
writeFileSync(join(root, 'public', 'robots.txt'), robots);
console.log('robots.txt written');
