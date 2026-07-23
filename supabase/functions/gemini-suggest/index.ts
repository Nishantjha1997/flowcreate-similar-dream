
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { AIKeyManager } from "../_shared/aiKeyManager.ts";
import { checkRateLimit, rateLimitResponse } from '../_shared/rateLimiter.ts';
import { getAnyActiveKey, callTextModel } from '../_shared/aiProviders.ts';

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const FALLBACK_GEMINI_KEY = Deno.env.get("GEMINI_API_KEY");

// Job match analysis and JD-tailored cover letters bundle a full resume
// summary plus the entire pasted/uploaded job description into one prompt,
// which easily exceeds a few thousand characters - keep this generous.
const MAX_PROMPT_LENGTH = 24000;

type JobMatchRecommendation = {
  id: string;
  type: 'rewrite_bullet' | 'improve_summary' | 'add_skill' | 'grammar' | 'remove_repetition';
  section: 'experience' | 'personal' | 'skills';
  entryIndex?: number;
  skill?: string;
  currentText?: string;
  proposedText: string;
  reason: string;
  evidence: string[];
  confidence: number;
  requiresConfirmation: true;
};

function clamp(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.max(0, Math.min(100, Math.round(value)))
    : fallback;
}

function stringList(value: unknown, max: number): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
      .map((item) => item.trim()).slice(0, max)
    : [];
}

function normalizeJobMatch(value: unknown) {
  const raw = (value && typeof value === 'object' ? value : {}) as Record<string, unknown>;
  const breakdown = (raw.breakdown && typeof raw.breakdown === 'object' ? raw.breakdown : {}) as Record<string, unknown>;
  const allowedTypes = new Set(['rewrite_bullet', 'improve_summary', 'add_skill', 'grammar', 'remove_repetition']);
  const allowedSections = new Set(['experience', 'personal', 'skills']);
  const recommendations: JobMatchRecommendation[] = Array.isArray(raw.recommendations)
    ? raw.recommendations.flatMap((item, index) => {
      if (!item || typeof item !== 'object') return [];
      const candidate = item as Record<string, unknown>;
      const type = String(candidate.type || '');
      const section = String(candidate.section || '');
      const proposedText = typeof candidate.proposedText === 'string' ? candidate.proposedText.trim().slice(0, 2000) : '';
      if (!allowedTypes.has(type) || !allowedSections.has(section) || !proposedText) return [];
      return [{
        id: typeof candidate.id === 'string' ? candidate.id.slice(0, 80) : `recommendation-${index + 1}`,
        type: type as JobMatchRecommendation['type'],
        section: section as JobMatchRecommendation['section'],
        entryIndex: typeof candidate.entryIndex === 'number' ? Math.max(0, Math.floor(candidate.entryIndex)) : undefined,
        skill: typeof candidate.skill === 'string' ? candidate.skill.trim().slice(0, 120) : undefined,
        currentText: typeof candidate.currentText === 'string' ? candidate.currentText.slice(0, 2000) : undefined,
        proposedText,
        reason: typeof candidate.reason === 'string' ? candidate.reason.trim().slice(0, 500) : 'Suggested improvement',
        evidence: stringList(candidate.evidence, 4),
        confidence: clamp(candidate.confidence, 70) / 100,
        requiresConfirmation: true as const,
      }];
    }).slice(0, 12)
    : [];

  return {
    score: clamp(raw.score),
    breakdown: {
      skills: clamp(breakdown.skills),
      experience: clamp(breakdown.experience),
      keywords: clamp(breakdown.keywords),
      education: clamp(breakdown.education),
    },
    matchedKeywords: stringList(raw.matchedKeywords, 15),
    missingKeywords: stringList(raw.missingKeywords, 15),
    suggestions: stringList(raw.suggestions, 8),
    recommendations,
  };
}

