import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Production and local deployments must point at the same Supabase project.
// Keep only the public project URL as a harmless build-time fallback; never
// ship a stale or mismatched anonymous token in source control.
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ?? "https://ufzxrojekrrvlweadnkq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "makecv-local-config-missing";

if (!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) {
  console.warn(
    "[MakeCV] VITE_SUPABASE_PUBLISHABLE_KEY is not configured. Add it to .env.local for local auth/data access.",
  );
}

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Derived base URL for calling edge functions directly via fetch()
// (e.g. src/utils/ai/gemini.ts) instead of through supabase.functions.invoke.
export const SUPABASE_FUNCTIONS_URL = SUPABASE_URL.replace(
  '.supabase.co',
  '.functions.supabase.co'
);
