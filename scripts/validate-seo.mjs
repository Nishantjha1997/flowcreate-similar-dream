import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { getSiteUrl } from './seo-config.mjs';
import { loadDotEnv, projectRoot } from './seo-data.mjs';

loadDotEnv();
const siteUrl = getSiteUrl();
const dist = join(projectRoot, 'dist');
const sitemapPath = join(dist, 'sitemap.xml');
const errors = [];

function assert(condition, message) {
  if (!condition) errors.push(message);
}

function extract(html, pattern) {
  return html.match(pattern)?.[1]?.trim();
}

assert(existsSync(sitemapPath), 'dist/sitemap.xml is missing');
const sitemap = existsSync(sitemapPath) ? readFileSync(sitemapPath, 'utf8') : '';
const locations = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) =>
  match[1].replaceAll('&amp;', '&'),
);
assert(locations.length > 0, 'sitemap contains no URLs');
assert(new Set(locations).size === locations.length, 'sitemap contains duplicate URLs');

const forbiddenPaths = [
  '/login',
  '/register',
  '/forgot-password',
  '/account',
  '/admin',
  '/master-profiles',
  '/r/',
  '/ats/dashboard',
  '/ats/settings',
  '/ats/onboarding',
  '/ats/login',
  '/ats/signup',
];
for (const path of forbiddenPaths) {
  assert(
    !locations.some((location) => new URL(location).pathname.startsWith(path)),
    `private path leaked into sitemap: ${path}`,
  );
}

const titles = new Map();
for (const location of locations) {
  const url = new URL(location);
  assert(url.origin === siteUrl, `sitemap origin mismatch: ${location}`);

  const routeFile =
    url.pathname === '/'
      ? join(dist, 'index.html')
      : join(dist, ...url.pathname.split('/').filter(Boolean), 'index.html');
  assert(existsSync(routeFile), `prerendered HTML is missing: ${url.pathname}`);
  if (!existsSync(routeFile)) continue;

  const html = readFileSync(routeFile, 'utf8');
  const title = extract(html, /<title>([\s\S]*?)<\/title>/i);
  const description = extract(
    html,
    /<meta\s+[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i,
  );
  const canonical = extract(
    html,
    /<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i,
  );
  const ogUrl = extract(
    html,
    /<meta\s+[^>]*property=["']og:url["'][^>]*content=["']([^"']+)["'][^>]*>/i,
  );
  const robots = extract(
    html,
    /<meta\s+[^>]*name=["']robots["'][^>]*content=["']([^"']+)["'][^>]*>/i,
  );
  const schema = extract(
    html,
    /<script\s+id=["']seo-structured-data["']\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/i,
  );

  assert(Boolean(title), `${url.pathname}: title is missing`);
  assert(Boolean(description), `${url.pathname}: description is missing`);
  assert((description || '').length >= 50, `${url.pathname}: description is too short`);
  assert(canonical === location, `${url.pathname}: canonical mismatch (${canonical})`);
  assert(ogUrl === location, `${url.pathname}: og:url mismatch (${ogUrl})`);
  assert((robots || '').startsWith('index, follow'), `${url.pathname}: route is not indexable`);
  assert((html.match(/rel=["']canonical["']/gi) || []).length === 1, `${url.pathname}: canonical is duplicated`);
  assert(html.includes('data-seo-prerender'), `${url.pathname}: crawlable body shell is missing`);
  assert(/<h1[\s>]/i.test(html), `${url.pathname}: H1 is missing`);
  assert(!html.includes('__SITE_URL__'), `${url.pathname}: unresolved SITE_URL placeholder`);
  assert(Boolean(schema), `${url.pathname}: JSON-LD is missing`);
  if (schema) {
    try {
      JSON.parse(schema);
    } catch (error) {
      errors.push(`${url.pathname}: invalid JSON-LD (${error.message})`);
    }
  }

  if (title) {
    const existing = titles.get(title);
    assert(!existing, `${url.pathname}: title duplicates ${existing}: ${title}`);
    titles.set(title, url.pathname);
  }
}

const robotsPath = join(dist, 'robots.txt');
assert(existsSync(robotsPath), 'dist/robots.txt is missing');
if (existsSync(robotsPath)) {
  const robots = readFileSync(robotsPath, 'utf8');
  assert(robots.includes(`Sitemap: ${siteUrl}/sitemap.xml`), 'robots.txt sitemap origin is wrong');
  assert(!/Disallow:\s*\/\S+/i.test(robots), 'robots.txt blocks a route that should expose noindex headers');
}

const rssPath = join(dist, 'rss.xml');
assert(existsSync(rssPath), 'dist/rss.xml is missing');
if (existsSync(rssPath)) {
  const rss = readFileSync(rssPath, 'utf8');
  assert((rss.match(/<item>/g) || []).length > 0, 'RSS feed contains no blog entries');
}

const notFoundPath = join(dist, '404.html');
assert(existsSync(notFoundPath), 'dist/404.html is missing');
if (existsSync(notFoundPath)) {
  const notFound = readFileSync(notFoundPath, 'utf8');
  assert(notFound.includes('content="noindex, nofollow"'), '404 page is not noindex');
}

if (errors.length > 0) {
  console.error(`SEO validation failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(
    `SEO validation passed: ${locations.length} canonical routes, ${titles.size} unique titles, sitemap, robots, RSS, JSON-LD, and 404.`,
  );
}
