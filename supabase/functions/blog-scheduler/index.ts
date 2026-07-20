// FlowCreate AI blog scheduler
//
// Cron request:
//   POST { "action": "tick" }
//   x-blog-scheduler-secret: <BLOG_SCHEDULER_SECRET>
//
// Admin manual run:
//   POST { "action": "run_now", "scheduleId": "<uuid>" }
//   Authorization: Bearer <signed-in admin JWT>

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { AIKeyManager } from "../_shared/aiKeyManager.ts";
import { callTextModel, type AIProvider } from "../_shared/aiProviders.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const BLOG_SCHEDULER_SECRET = Deno.env.get("BLOG_SCHEDULER_SECRET") ?? "";
const FALLBACK_GEMINI_KEY = Deno.env.get("GEMINI_API_KEY") ?? "";
const VERCEL_DEPLOY_HOOK_URL = Deno.env.get("VERCEL_DEPLOY_HOOK_URL") ?? "";

const MAX_CLAIMS = 3;
const MODEL_TIMEOUT_MS = 90_000;
const MODEL_MAX_TOKENS = 7_000;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ALLOWED_CATEGORIES = new Set([
  "Resume Tips",
  "Career Advice",
  "Job Search",
  "Interview Tips",
  "Industry Insights",
]);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-blog-scheduler-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface BlogSchedule {
  id: string;
  name: string;
  is_enabled: boolean;
  frequency: "daily" | "weekdays" | "weekly" | "biweekly" | "monthly";
  publish_mode: "draft" | "published";
  category: string;
  topic_prompt: string;
  keywords: string[] | null;
  author: string;
  next_run_at: string;
  consecutive_failures: number;
  max_failures: number;
}

interface ClaimedRun {
  run_id: string;
  schedule_id: string;
  scheduled_for: string;
}

interface ArticlePayload {
  title: string;
  slug: string;
  description: string;
  excerpt: string;
  keywords: string[];
  content: string;
}

interface ProcessResult {
  success: boolean;
  runId: string;
  blogPostId?: string;
  postStatus?: "draft" | "published";
}

class SchedulerError extends Error {
  code: string;
  safeMessage: string;

  constructor(code: string, safeMessage: string, internalMessage?: string) {
    super(internalMessage ?? safeMessage);
    this.name = "SchedulerError";
    this.code = code;
    this.safeMessage = safeMessage;
  }
}

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function timingSafeEqual(left: string, right: string): boolean {
  const encoder = new TextEncoder();
  const a = encoder.encode(left);
  const b = encoder.encode(right);
  const length = Math.max(a.length, b.length);
  let difference = a.length ^ b.length;

  for (let index = 0; index < length; index += 1) {
    difference |= (a[index] ?? 0) ^ (b[index] ?? 0);
  }

  return difference === 0;
}

function isCronAuthorized(req: Request): boolean {
  const supplied = req.headers.get("x-blog-scheduler-secret") ?? "";
  return (
    BLOG_SCHEDULER_SECRET.length >= 32 &&
    supplied.length > 0 &&
    timingSafeEqual(supplied, BLOG_SCHEDULER_SECRET)
  );
}

async function getAdminUserId(
  req: Request,
  adminClient: ReturnType<typeof createClient>,
): Promise<string | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.slice("Bearer ".length).trim();
  if (!token) return null;

  const { data: userData, error: userError } = await adminClient.auth.getUser(token);
  const userId = userData?.user?.id;
  if (userError || !userId) return null;

  const { data: role, error: roleError } = await adminClient
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();

  return roleError || !role ? null : userId;
}

