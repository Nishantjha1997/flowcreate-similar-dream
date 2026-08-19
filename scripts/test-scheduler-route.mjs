// Guard the Vercel cron dispatcher contract: Vercel authenticates with
// CRON_SECRET, while the Supabase worker may use BLOG_SCHEDULER_SECRET.
import { readFileSync } from 'node:fs';

const route = readFileSync(new URL('../api/blog-scheduler.js', import.meta.url), 'utf8');
const assert = (condition, message) => { if (!condition) throw new Error(message); };

assert(route.includes('acceptedAuthorizations'), 'cron route must validate an explicit authorization allow-list');
assert(route.includes('cronSecret'), 'cron route must accept Vercel CRON_SECRET');
assert(route.includes('backendSecret'), 'cron route must keep a distinct backend scheduler secret');
assert(route.includes("'x-blog-scheduler-secret': backendSecret"), 'cron route must forward the backend secret to Supabase');

console.log('scheduler route smoke checks passed');