function extractJsonObject(text: string): unknown {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return {};
  try { return JSON.parse(match[0]); } catch { return {}; }
}

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
    const { data: userData, error: claimsError } = await supabase.auth.getUser(token);
    if (claimsError || !userData?.user?.id) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const userId = userData.user.id as string;

    // Rate limit: 10 requests per user per hour
    const rl = await checkRateLimit(`gemini-suggest:${userId}`, 10, 60 * 60_000);
    if (!rl.allowed) {
      return rateLimitResponse(corsHeaders, rl.resetAt);
    }

    const body = await req.json();
    const prompt = body?.prompt;
    const context = body?.context;
    const resumeId = body?.resumeId;
    const currentContent = body?.currentContent;
    const jobDescription = body?.jobDescription;
    const resumePayload = body?.resume;
    const tone = typeof body?.tone === 'string' ? body.tone : 'professional';
    const length = typeof body?.length === 'string' ? body.length : 'standard';
    const instructions = typeof body?.instructions === 'string' ? body.instructions.slice(0, 1000) : '';
    const maxTokensParam = typeof body?.maxTokens === 'number' ? body.maxTokens : undefined;

    let finalPrompt: string;

    // ── Structured Job Match v2 ──
    if (context === 'job_match' && typeof jobDescription === 'string' && resumePayload && typeof resumePayload === 'object') {
      const rd = resumePayload as Record<string, any>;
      const experience = Array.isArray(rd.experience)
        ? rd.experience.map((e: any, i: number) => `[${i}] ${e.title || ''} at ${e.company || ''}: ${e.description || ''}`).join('\n')
        : 'Not specified';
      finalPrompt = `You are an ATS resume-matching expert. Compare the resume to the job description. Return ONLY valid JSON.

RESUME:
Summary: ${rd.personal?.summary || 'Not specified'}
Skills: ${Array.isArray(rd.skills) ? rd.skills.join(', ') : 'Not specified'}
Experience:\n${experience}
Education:\n${Array.isArray(rd.education) ? rd.education.map((e: any) => `- ${e.degree || ''}, ${e.school || ''}`).join('\n') : 'Not specified'}

JOB DESCRIPTION:\n${jobDescription.trim().slice(0, 15000)}

Return this exact shape:
{"score":0,"breakdown":{"skills":0,"experience":0,"keywords":0,"education":0},"matchedKeywords":[],"missingKeywords":[],"suggestions":[],"recommendations":[]}

Recommendations may only improve existing text or add a keyword the user can confirm. Never invent employers, dates, skills, metrics, certifications, or experience. Each recommendation must include type, section, entryIndex when experience, currentText, proposedText, reason, evidence, confidence. All recommendations require user confirmation.`;
    // ── Cover letter tailored to a job description ──
    } else if (context === 'cover_letter_from_jd' && resumeId && typeof jobDescription === 'string') {
      const trimmedJD = jobDescription.trim().slice(0, 15000);
      if (trimmedJD.length < 40) {
        return new Response(
          JSON.stringify({ error: 'Job description is too short. Paste or upload the full posting.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

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
      const summary = rd?.personal?.summary || rd?.summary || '';
      const skills = Array.isArray(rd?.skills) ? rd.skills.join(', ') : '';
      const experienceLines = Array.isArray(rd?.experience)
        ? rd.experience.map((e: any) => `- ${e.title || ''} at ${e.company || ''}: ${e.description || ''}`).join('\n')
        : '';
      const educationLines = Array.isArray(rd?.education)
        ? rd.education.map((e: any) => `- ${e.degree || ''}, ${e.school || e.institution || ''}`).join('\n')
        : '';

      finalPrompt = `You are an expert cover letter writer. Write a complete, ready-to-send, ATS-friendly cover letter for ${name}, tailored specifically to the job description below using the candidate's real resume background - do not invent experience they don't have.

CANDIDATE RESUME:
Summary: ${summary || 'Not specified'}
Skills: ${skills || 'Not specified'}
Experience:
${experienceLines || 'Not specified'}
Education:
${educationLines || 'Not specified'}

JOB DESCRIPTION:
${trimmedJD}

STYLE: tone=${['professional', 'warm', 'bold'].includes(tone) ? tone : 'professional'}; length=${['short', 'standard', 'long'].includes(length) ? length : 'standard'}.
USER INSTRUCTIONS: ${instructions || 'None'}

Write in standard business letter format:
1. A strong opening paragraph expressing genuine interest in this specific role (infer the role/company name from the job description if it's mentioned)
2. 1-2 body paragraphs directly connecting the candidate's real skills and experience above to the requirements in the job description - reference specific matching keywords from the posting
3. A closing paragraph with a clear call to action

Keep the tone professional yet warm. Do NOT include placeholder brackets like [Company Name] - infer specifics from the job description where possible, and simply omit anything you can't infer rather than leaving a placeholder. Return ONLY the finished cover letter text, no explanations, headers, or markdown.`;
    } else if (context === 'cover_letter' && resumeId) {
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
        JSON.stringify({ error: `You've used all ${cap} AI actions in your plan for 30 days. Your quota resets automatically.` }),
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
      // Consume the plan allowance only after the provider succeeds. The RPC
      // locks this user's usage row, so concurrent requests at the quota edge
      // cannot both return a suggestion or overwrite each other's increment.
      const { data: meterData, error: meterError } = await admin.rpc('consume_ai_usage', {
        p_user_id: userId,
        p_max: cap,
      });

      if (meterError) {
        console.error('[AI Suggest] durable usage metering failed:', meterError.message);
        return new Response(
          JSON.stringify({ error: 'AI usage could not be recorded. Please try again.' }),
          { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }

      const meter = (Array.isArray(meterData) ? meterData[0] : meterData) as {
        allowed?: unknown;
        usage_count?: unknown;
      } | null;
      const meterAllowed = meter?.allowed;
      const usageCount = meter?.usage_count;
      if (typeof meterAllowed !== 'boolean' || typeof usageCount !== 'number') {
        console.error('[AI Suggest] durable usage metering returned an invalid shape');
        return new Response(
          JSON.stringify({ error: 'AI usage could not be recorded. Please try again.' }),
          { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }
      if (!meterAllowed) {
        return new Response(
          JSON.stringify({ error: `You've used all ${cap} AI actions in your plan for 30 days. Your quota resets automatically.` }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }

      const jobMatch = context === 'job_match' ? normalizeJobMatch(extractJsonObject(result.text)) : null;
      return new Response(
        JSON.stringify(jobMatch ? { suggestion: JSON.stringify(jobMatch), jobMatch } : { suggestion: result.text }),
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
