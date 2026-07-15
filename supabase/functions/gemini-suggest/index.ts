
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { AIKeyManager } from "../_shared/aiKeyManager.ts";
import { checkRateLimit, rateLimitResponse } from '../_shared/rateLimiter.ts';
import { getAnyActiveKey, callTextModel } from '../_shared/aiProviders.ts';

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const FALLBACK_GEMINI_KEY = Deno.env.get("GEMINI_API_KEY");

const MAX_PROMPT_LENGTH = 5000;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    // Authenticate - require valid auth token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims?.sub) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const userId = claimsData.claims.sub as string;

    // Rate limit: 10 requests per user per hour
    const rl = checkRateLimit(`gemini-suggest:${userId}`, 10, 60 * 60_000);
    if (!rl.allowed) {
      return rateLimitResponse(corsHeaders, rl.resetAt);
    }

    const body = await req.json();
    const prompt = body?.prompt;

    if (!prompt || typeof prompt !== "string") {
      return new Response(
        JSON.stringify({ error: "Prompt is required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (prompt.length > MAX_PROMPT_LENGTH) {
      return new Response(
        JSON.stringify({ error: `Prompt must be less than ${MAX_PROMPT_LENGTH} characters.` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const trimmedPrompt = prompt.trim();
    if (trimmedPrompt.length === 0) {
      return new Response(
        JSON.stringify({ error: "Prompt cannot be empty." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Resolve key: try any active provider from DB, then fall back to env GEMINI_API_KEY
    const keyManager = new AIKeyManager(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    let resolved = await getAnyActiveKey(keyManager);

    if (!resolved && FALLBACK_GEMINI_KEY) {
      console.log('[AI Suggest] No DB key found, using environment GEMINI_API_KEY');
      resolved = { provider: 'gemini', key: FALLBACK_GEMINI_KEY };
    }

    if (!resolved) {
      return new Response(
        JSON.stringify({ error: "No AI API key configured. Please add one in Admin > AI Management." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Call the resolved provider
    let result = await callTextModel(resolved.provider, resolved.key, trimmedPrompt, {
      maxTokens: 1000,
      temperature: 0.7,
    });

    // If first provider errored, try gemini fallback key as second attempt
    if (result.text === null) {
      console.log(`[AI Suggest] ${resolved.provider} failed, trying gemini fallback`);
      const fallbackKey = await keyManager.getFallbackKey('gemini');
      if (fallbackKey) {
        result = await callTextModel('gemini', fallbackKey, trimmedPrompt, {
          maxTokens: 1000,
          temperature: 0.7,
        });
      }
    }

    if (result.text) {
      return new Response(
        JSON.stringify({ suggestion: result.text }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      return new Response(
        JSON.stringify({ error: "AI service temporarily unavailable" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.log("[AI Suggest] Function error", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