function stripCodeFence(value: string): string {
  return value
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function cleanPlainText(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function escapeAttribute(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

function sanitizeHtml(input: string): string {
  const allowedTags = new Set([
    "p",
    "h2",
    "h3",
    "h4",
    "ul",
    "ol",
    "li",
    "strong",
    "em",
    "blockquote",
    "code",
    "pre",
    "a",
    "br",
    "hr",
  ]);

  let html = input
    .replace(/<!--([\s\S]*?)-->/g, "")
    .replace(
      /<(script|style|iframe|object|embed|svg|math|form|textarea|select|button)[^>]*>[\s\S]*?<\/\1\s*>/gi,
      "",
    )
    .replace(/<(script|style|iframe|object|embed|svg|math|form|input|textarea|select|button|link|meta)[^>]*\/?>/gi, "")
    .replace(/<\/?h1\b[^>]*>/gi, (tag) => tag.startsWith("</") ? "</h2>" : "<h2>");

  html = html.replace(/<\/?([a-z0-9-]+)\b[^>]*>/gi, (tag, rawName: string) => {
    const name = rawName.toLowerCase();
    if (!allowedTags.has(name)) return "";
    if (tag.startsWith("</")) return name === "br" || name === "hr" ? "" : `</${name}>`;
    if (name === "br" || name === "hr") return `<${name}>`;

    if (name === "a") {
      const quotedHref = tag.match(/\shref\s*=\s*(["'])(.*?)\1/i)?.[2];
      const bareHref = tag.match(/\shref\s*=\s*([^\s>]+)/i)?.[1];
      const href = (quotedHref ?? bareHref ?? "").trim();
      if (/^\/(?!\/)/.test(href) || /^#[a-z0-9_-]+$/i.test(href)) {
        return `<a href="${escapeAttribute(href)}">`;
      }
      return "<a>";
    }

    return `<${name}>`;
  });

  return html.trim();
}

function countWords(html: string): number {
  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z0-9#]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text ? text.split(" ").length : 0;
}

function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90)
    .replace(/-+$/g, "");
}

function parseArticle(rawText: string, schedule: BlogSchedule): ArticlePayload {
  const cleaned = stripCodeFence(rawText);
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace < 0 || lastBrace <= firstBrace) {
    throw new SchedulerError("invalid_ai_output", "AI returned an invalid article format");
  }

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
  } catch {
    throw new SchedulerError("invalid_ai_output", "AI returned an invalid article format");
  }

  const title = cleanPlainText(parsed.title, 180);
  const description = cleanPlainText(parsed.description, 200);
  const excerpt = cleanPlainText(parsed.excerpt, 280);
  const rawContent = typeof parsed.content === "string" ? parsed.content : "";
  const content = sanitizeHtml(rawContent);
  const wordCount = countWords(content);

  if (title.length < 20 || description.length < 80 || excerpt.length < 60) {
    throw new SchedulerError("article_validation_failed", "Generated article metadata was incomplete");
  }
  if (wordCount < 700 || !/<h2>/i.test(content) || !/<p>/i.test(content)) {
    throw new SchedulerError("article_validation_failed", "Generated article content was incomplete");
  }

  const generatedKeywords = Array.isArray(parsed.keywords)
    ? parsed.keywords.map((value) => cleanPlainText(value, 60)).filter(Boolean)
    : [];
  const scheduleKeywords = Array.isArray(schedule.keywords)
    ? schedule.keywords.map((value) => cleanPlainText(value, 60)).filter(Boolean)
    : [];
  const keywords = [...new Set([...scheduleKeywords, ...generatedKeywords])].slice(0, 12);
  const requestedSlug = cleanPlainText(parsed.slug, 120);
  const slug = slugify(requestedSlug || title);

  if (!slug) {
    throw new SchedulerError("article_validation_failed", "Generated article slug was invalid");
  }

  return { title, slug, description, excerpt, keywords, content };
}

function buildArticlePrompt(schedule: BlogSchedule, existingTitles: string[]): string {
  const keywords = (schedule.keywords ?? []).join(", ") || "resume building and career growth";
  const priorTitles = existingTitles.length
    ? existingTitles.map((title) => `- ${title}`).join("\n")
    : "- No prior titles supplied";

  return `You are the senior editor for FlowCreate, a resume builder and applicant tracking platform.
Create one original, useful, evidence-aware article for job seekers. Never invent statistics, studies, quotations, product features, or legal claims. Do not copy another publication.

Editorial brief:
- Topic focus: ${schedule.topic_prompt}
- Category: ${schedule.category}
- Target keywords: ${keywords}
- Audience: practical job seekers and career changers
- Length: 1,200 to 1,800 words
- Tone: clear, trustworthy, specific, and human
- Include a concise introduction, useful H2/H3 sections, examples or checklists, a conclusion, and one natural internal link to /resume-builder or /templates.
- Do not include an H1, images, scripts, styles, forms, iframes, tracking code, or external links.
- Avoid titles that duplicate or closely paraphrase these existing posts:
${priorTitles}

Return ONLY valid JSON. No markdown fence and no text before or after it. Use this exact shape:
{
  "title": "45-70 character SEO title",
  "slug": "lowercase-hyphen-slug",
  "description": "140-160 character meta description",
  "excerpt": "120-220 character reader summary",
  "keywords": ["5", "to", "10", "specific", "phrases"],
  "content": "semantic HTML using only p, h2, h3, h4, ul, ol, li, strong, em, blockquote, code, pre, a, br, and hr"
}`;
}

async function generateArticle(
  schedule: BlogSchedule,
  keyManager: AIKeyManager,
  existingTitles: string[],
): Promise<{ article: ArticlePayload; provider: AIProvider }> {
  const prompt = buildArticlePrompt(schedule, existingTitles);
  const providers: AIProvider[] = ["gemini", "deepseek", "openai"];

  for (const provider of providers) {
    const key = await keyManager.getActiveKey(provider);
    if (!key) continue;

    const result = await callTextModel(provider, key, prompt, {
      maxTokens: MODEL_MAX_TOKENS,
      temperature: 0.65,
      timeoutMs: MODEL_TIMEOUT_MS,
    });
    if (result.text) {
      try {
        return { article: parseArticle(result.text, schedule), provider };
      } catch (error) {
        console.error(`[blog-scheduler] ${provider} returned unusable JSON`, error);
      }
    } else {
      console.error(`[blog-scheduler] ${provider} request failed`);
    }
  }

  if (FALLBACK_GEMINI_KEY) {
    const result = await callTextModel("gemini", FALLBACK_GEMINI_KEY, prompt, {
      maxTokens: MODEL_MAX_TOKENS,
      temperature: 0.65,
      timeoutMs: MODEL_TIMEOUT_MS,
    });
    if (result.text) {
      try {
        return { article: parseArticle(result.text, schedule), provider: "gemini" };
      } catch (error) {
        console.error("[blog-scheduler] Gemini environment fallback returned unusable JSON", error);
      }
    }
  }

  throw new SchedulerError("ai_generation_failed", "AI article generation failed");
}

async function findUniqueSlug(
  adminClient: ReturnType<typeof createClient>,
  requestedSlug: string,
  runId: string,
): Promise<string> {
  const base = slugify(requestedSlug).slice(0, 90) || `career-guide-${runId.slice(0, 8)}`;
  const candidates = [
    base,
    `${base.slice(0, 81)}-${new Date().toISOString().slice(0, 10)}`,
    `${base.slice(0, 81)}-${runId.slice(0, 8)}`,
  ];

  for (const candidate of candidates) {
    const { data, error } = await adminClient
      .from("blog_posts")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();
    if (error) {
      throw new SchedulerError("database_read_failed", "Could not validate the article slug");
    }
    if (!data) return candidate;
  }

  return `${base.slice(0, 72)}-${Date.now().toString(36)}-${runId.slice(0, 6)}`;
}

async function recordFailure(
  adminClient: ReturnType<typeof createClient>,
  runId: string,
  error: unknown,
): Promise<void> {
  const failure = error instanceof SchedulerError
    ? error
    : new SchedulerError("internal_error", "Article generation failed");

  const { error: recordError } = await adminClient.rpc("fail_blog_automation_run", {
    p_run_id: runId,
    p_error_code: failure.code,
    p_error_message: failure.safeMessage,
  });

  if (recordError) {
    console.error(`[blog-scheduler] Could not record failure for run ${runId}`);
  }
}

async function requestSitemapRebuild(): Promise<void> {
  if (!VERCEL_DEPLOY_HOOK_URL) return;
  if (!VERCEL_DEPLOY_HOOK_URL.startsWith("https://api.vercel.com/v1/integrations/deploy/")) {
    console.error("[blog-scheduler] Ignored invalid Vercel deploy hook URL");
    return;
  }
  try {
    const response = await fetch(VERCEL_DEPLOY_HOOK_URL, {
      method: "POST",
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) console.error(`[blog-scheduler] Sitemap rebuild hook returned ${response.status}`);
  } catch {
    console.error("[blog-scheduler] Sitemap rebuild hook failed");
  }
}

async function processRun(
  adminClient: ReturnType<typeof createClient>,
  keyManager: AIKeyManager,
  run: ClaimedRun,
): Promise<ProcessResult> {
  try {
    const { data: rawSchedule, error: scheduleError } = await adminClient
      .from("blog_automation_schedules")
      .select(
        "id,name,is_enabled,frequency,publish_mode,category,topic_prompt,keywords,author,next_run_at,consecutive_failures,max_failures",
      )
      .eq("id", run.schedule_id)
      .maybeSingle();

    if (scheduleError || !rawSchedule) {
      throw new SchedulerError("schedule_unavailable", "Blog schedule is unavailable");
    }
    const schedule = rawSchedule as BlogSchedule;
    if (!ALLOWED_CATEGORIES.has(schedule.category)) {
      throw new SchedulerError("schedule_invalid", "Blog schedule category is invalid");
    }

    const { data: existingPosts, error: existingPostsError } = await adminClient
      .from("blog_posts")
      .select("title")
      .eq("status", "published")
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(30);
    if (existingPostsError) {
      throw new SchedulerError("database_read_failed", "Could not load existing article titles");
    }

    const existingTitles = (existingPosts ?? [])
      .map((post: { title?: string }) => cleanPlainText(post.title, 180))
      .filter(Boolean);
    const { article, provider } = await generateArticle(schedule, keyManager, existingTitles);
    const slug = await findUniqueSlug(adminClient, article.slug, run.run_id);
    const wordCount = countWords(article.content);
    const readTime = `${Math.max(1, Math.ceil(wordCount / 220))} min read`;
    const publishedAt = schedule.publish_mode === "published" ? new Date().toISOString() : null;

    let { data: post, error: postError } = await adminClient
      .from("blog_posts")
      .insert({
        slug,
        title: article.title,
        excerpt: article.excerpt,
        description: article.description,
        content: article.content,
        category: schedule.category,
        status: schedule.publish_mode,
        keywords: article.keywords,
        author: cleanPlainText(schedule.author, 120) || "FlowCreate Team",
        read_time: readTime,
        image_url: "",
        published_at: publishedAt,
      })
      .select("id")
      .single();

    // A concurrent manual run can race after the slug lookup. Retry once with a
    // run-specific suffix while keeping the unique DB constraint authoritative.
    if (postError?.code === "23505") {
      const retrySlug = `${slug.slice(0, 81)}-${run.run_id.slice(0, 8)}`;
      const retry = await adminClient
        .from("blog_posts")
        .insert({
          slug: retrySlug,
          title: article.title,
          excerpt: article.excerpt,
          description: article.description,
          content: article.content,
          category: schedule.category,
          status: schedule.publish_mode,
          keywords: article.keywords,
          author: cleanPlainText(schedule.author, 120) || "FlowCreate Team",
          read_time: readTime,
          image_url: "",
          published_at: publishedAt,
        })
        .select("id")
        .single();
      post = retry.data;
      postError = retry.error;
    }

    if (postError || !post?.id) {
      throw new SchedulerError("article_save_failed", "Generated article could not be saved");
    }

    const { data: completed, error: completionError } = await adminClient.rpc(
      "complete_blog_automation_run",
      {
        p_run_id: run.run_id,
        p_blog_post_id: post.id,
        p_provider: provider,
        p_generated_title: article.title,
      },
    );

    if (completionError || completed !== true) {
      // Avoid publishing an untracked duplicate if the execution ledger could
      // not be finalized. This post was created by this run and is safe to undo.
      await adminClient.from("blog_posts").delete().eq("id", post.id);
      throw new SchedulerError("run_finalize_failed", "Generated article could not be finalized");
    }

    return {
      success: true,
      runId: run.run_id,
      blogPostId: post.id,
      postStatus: schedule.publish_mode,
    };
  } catch (error) {
    console.error(`[blog-scheduler] Run ${run.run_id} failed`, error);
    await recordFailure(adminClient, run.run_id, error);
    return { success: false, runId: run.run_id };
  }
}

async function claimDueRuns(
  adminClient: ReturnType<typeof createClient>,
): Promise<ClaimedRun[]> {
  const { data, error } = await adminClient.rpc("claim_due_blog_automation_runs", {
    p_limit: MAX_CLAIMS,
  });
  if (error) {
    console.error("[blog-scheduler] Claim RPC failed", error);
    throw new SchedulerError("claim_failed", "Scheduled work could not be claimed");
  }
  return (data ?? []) as ClaimedRun[];
}

async function createManualRun(
  adminClient: ReturnType<typeof createClient>,
  scheduleId: string,
): Promise<ClaimedRun> {
  const oneHourAgo = new Date(Date.now() - 60 * 60_000).toISOString();
  const { count: recentManualRuns, error: rateError } = await adminClient
    .from("blog_automation_runs")
    .select("id", { count: "exact", head: true })
    .eq("trigger_source", "manual")
    .gte("created_at", oneHourAgo);
  if (rateError) {
    throw new SchedulerError("database_read_failed", "Could not check the manual run limit");
  }
  if ((recentManualRuns ?? 0) >= 10) {
    throw new SchedulerError("rate_limited", "Manual generation limit reached. Try again later.");
  }

  const { data: schedule, error: scheduleError } = await adminClient
    .from("blog_automation_schedules")
    .select("id")
    .eq("id", scheduleId)
    .maybeSingle();
  if (scheduleError || !schedule) {
    throw new SchedulerError("schedule_not_found", "Blog schedule was not found");
  }

  const scheduledFor = new Date().toISOString();
  const { data: run, error: runError } = await adminClient
    .from("blog_automation_runs")
    .insert({
      schedule_id: scheduleId,
      scheduled_for: scheduledFor,
      status: "running",
      trigger_source: "manual",
      attempt_count: 1,
      started_at: scheduledFor,
    })
    .select("id,schedule_id,scheduled_for")
    .single();
  if (runError || !run) {
    if (runError?.code === "23505") {
      throw new SchedulerError("run_in_progress", "This schedule already has a run in progress");
    }
    throw new SchedulerError("manual_run_failed", "Manual blog run could not be started");
  }

  await adminClient
    .from("blog_automation_schedules")
    .update({ last_run_at: scheduledFor })
    .eq("id", scheduleId);

  return {
    run_id: run.id,
    schedule_id: run.schedule_id,
    scheduled_for: run.scheduled_for,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("[blog-scheduler] Supabase environment is incomplete");
    return jsonResponse({ error: "Service unavailable" }, 503);
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid request" }, 400);
  }

  const action = typeof body.action === "string" ? body.action : "";
  const cronAuthorized = isCronAuthorized(req);
  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    if (action === "tick") {
      if (!cronAuthorized) return jsonResponse({ error: "Unauthorized" }, 401);

      const runs = await claimDueRuns(adminClient);
      if (runs.length === 0) {
        return jsonResponse({ success: true, claimed: 0, succeeded: 0, failed: 0 });
      }

      const keyManager = new AIKeyManager(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const results = await Promise.all(
        runs.map((run) => processRun(adminClient, keyManager, run)),
      );
      const succeeded = results.filter((result) => result.success).length;
      if (results.some((result) => result.success && result.postStatus === "published")) {
        await requestSitemapRebuild();
      }

      return jsonResponse({
        success: true,
        claimed: runs.length,
        succeeded,
        failed: runs.length - succeeded,
      });
    }

    if (action === "run_now") {
      const adminUserId = await getAdminUserId(req, adminClient);
      if (!adminUserId) return jsonResponse({ error: "Admin access required" }, 403);

      const scheduleId = typeof body.scheduleId === "string" ? body.scheduleId : "";
      if (!UUID_PATTERN.test(scheduleId)) {
        return jsonResponse({ error: "Invalid schedule" }, 400);
      }

      const run = await createManualRun(adminClient, scheduleId);
      const keyManager = new AIKeyManager(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const result = await processRun(adminClient, keyManager, run);
      if (!result.success) {
        return jsonResponse({ error: "Article generation failed", run_id: run.run_id }, 502);
      }
      if (result.postStatus === "published") await requestSitemapRebuild();

      return jsonResponse({
        success: true,
        run_id: run.run_id,
        blog_post_id: result.blogPostId,
        post_status: result.postStatus,
      });
    }

    return jsonResponse({ error: "Unsupported action" }, 400);
  } catch (error) {
    console.error("[blog-scheduler] Request failed", error);
    const status = error instanceof SchedulerError
      ? error.code === "schedule_not_found"
        ? 404
        : error.code === "rate_limited"
          ? 429
          : error.code === "run_in_progress"
            ? 409
            : 500
      : 500;
    const message = error instanceof SchedulerError ? error.safeMessage : "Internal server error";
    return jsonResponse({ error: message }, status);
  }
});
