// blog-ai
// Admin-only AI text generation for the Blog Manager (article generation,
// SEO audit, beautify, inline rewrite). Separate from gemini-suggest so that:
//   - the prompt cap can be large (full-article HTML in/out), and
//   - blog authoring never consumes a user's resume-AI quota, and
//   - only admins can call it.
// Reuses the shared multi-provider resolver, so a Gemini, DeepSeek, or OpenAI
// key configured in Admin > AI Management all work.
//
// Request:  POST { prompt: string, maxTokens?: number }
// Response: { suggestion: string } | { error: string }
// Deploy:   supabase functions deploy blog-ai   (JWT verification ON — default)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { AIKeyManager } from "../_shared/aiKeyManager.ts";
import { checkRateLimit, rateLimitResponse } from '../_shared/rateLimiter.ts';
import { getAnyActiveKey, callTextModel } from '../_shared/aiProviders.ts';

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const FALLBACK_GEMINI_KEY = Deno.env.get("GEMINI_API_KEY");

// Blog operations legitimately send whole-article HTML (audit/beautify) — much
// larger than the resume-suggestion path allows.
const MAX_PROMPT_LENGTH = 24000;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Identify the caller from their JWT.
    const authClient = createClient(
      SUPABASE_URL,
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );
    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await authClient.auth.getUser(token);
    if (userError || !userData?.user?.id) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const userId = userData.user.id;

    // Admin gate (service-role client bypasses RLS to read the role).
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: adminRole } = await admin
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();
    if (!adminRole) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Rate limit: 30 blog-AI operations per admin per hour.
    const rl = await checkRateLimit(`blog-ai:${userId}`, 30, 60 * 60_000);
    if (!rl.allowed) return rateLimitResponse(corsHeaders, rl.resetAt);

    const body = await req.json();
    const prompt = typeof body?.prompt === 'string' ? body.prompt.trim() : '';
    const maxTokens = typeof body?.maxTokens === 'number' ? body.maxTokens : 4000;

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    if (prompt.length > MAX_PROMPT_LENGTH) {
      return new Response(
        JSON.stringify({ error: `Prompt must be less than ${MAX_PROMPT_LENGTH} characters.` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Resolve a provider key: any active DB key, then env GEMINI_API_KEY.
    const keyManager = new AIKeyManager(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    let resolved = await getAnyActiveKey(keyManager);
    if (!resolved && FALLBACK_GEMINI_KEY) {
      resolved = { provider: 'gemini', key: FALLBACK_GEMINI_KEY };
    }
    if (!resolved) {
      return new Response(
        JSON.stringify({ error: 'No AI API key configured. Add one in Admin > AI Management.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let result = await callTextModel(resolved.provider, resolved.key, prompt, {
      maxTokens,
      temperature: 0.7,
    });

    // If the first provider errored, try a Gemini fallback key.
    if (result.text === null) {
      console.log(`[blog-ai] ${resolved.provider} failed: ${result.error}; trying gemini fallback`);
      const fallbackKey = await keyManager.getFallbackKey('gemini');
      if (fallbackKey) {
        result = await callTextModel('gemini', fallbackKey, prompt, { maxTokens, temperature: 0.7 });
      }
    }

    if (result.text) {
      return new Response(
        JSON.stringify({ suggestion: result.text }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    return new Response(
      JSON.stringify({ error: result.error || 'AI service temporarily unavailable' }),
      { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.log('[blog-ai] Function error', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
