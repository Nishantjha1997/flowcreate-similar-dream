import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Reads from Vercel/local env first; falls back to the legacy hardcoded
// project so existing local setups keep working until VITE_SUPABASE_* is set.
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ?? "https://tkhnxiqvghvejdulvmmx.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRraG54aXF2Z2h2ZWpkdWx2bW14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1NzUyODksImV4cCI6MjA1OTE1MTI4OX0.sbAp0cYt7vCPTEzUvI5_IND_hsbG2vtKLsbAGR4rOJA";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Derived base URL for calling edge functions directly via fetch()
// (e.g. src/utils/ai/gemini.ts) instead of through supabase.functions.invoke.
export const SUPABASE_FUNCTIONS_URL = SUPABASE_URL.replace(
  '.supabase.co',
  '.functions.supabase.co'
);