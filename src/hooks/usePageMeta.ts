import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { SITE_URL } from '@/lib/seo';

interface PageMetaProps {
  title: string;
  description?: string;
  /** Mark the page noindex (404s, not-found states, auth pages). */
  noindex?: boolean;
  /** Override the canonical path (defaults to the current route path). */
  canonicalPath?: string;
  /** Open Graph content type. Blog articles should use "article". */
  type?: 'website' | 'article';
  /** Optional route-specific social image. Relative paths use SITE_URL. */
  image?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

const DEFAULT_TITLE = 'Free Online Resume Builder — Create Professional Resumes | FlowCreate';
const DEFAULT_DESCRIPTION =
  'Build a professional resume online free with FlowCreate. 30+ ATS-friendly templates, AI-powered suggestions, and instant PDF download. No credit card required.';

function upsertMeta(attr: 'name' | 'property', key: string, content: string): HTMLMetaElement {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
  return el;
}

function completeTitle(title: string): string {
  const value = title.trim();
  return /\bFlowCreate\b/i.test(value) ? value : `${value} | FlowCreate`;
}

function absoluteAssetUrl(value: string): string {
  if (/^https?:\/\//i.test(value)) return value;
  return `${SITE_URL}${value.startsWith('/') ? value : `/${value}`}`;
}

/**
 * Per-route document metadata: title, description, canonical, og/twitter
 * tags, and optional noindex. Everything derives from SITE_URL so the whole
 * site follows a domain change from one env var.
 */
export function usePageMeta({
  title,
  description,
  noindex,
  canonicalPath,
  type = 'website',
  image = '/og-image.png',
  publishedTime,
  modifiedTime,
}: PageMetaProps) {
  const { pathname } = useLocation();

  useEffect(() => {
    const fullTitle = title ? completeTitle(title) : DEFAULT_TITLE;
    const desc = description || DEFAULT_DESCRIPTION;
    const canonicalUrl = `${SITE_URL}${canonicalPath ?? pathname}`;
    const imageUrl = absoluteAssetUrl(image);

    document.title = fullTitle;
    upsertMeta('name', 'description', desc);

    // Canonical
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', canonicalUrl);

    // Open Graph / Twitter
    upsertMeta('property', 'og:title', fullTitle);
    upsertMeta('property', 'og:description', desc);
    upsertMeta('property', 'og:url', canonicalUrl);
    upsertMeta('property', 'og:type', type);
    upsertMeta('property', 'og:image', imageUrl);
    upsertMeta('property', 'og:image:width', '1200');
    upsertMeta('property', 'og:image:height', '630');
    upsertMeta('property', 'og:locale', 'en_US');
    upsertMeta('name', 'twitter:title', fullTitle);
    upsertMeta('name', 'twitter:description', desc);
    upsertMeta('name', 'twitter:image', imageUrl);
    upsertMeta('name', 'twitter:url', canonicalUrl);
    if (publishedTime) upsertMeta('property', 'article:published_time', publishedTime);
    if (modifiedTime) upsertMeta('property', 'article:modified_time', modifiedTime);

    // Robots
    if (noindex) {
      upsertMeta('name', 'robots', 'noindex, nofollow, noarchive');
      upsertMeta('name', 'googlebot', 'noindex, nofollow, noarchive');
    } else {
      const directives = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
      upsertMeta('name', 'robots', directives);
      upsertMeta('name', 'googlebot', directives);
    }

    return () => {
      document.title = DEFAULT_TITLE;
      upsertMeta('name', 'description', DEFAULT_DESCRIPTION);
      const directives = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
      upsertMeta('name', 'robots', directives);
      upsertMeta('name', 'googlebot', directives);
    };
  }, [title, description, noindex, canonicalPath, pathname, type, image, publishedTime, modifiedTime]);
}
