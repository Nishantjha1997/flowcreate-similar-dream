import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
}

interface RateLimitRow {
  allowed?: unknown
  remaining?: unknown
  reset_at?: unknown
}

interface FallbackEntry {
  count: number
  resetAt: number
}

const fallbackStore = new Map<string, FallbackEntry>()

function consumeFallback(identifier: string, maxRequests: number, windowMs: number): RateLimitResult {
  const now = Date.now()
  const entry = fallbackStore.get(identifier)

  if (!entry || now >= entry.resetAt) {
    const resetAt = now + windowMs
    fallbackStore.set(identifier, { count: 1, resetAt })
    return { allowed: true, remaining: Math.max(maxRequests - 1, 0), resetAt }
  }

  entry.count = Math.min(entry.count + 1, maxRequests + 1)
  return {
    allowed: entry.count <= maxRequests,
    remaining: Math.max(maxRequests - entry.count, 0),
    resetAt: entry.resetAt,
  }
}

/**
 * Atomically consumes one request from the shared Postgres rate-limit window.
 * A small in-isolate fallback is retained only for a transient database outage;
 * normal enforcement is durable across cold starts and Edge instances.
 */
export async function checkRateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number,
): Promise<RateLimitResult> {
  if (!identifier.trim() || maxRequests < 1 || windowMs < 1) {
    throw new Error('Invalid rate-limit configuration')
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    if (!supabaseUrl || !serviceRoleKey) throw new Error('Supabase service credentials are unavailable')

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
    const { data, error } = await admin.rpc('consume_rate_limit', {
      p_key: identifier,
      p_max: maxRequests,
      p_window_ms: windowMs,
    })
    if (error) throw error

    const row = (Array.isArray(data) ? data[0] : data) as RateLimitRow | null
    const allowed = row?.allowed
    const remaining = row?.remaining
    const resetAt = typeof row?.reset_at === 'string' ? Date.parse(row.reset_at) : Number.NaN
    if (
      typeof allowed !== 'boolean'
      || typeof remaining !== 'number'
      || !Number.isFinite(resetAt)
    ) {
      throw new Error('Rate-limit RPC returned an invalid shape')
    }

    return {
      allowed,
      remaining: Math.max(0, remaining),
      resetAt,
    }
  } catch (error) {
    console.error('[Rate Limit] Durable limiter unavailable; using isolate fallback', error)
    return consumeFallback(identifier, maxRequests, windowMs)
  }
}

export function rateLimitResponse(corsHeaders: Record<string, string>, resetAt: number): Response {
  const retryAfter = Math.max(1, Math.ceil((resetAt - Date.now()) / 1000))
  return new Response(
    JSON.stringify({ error: 'Too many requests. Please try again later.' }),
    {
      status: 429,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Retry-After': String(retryAfter),
      },
    },
  )
}
