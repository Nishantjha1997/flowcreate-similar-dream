
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
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
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
    const context = body?.context;
    const resumeId = body?.resumeId;
    const currentContent = body?.currentContent;
    const maxTokensParam = typeof body?.maxTokens === 'number' ? body.maxTokens : undefined;

    let finalPrompt: string;

    // ── Cover letter context mode ──
    if (context === 'cover_letter' && resumeId) {
      // Fetch linked resume for context data (using the user's auth client)
      const { data: resumeData, error: resumeError } = await supabase
        .from('resumes')
        .select('resume_data')
        .eq('id', resumeId)
        .eq('user_id', userId)
        .single();

      if (resumeError || !resumeData) {
        return new Response(
          JSON.stringify({ error: 'Linked resume not found.' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const rd = resumeData.resume_data as Record<string, any>;
      const name = rd?.personal?.name || 'the applicant';
      const jobTitle = rd?.experience?.[0]?.title || 'professional';
      const skills = Array.isArray(rd?.skills) ? rd.skills.join(', ') : '';
      const summary = rd?.summary || '';

      const existingHint = currentContent
        ? `\nThe user has already drafted the following content. Improve and expand it while keeping their tone:\n"""\n${currentContent}\n"""\n`
        : '';

      finalPrompt = `Write a professional cover letter for ${name}, who is applying for a position as a ${jobTitle}.

Resume context:
- Skills: ${skills || 'Not specified'}
- Professional summary: ${summary || 'Not specified'}

${existingHint}
Write a compelling, ATS-friendly cover letter in standard business letter format. Include:
1. A strong opening paragraph expressing enthusiasm for the role
2. 1-2 body paragraphs connecting their skills and experience to the job
3. A closing paragraph with a call to action

Keep the tone professional yet warm. Do NOT include placeholder brackets — write complete, ready-to-use content.`;
    } else if (prompt && typeof prompt === 'string') {
      finalPrompt = prompt.trim();
    } else {
      return new Response(
        JSON.stringify({ error: "Either prompt or a valid context is required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (finalPrompt.length > MAX_PROMPT_LENGTH) {
      return new Response(
        JSON.stringify({ error: `Prompt must be less than ${MAX_PROMPT_LENGTH} characters.` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const trimmedPrompt = finalPrompt.trim();
    if (trimmedPrompt.length === 0) {
      return new Response(
        JSON.stringify({ error: "Prompt cannot be empty." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Plan metering (defense in depth; the UI also gates free users) ──
    // Cap comes from subscription_plans via get_user_entitlements:
    // -1 = unlimited, 0 = none (free plan). Usage is tracked in
    // usage_limits.ai_requests with a rolling 30-day reset.
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: ent } = await admin.rpc('get_user_entitlements', { p_user_id: userId });
    const rawCap = (ent as { limits?: { ai_requests_per_month?: unknown } } | null)?.limits?.ai_requests_per_month;
    const cap = typeof rawCap === 'number' ? rawCap : 0;

    const { data: usage } = await admin
      .from('usage_limits')
      .select('ai_requests, last_reset_at')
      .eq('user_id', userId)
      .maybeSingle();

    const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
    const resetDue = usage?.last_reset_at
      ? Date.now() - new Date(usage.last_reset_at).getTime() > THIRTY_DAYS_MS
      : false;
    const used = resetDue ? 0 : (usage?.ai_requests ?? 0);

    if (cap === 0) {
      return new Response(
        JSON.stringify({ error: "AI suggestions are a Premium feature. Upgrade on the Pricing page to unlock them." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (cap !== -1 && used >= cap) {
      return new Response(
        JSON.stringify({ error: `You've used all ${cap} AI suggestions in your plan for this month. Your quota resets automatically.` }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
      maxTokens: maxTokensParam || 1000,
      temperature: 0.7,
    });

    // If first provider errored, try gemini fallback key as second attempt
    if (result.text === null) {
      console.log(`[AI Suggest] ${resolved.provider} failed, trying gemini fallback`);
      const fallbackKey = await keyManager.getFallbackKey('gemini');
      if (fallbackKey) {
        result = await callTextModel('gemini', fallbackKey, trimmedPrompt, {
          maxTokens: maxTokensParam || 1000,
          temperature: 0.7,
        });
      }
    }

    if (result.text) {
      // Record usage (best-effort; a lost increment is acceptable, a blocked
      // suggestion is not — so failures here never fail the request)
      const { error: meterError } = await admin.from('usage_limits').upsert(
        {
          user_id: userId,
          ai_requests: used + 1,
          last_reset_at: resetDue || !usage?.last_reset_at ? new Date().toISOString() : usage.last_reset_at,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );
      if (meterError) console.error('[AI Suggest] usage metering failed:', meterError.message);

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
