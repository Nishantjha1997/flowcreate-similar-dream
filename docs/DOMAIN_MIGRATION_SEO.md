# SEO-Safe Custom Domain Migration

The application has one canonical-origin setting: `VITE_SITE_URL`. The sitemap,
RSS feed, canonical links, Open Graph URLs, and structured data are generated
from it. Keep page paths and slugs unchanged during a domain move.

## Before the move

1. Add and verify the new domain in Vercel.
2. Add both the old URL-prefix property and the new domain property in Google
   Search Console. Keep the existing verification HTML file in `public/`.
3. Export the current Search Console Performance and Pages reports as a
   baseline.
4. Confirm the new domain serves HTTPS and that every existing path works on
   the new host.

## Launch

1. Set the Vercel Production environment variable:

   `VITE_SITE_URL=https://www.example.com`

2. Deploy once. Confirm the new sitemap and every canonical use the new origin.
3. Add a host-level permanent redirect in Vercel from the old
   `flowcreate-similar-dream.vercel.app` hostname to the same path on the new
   domain. Use a 308 or 301 response, preserve the path and query string, and do
   not redirect every page to the homepage.
4. Keep the old Vercel project and redirects active for at least 12 months;
   indefinitely is better.
5. Submit `https://www.example.com/sitemap.xml` in the new Search Console
   property and use Search Console's Change of Address tool when it is
   available for the property type.

## Verify after launch

- Old URL returns one permanent redirect to the matching new URL.
- New URL returns `200`.
- Canonical points to the new URL itself.
- `robots.txt` references the new sitemap.
- Sitemap contains only new-domain URLs.
- No redirect chains, redirect loops, blanket homepage redirects, or accidental
  `noindex` headers exist.
- Search Console Pages, Sitemaps, HTTPS, Core Web Vitals, and Manual Actions
  reports remain clean.

Rankings can fluctuate temporarily during any domain migration, but matching
one-to-one permanent redirects, unchanged paths/content, self-canonicals, and
continued Search Console verification give Google the clearest possible
migration signal.
