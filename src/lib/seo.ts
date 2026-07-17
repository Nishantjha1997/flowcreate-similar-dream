// Single source of truth for the site's canonical origin.
//
// Set VITE_SITE_URL (Vercel env var) when the custom domain goes live —
// every canonical tag, og:url, sitemap entry, and JSON-LD url follows it.
// Until then we fall back to the current origin at runtime, which keeps
// preview deployments self-consistent.
export const SITE_URL: string =
  (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, '') ||
  (typeof window !== 'undefined' ? window.location.origin : 'https://flowcreate-similar-dream.vercel.app');

/** Absolute URL for a path on the canonical domain. */
export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
