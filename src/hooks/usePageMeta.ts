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

/**
 * Per-route document metadata: title, description, canonical, og/twitter
 * tags, and optional noindex. Everything derives from SITE_URL so the whole
 * site follows a domain change from one env var.
 */
export function usePageMeta({ title, description, noindex, canonicalPath }: PageMetaProps) {
  const { pathname } = useLocation();

  useEffect(() => {
    const fullTitle = title ? `${title} | FlowCreate` : DEFAULT_TITLE;
    const desc = description || DEFAULT_DESCRIPTION;
    const canonicalUrl = `${SITE_URL}${canonicalPath ?? pathname}`;

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

    // Open Graph / Twitter (og:image stays the site-wide default from index.html)
    upsertMeta('property', 'og:title', fullTitle);
    upsertMeta('property', 'og:description', desc);
    upsertMeta('property', 'og:url', canonicalUrl);
    upsertMeta('name', 'twitter:title', fullTitle);
    upsertMeta('name', 'twitter:description', desc);

    // Robots
    if (noindex) {
      upsertMeta('name', 'robots', 'noindex, nofollow');
    } else {
      upsertMeta('name', 'robots', 'index, follow');
    }

    return () => {
      document.title = DEFAULT_TITLE;
      upsertMeta('name', 'description', DEFAULT_DESCRIPTION);
      upsertMeta('name', 'robots', 'index, follow');
    };
  }, [title, description, noindex, canonicalPath, pathname]);
}
