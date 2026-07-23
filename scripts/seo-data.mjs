import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export function loadDotEnv() {
  const envPath = join(projectRoot, '.env');
  if (!existsSync(envPath)) return;

  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][\w.-]*)\s*=\s*(.*?)\s*$/);
    if (!match) continue;

    const key = match[1];
    let value = match[2] || '';
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

function clientFallback(pattern) {
  try {
    const source = readFileSync(
      join(projectRoot, 'src', 'integrations', 'supabase', 'client.ts'),
      'utf8',
    );
    return source.match(pattern)?.[1] || null;
  } catch {
    return null;
  }
}

export function getSupabaseCredentials() {
  loadDotEnv();
  return {
    url:
      process.env.VITE_SUPABASE_URL ||
      process.env.SUPABASE_URL ||
      clientFallback(/VITE_SUPABASE_URL \?\? "([^"]+)"/),
    key:
      process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
      process.env.SUPABASE_PUBLISHABLE_KEY ||
      clientFallback(/VITE_SUPABASE_PUBLISHABLE_KEY \?\?\s*"([^"]+)"/),
  };
}

export async function fetchPublishedBlogPosts({ full = false } = {}) {
  const { url, key } = getSupabaseCredentials();
  if (!url || !key) {
    console.warn('seo: Supabase credentials unavailable; published blog posts were skipped');
    return [];
  }

  const fields = full
    ? 'slug,title,excerpt,description,content,category,read_time,published_at,created_at,updated_at,keywords,author,image_url'
    : 'slug,title,excerpt,description,category,read_time,published_at,created_at,updated_at,author,image_url';
  const endpoint =
    `${url}/rest/v1/blog_posts?select=${fields}` +
    '&status=eq.published&order=published_at.desc';

  try {
    const response = await fetch(endpoint, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const posts = await response.json();
    console.log(`seo: loaded ${posts.length} published blog posts`);
    return posts;
  } catch (error) {
    console.warn(`seo: blog fetch failed (${error.message}); continuing without blog posts`);
    return [];
  }
}

export function loadProfessions() {
  try {
    const source = readFileSync(
      join(projectRoot, 'src', 'data', 'professions.ts'),
      'utf8',
    );
    const declaration = source.indexOf('export const professions');
    const start = source.indexOf('[', declaration);
    const end = source.lastIndexOf('];');
    if (start < 0 || end < start) throw new Error('profession array was not found');

    // This evaluates only the trusted, local data array. The file contains
    // serializable object literals and no runtime imports.
    return Function(`"use strict"; return (${source.slice(start, end + 1)});`)();
  } catch (error) {
    console.warn(`seo: profession data could not be read (${error.message})`);
    return [];
  }
}
