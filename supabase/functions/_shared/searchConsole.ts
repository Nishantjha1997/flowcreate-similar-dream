const SEARCH_CONSOLE_SCOPE = 'https://www.googleapis.com/auth/webmasters';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const API_BASE = 'https://searchconsole.googleapis.com/webmasters/v3';

function base64Url(value: Uint8Array | string): string {
  const bytes = typeof value === 'string' ? new TextEncoder().encode(value) : value;
  let binary = '';
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function decodePem(pem: string): ArrayBuffer {
  const base64 = pem.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g, '');
  const binary = atob(base64);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0)).buffer;
}

type ServiceAccount = { client_email?: string; private_key?: string };

async function accessToken(account: ServiceAccount): Promise<string> {
  if (!account.client_email || !account.private_key) throw new Error('Search Console service account is incomplete');
  const now = Math.floor(Date.now() / 1000);
  const unsigned = `${base64Url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))}.${base64Url(JSON.stringify({ iss: account.client_email, scope: SEARCH_CONSOLE_SCOPE, aud: TOKEN_URL, iat: now, exp: now + 3600 }))}`;
  const key = await crypto.subtle.importKey('pkcs8', decodePem(account.private_key), { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(unsigned));
  const response = await fetch(TOKEN_URL, {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${unsigned}.${base64Url(new Uint8Array(signature))}` }),
  });
  if (!response.ok) throw new Error(`Search Console token request failed (${response.status})`);
  const data = await response.json();
  if (typeof data.access_token !== 'string') throw new Error('Search Console token was missing');
  return data.access_token;
}

export async function submitSitemapToSearchConsole(): Promise<{ submitted: boolean; reason?: string }> {
  const raw = Deno.env.get('GOOGLE_SEARCH_CONSOLE_SERVICE_ACCOUNT_JSON');
  if (!raw) return { submitted: false, reason: 'not_configured' };
  const configuredSiteUrl = Deno.env.get('GOOGLE_SEARCH_CONSOLE_SITE_URL') ?? 'https://makecv.site/';
  const siteUrl = configuredSiteUrl.endsWith('/') ? configuredSiteUrl : `${configuredSiteUrl}/`;
  const sitemapUrl = Deno.env.get('GOOGLE_SEARCH_CONSOLE_SITEMAP_URL') ?? 'https://makecv.site/sitemap.xml';
  let account: ServiceAccount;
  try { account = JSON.parse(raw) as ServiceAccount; } catch { throw new Error('Search Console service account JSON is invalid'); }
  const token = await accessToken(account);
  const endpoint = `${API_BASE}/sites/${encodeURIComponent(siteUrl)}/sitemaps/${encodeURIComponent(sitemapUrl)}`;
  const response = await fetch(endpoint, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } });
  if (!response.ok) throw new Error(`Search Console sitemap submission failed (${response.status})`);
  return { submitted: true };
}
