// Vite ships a client-rendered SPA. This postbuild step creates a real HTML
// entry for every indexable route so crawlers immediately receive the correct
// title, canonical, social metadata, structured data, body copy, and links.
// React replaces the matching HTML shell when JavaScript starts.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import {
  DEFAULT_OG_IMAGE,
  PUBLIC_ROUTES,
  SITE_NAME,
  completeTitle,
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
const distDirectory = join(projectRoot, 'dist');
const templatePath = join(distDirectory, 'index.html');
const baseHtml = readFileSync(templatePath, 'utf8');
const posts = await fetchPublishedBlogPosts({ full: true });
const professions = loadProfessions();

const escapeHtml = (value = '') =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function absoluteUrl(path) {
  if (/^https?:\/\//i.test(path || '')) return path;
  return `${siteUrl}${path?.startsWith('/') ? path : `/${path || ''}`}`;
}

function sanitizeArticleHtml(value = '') {
  return String(value)
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<(script|style|iframe|object|embed|form|input|button|textarea|select|link|meta)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<(script|style|iframe|object|embed|form|input|button|textarea|select|link|meta)\b[^>]*\/?>/gi, '')
    .replace(/\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/\s+(?:src|href)\s*=\s*(["'])\s*javascript:[\s\S]*?\1/gi, '')
    .replace(/\s+style\s*=\s*(?:"[^"]*"|'[^']*')/gi, '');
}

function upsertMeta(html, attribute, key, content) {
  const pattern = new RegExp(
    `<meta\\s+[^>]*${attribute}=(["'])${escapeRegExp(key)}\\1[^>]*>`,
    'i',
  );
  const tag = `<meta ${attribute}="${escapeHtml(key)}" content="${escapeHtml(content)}" />`;
  return pattern.test(html)
    ? html.replace(pattern, tag)
    : html.replace('</head>', `    ${tag}\n  </head>`);
}

function upsertLink(html, rel, href, extra = '') {
  const pattern = new RegExp(
    `<link\\s+[^>]*rel=(["'])${escapeRegExp(rel)}\\1[^>]*>`,
    'i',
  );
  const tag = `<link rel="${escapeHtml(rel)}" href="${escapeHtml(href)}"${extra} />`;
  return pattern.test(html)
    ? html.replace(pattern, tag)
    : html.replace('</head>', `    ${tag}\n  </head>`);
}

function sharedNavigation() {
  return `<header data-seo-header>
    <a href="/" aria-label="${SITE_NAME} home">${SITE_NAME}</a>
    <nav aria-label="Primary navigation">
      <a href="/resume-builder">Resume Builder</a>
      <a href="/templates">Resume Templates</a>
      <a href="/examples">Resume Examples</a>
      <a href="/cover-letter-builder">Cover Letter Builder</a>
      <a href="/blog">Career Blog</a>
    </nav>
  </header>`;
}

function sharedLinks() {
  return `<aside aria-label="Explore FlowCreate">
    <h2>Build a Stronger Job Application</h2>
    <ul>
      <li><a href="/resume-builder">Create a free professional resume</a></li>
      <li><a href="/templates">Browse ATS-friendly resume templates</a></li>
      <li><a href="/examples">Review professional resume examples</a></li>
      <li><a href="/career-advice">Read career and job search advice</a></li>
      <li><a href="/blog">Explore resume writing guides</a></li>
    </ul>
  </aside>`;
}

function staticRouteShell(route) {
  let supplemental = sharedLinks();

  if (route.path === '/blog') {
    supplemental = `<section aria-labelledby="latest-articles">
      <h2 id="latest-articles">Latest Resume and Career Guides</h2>
      <ul>
        ${posts
          .map(
            (post) =>
              `<li><a href="/blog/${escapeHtml(post.slug)}">${escapeHtml(post.title)}</a>` +
              `${post.excerpt ? `<p>${escapeHtml(post.excerpt)}</p>` : ''}</li>`,
          )
          .join('\n')}
      </ul>
    </section>`;
  } else if (route.path === '/templates' || route.path === '/examples') {
    supplemental = `<section aria-labelledby="templates-by-job">
      <h2 id="templates-by-job">Resume Templates by Profession</h2>
      <ul>
        ${professions
          .map(
            (profession) =>
              `<li><a href="/resume-template/${escapeHtml(profession.slug)}">${escapeHtml(profession.title)}</a></li>`,
          )
          .join('\n')}
      </ul>
    </section>`;
  }

  return `${sharedNavigation()}
    <main>
      <article>
        <h1>${escapeHtml(route.heading || route.title)}</h1>
        <p>${escapeHtml(route.description)}</p>
        ${supplemental}
      </article>
    </main>`;
}

function blogPostShell(post) {
  const relatedPosts = posts
    .filter((candidate) => candidate.slug !== post.slug && candidate.category === post.category)
    .slice(0, 5);
  const date = post.published_at || post.created_at;

  return `${sharedNavigation()}
    <main>
      <article>
        <nav aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/blog">Blog</a></nav>
        <h1>${escapeHtml(post.title)}</h1>
        ${post.excerpt ? `<p>${escapeHtml(post.excerpt)}</p>` : ''}
        <p>
          ${post.author ? `By ${escapeHtml(post.author)} · ` : ''}
          ${date ? `<time datetime="${escapeHtml(date)}">${escapeHtml(new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }))}</time>` : ''}
          ${post.read_time ? ` · ${escapeHtml(post.read_time)}` : ''}
        </p>
        ${post.image_url ? `<img src="${escapeHtml(post.image_url)}" alt="${escapeHtml(post.title)}" />` : ''}
        <div>${sanitizeArticleHtml(post.content)}</div>
      </article>
      ${
        relatedPosts.length
          ? `<aside aria-labelledby="related-articles">
          <h2 id="related-articles">Related Articles</h2>
          <ul>${relatedPosts
            .map(
              (related) =>
                `<li><a href="/blog/${escapeHtml(related.slug)}">${escapeHtml(related.title)}</a></li>`,
            )
            .join('')}</ul>
        </aside>`
          : sharedLinks()
      }
    </main>`;
}

function professionShell(profession) {
  const related = professions
    .filter(
      (candidate) =>
        candidate.slug !== profession.slug &&
        candidate.category === profession.category,
    )
    .slice(0, 8);

  return `${sharedNavigation()}
    <main>
      <article>
        <nav aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/templates">Resume Templates</a></nav>
        <h1>Free ${escapeHtml(profession.title)}</h1>
        <p>${escapeHtml(profession.description)}</p>
        <h2>Why This Resume Template Works</h2>
        <p>${escapeHtml(profession.summary)}</p>
        <h2>Build Your Resume in Three Steps</h2>
        <ol>
          <li>Choose an ATS-friendly professional template.</li>
          <li>Add your experience, education, skills, and achievements.</li>
          <li>Download your finished resume as a polished PDF.</li>
        </ol>
        <p><a href="/resume-builder?template=${escapeHtml(profession.templateKey)}">Build your ${escapeHtml(profession.title.replace(' Resume Template', ''))} resume</a></p>
      </article>
      ${
        related.length
          ? `<aside aria-labelledby="related-templates">
          <h2 id="related-templates">More ${escapeHtml(profession.category)} Resume Templates</h2>
          <ul>${related
            .map(
              (candidate) =>
                `<li><a href="/resume-template/${escapeHtml(candidate.slug)}">${escapeHtml(candidate.title)}</a></li>`,
            )
            .join('')}</ul>
        </aside>`
          : sharedLinks()
      }
    </main>`;
}

function breadcrumbSchema(path, name) {
  const items = [{ '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl }];
  if (path.startsWith('/blog/')) {
    items.push({
      '@type': 'ListItem',
      position: 2,
      name: 'Blog',
      item: `${siteUrl}/blog`,
    });
  } else if (path.startsWith('/resume-template/')) {
    items.push({
      '@type': 'ListItem',
      position: 2,
      name: 'Resume Templates',
      item: `${siteUrl}/templates`,
    });
  }
  items.push({
    '@type': 'ListItem',
    position: items.length + 1,
    name,
    item: `${siteUrl}${path}`,
  });
  return { '@type': 'BreadcrumbList', itemListElement: items };
}

function routeStructuredData(route) {
  const canonical = `${siteUrl}${route.path}`;
  const graph = [
    {
      '@type': 'WebPage',
      '@id': canonical,
      url: canonical,
      name: completeTitle(route.title),
      description: route.description,
      isPartOf: { '@id': `${siteUrl}/#website` },
      inLanguage: 'en',
    },
  ];

  if (route.path === '/') {
    graph.push(
      {
        '@type': 'Organization',
        '@id': `${siteUrl}/#organization`,
        name: SITE_NAME,
        url: siteUrl,
        logo: {
          '@type': 'ImageObject',
          url: `${siteUrl}/logo.svg`,
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        name: SITE_NAME,
        url: siteUrl,
        publisher: { '@id': `${siteUrl}/#organization` },
        inLanguage: 'en',
      },
      {
        '@type': 'SoftwareApplication',
        name: SITE_NAME,
        url: siteUrl,
        description: route.description,
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Any',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      },
    );
  } else {
    graph.push(breadcrumbSchema(route.path, route.heading || route.title));
    if (route.type === 'WebApplication' || route.type === 'SoftwareApplication') {
      graph.push({
        '@type': 'SoftwareApplication',
        name: route.heading || route.title,
        url: canonical,
        description: route.description,
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Any',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      });
    }
  }

  return { '@context': 'https://schema.org', '@graph': graph };
}

function blogStructuredData(post) {
  const path = `/blog/${post.slug}`;
  const canonical = `${siteUrl}${path}`;
  const image = absoluteUrl(post.image_url || DEFAULT_OG_IMAGE);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        '@id': `${canonical}#article`,
        headline: post.title,
        description: post.description || post.excerpt,
        image: [image],
        datePublished: post.published_at || post.created_at,
        dateModified: post.updated_at || post.published_at || post.created_at,
        author: {
          '@type': post.author && post.author !== 'FlowCreate Team' ? 'Person' : 'Organization',
          name: post.author || 'FlowCreate Team',
        },
        publisher: {
          '@type': 'Organization',
          name: SITE_NAME,
          url: siteUrl,
          logo: { '@type': 'ImageObject', url: `${siteUrl}/logo.svg` },
        },
        mainEntityOfPage: { '@id': canonical },
        inLanguage: 'en',
      },
      {
        '@type': 'WebPage',
        '@id': canonical,
        url: canonical,
        name: completeTitle(post.title),
        description: post.description || post.excerpt,
        isPartOf: { '@id': `${siteUrl}/#website` },
        primaryImageOfPage: { '@type': 'ImageObject', url: image },
        breadcrumb: { '@id': `${canonical}#breadcrumb` },
        inLanguage: 'en',
      },
      {
        ...breadcrumbSchema(path, post.title),
        '@id': `${canonical}#breadcrumb`,
      },
    ],
  };
}

function professionStructuredData(profession) {
  const path = `/resume-template/${profession.slug}`;
  const canonical = `${siteUrl}${path}`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': canonical,
        url: canonical,
        name: completeTitle(profession.title),
        description: profession.description,
        isPartOf: { '@id': `${siteUrl}/#website` },
        inLanguage: 'en',
      },
      {
        '@type': 'Product',
        name: profession.title,
        description: profession.description,
        category: profession.category,
        url: canonical,
        brand: { '@type': 'Brand', name: SITE_NAME },
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
          url: `${siteUrl}/resume-builder?template=${profession.templateKey}`,
        },
      },
      breadcrumbSchema(path, profession.title),
    ],
  };
}

function renderDocument({ path, title, description, body, schema, image, type = 'website', publishedTime, modifiedTime }) {
  const canonical = `${siteUrl}${path}`;
  const socialImage = absoluteUrl(image || DEFAULT_OG_IMAGE);
  let html = baseHtml.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(completeTitle(title))}</title>`);

  html = upsertMeta(html, 'name', 'description', description);
  html = upsertMeta(html, 'name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
  html = upsertMeta(html, 'name', 'googlebot', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
  html = upsertMeta(html, 'property', 'og:title', completeTitle(title));
  html = upsertMeta(html, 'property', 'og:description', description);
  html = upsertMeta(html, 'property', 'og:type', type);
  html = upsertMeta(html, 'property', 'og:url', canonical);
  html = upsertMeta(html, 'property', 'og:image', socialImage);
  html = upsertMeta(html, 'property', 'og:image:width', '1200');
  html = upsertMeta(html, 'property', 'og:image:height', '630');
  html = upsertMeta(html, 'property', 'og:locale', 'en_US');
  html = upsertMeta(html, 'name', 'twitter:title', completeTitle(title));
  html = upsertMeta(html, 'name', 'twitter:description', description);
  html = upsertMeta(html, 'name', 'twitter:image', socialImage);
  html = upsertMeta(html, 'name', 'twitter:url', canonical);
  if (publishedTime) html = upsertMeta(html, 'property', 'article:published_time', publishedTime);
  if (modifiedTime) html = upsertMeta(html, 'property', 'article:modified_time', modifiedTime);
  html = upsertLink(html, 'canonical', canonical);
  html = upsertLink(html, 'alternate', `${siteUrl}/rss.xml`, ' type="application/rss+xml" title="FlowCreate Blog RSS"');

  const schemaJson = JSON.stringify(schema)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
  html = html.replace(
    '</head>',
    `    <script id="seo-structured-data" type="application/ld+json">${schemaJson}</script>\n` +
      `    <style id="seo-shell-style">[data-seo-prerender]{max-width:72rem;margin:0 auto;padding:1.5rem;font-family:Inter,system-ui,sans-serif;line-height:1.65}[data-seo-prerender] [data-seo-header]{display:flex;gap:1.5rem;flex-wrap:wrap;justify-content:space-between;border-bottom:1px solid #ddd;padding-bottom:1rem}[data-seo-prerender] nav a,[data-seo-prerender] a{color:#0057d9}[data-seo-prerender] main{max-width:52rem;margin:2rem auto}[data-seo-prerender] img{max-width:100%;height:auto}[data-seo-prerender] li{margin:.4rem 0}</style>\n` +
      '  </head>',
  );

  const rootPattern = /<div\s+id=(["'])root\1\s*><\/div>/i;
  if (!rootPattern.test(html)) {
    throw new Error(`Could not locate #root while generating ${path}`);
  }
  return html.replace(
    rootPattern,
    `<div id="root"><div data-seo-prerender>${body}</div></div>`,
  );
}

function writeRoute(path, html) {
  const output =
    path === '/'
      ? templatePath
      : join(distDirectory, ...path.split('/').filter(Boolean), 'index.html');
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, html);
}

for (const route of PUBLIC_ROUTES) {
  writeRoute(
    route.path,
    renderDocument({
      path: route.path,
      title: route.title,
      description: route.description,
      body: staticRouteShell(route),
      schema: routeStructuredData(route),
    }),
  );
}

for (const post of posts) {
  const path = `/blog/${post.slug}`;
  writeRoute(
    path,
    renderDocument({
      path,
      title: post.title,
      description: post.description || post.excerpt || 'Resume tips and career advice from FlowCreate.',
      body: blogPostShell(post),
      schema: blogStructuredData(post),
      image: post.image_url,
      type: 'article',
      publishedTime: post.published_at || post.created_at,
      modifiedTime: post.updated_at || post.published_at || post.created_at,
    }),
  );
}

for (const profession of professions) {
  const path = `/resume-template/${profession.slug}`;
  writeRoute(
    path,
    renderDocument({
      path,
      title: profession.title,
      description: profession.description,
      body: professionShell(profession),
      schema: professionStructuredData(profession),
    }),
  );
}

const notFoundHtml = renderDocument({
  path: '/404',
  title: 'Page Not Found',
  description: 'The requested page could not be found.',
  body: `${sharedNavigation()}<main><h1>Page Not Found</h1><p>The requested page does not exist. <a href="/">Return to FlowCreate</a>.</p></main>`,
  schema: {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Page Not Found',
  },
}).replace(
  /content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"/g,
  'content="noindex, nofollow"',
);
writeFileSync(join(distDirectory, '404.html'), notFoundHtml);

console.log(
  `prerender: wrote ${PUBLIC_ROUTES.length + posts.length + professions.length} indexable HTML routes plus 404.html`,
);
