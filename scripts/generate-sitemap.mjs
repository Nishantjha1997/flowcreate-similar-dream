// Build-time search discovery assets. Vercel runs this through npm's prebuild
// hook, so the sitemap, robots file, and RSS feed always ship with the same
// canonical origin as the application.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  DEFAULT_OG_IMAGE,
  PUBLIC_ROUTES,
  SITE_NAME,
  getSiteUrl,
} from './seo-config.mjs';
import {
  fetchPublishedBlogPosts,
  loadDotEnv,
  loadProfessions,
  projectRoot,
} from './seo-data.mjs';

loadDotEnv();
const siteUrl = getSiteUrl();
const posts = await fetchPublishedBlogPosts();
const professions = loadProfessions();

const escapeXml = (value = '') =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');

const formatDate = (value) => {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString().slice(0, 10);
};

const urls = [
  ...PUBLIC_ROUTES,
  ...posts.map((post) => ({
    path: `/blog/${post.slug}`,
    changefreq: 'monthly',
    priority: '0.7',
    lastmod: formatDate(post.updated_at || post.published_at || post.created_at),
  })),
  ...professions.map((profession) => ({
    path: `/resume-template/${profession.slug}`,
    changefreq: 'monthly',
    priority: '0.7',
  })),
];

const uniqueUrls = [...new Map(urls.map((entry) => [entry.path, entry])).values()];
const urlXml = ({ path, changefreq, priority, lastmod }) =>
  [
    '  <url>',
    `    <loc>${escapeXml(`${siteUrl}${path}`)}</loc>`,
    lastmod ? `    <lastmod>${lastmod}</lastmod>` : '',
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    '  </url>',
  ]
    .filter(Boolean)
    .join('\n');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${uniqueUrls.map(urlXml).join('\n')}
</urlset>
`;
writeFileSync(join(projectRoot, 'public', 'sitemap.xml'), sitemap);
console.log(`sitemap: wrote ${uniqueUrls.length} canonical URLs for ${siteUrl}`);

// Do not block noindex pages in robots.txt: Google must be able to crawl them
// to see their X-Robots-Tag. Private and utility pages are omitted from the
// sitemap and protected with response headers in vercel.json.
const robots = `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`;
writeFileSync(join(projectRoot, 'public', 'robots.txt'), robots);
console.log('robots: wrote an open crawl policy with canonical sitemap');

const rssItems = posts
  .slice(0, 50)
  .map((post) => {
    const url = `${siteUrl}/blog/${post.slug}`;
    const published = post.published_at || post.created_at;
    return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <description>${escapeXml(post.description || post.excerpt || '')}</description>
      ${published ? `<pubDate>${new Date(published).toUTCString()}</pubDate>` : ''}
      ${post.author ? `<dc:creator>${escapeXml(post.author)}</dc:creator>` : ''}
    </item>`;
  })
  .join('\n');

const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${SITE_NAME} Resume Tips and Career Advice</title>
    <link>${siteUrl}/blog</link>
    <description>Resume writing tips, ATS guidance, career advice, and job search strategies.</description>
    <language>en</language>
    <image>
      <url>${siteUrl}${DEFAULT_OG_IMAGE}</url>
      <title>${SITE_NAME}</title>
      <link>${siteUrl}</link>
    </image>
${rssItems}
  </channel>
</rss>
`;
writeFileSync(join(projectRoot, 'public', 'rss.xml'), rss);
console.log(`rss: wrote ${Math.min(posts.length, 50)} blog entries`);
