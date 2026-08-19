// Ensure browser bundles cannot read or call provider secrets directly.
import { readFileSync } from 'node:fs';

const universal = readFileSync(new URL('../src/utils/ai/universalAIGenerator.ts', import.meta.url), 'utf8');
const apiKeysHook = readFileSync(new URL('../src/hooks/useAIApiKeys.ts', import.meta.url), 'utf8');

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

assert(universal.includes("functions.invoke('gemini-suggest'"), 'universal AI generation must use the authenticated Edge Function');
assert(!/https:\/\/(api\.deepseek|api\.openai|generativelanguage\.googleapis)/.test(universal), 'universal AI generation must not call providers from the browser');
assert(!universal.includes("from('ai_api_keys'"), 'universal AI generation must not read provider secrets from Supabase in the browser');
assert(!apiKeysHook.includes('testProviderDirectly'), 'draft provider tests must not send keys directly from the browser');

console.log('AI secret-boundary smoke checks passed');
