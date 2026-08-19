import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
};

type Resource = 'ai' | 'payment';
const aiProviders = new Set(['openai', 'gemini', 'deepseek']);
const paymentProviders = new Set(['razorpay', 'stripe']);

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function mask(value: unknown): string | null {
  if (typeof value !== 'string' || !value) return null;
  if (value.length <= 8) return '••••••••';
  return `${value.slice(0, 4)}${'•'.repeat(Math.min(24, Math.max(4, value.length - 8)))}${value.slice(-4)}`;
}

function resourceFrom(value: unknown): Resource | null {
  return value === 'ai' || value === 'payment' ? value : null;
}

async function requireAdmin(req: Request) {
  const token = req.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return null;
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  const { data: userData } = await admin.auth.getUser(token);
  const user = userData.user;
  if (!user) return null;
  const { data: role } = await admin
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .eq('role', 'admin')
    .maybeSingle();
  return role ? { client: admin, user } : null;
}

function safeAi(row: Record<string, unknown>) {
  const { key, ...metadata } = row;
  return { ...metadata, has_secret: Boolean(key), key_masked: mask(key) };
}

function safePayment(row: Record<string, unknown>) {
  const { key_secret, webhook_secret, ...metadata } = row;
  return {
    ...metadata,
    has_secret: Boolean(key_secret),
    has_webhook_secret: Boolean(webhook_secret),
    key_secret_masked: mask(key_secret),
    webhook_secret_masked: mask(webhook_secret),
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  const auth = await requireAdmin(req);
  if (!auth) return json({ error: 'Admin authorization required' }, 403);

  try {
    // supabase.functions.invoke() always sends POST regardless of semantic intent.
    // We parse the body for all requests and derive the operation from body fields.
    const body = req.method === 'GET' ? {} : await req.json().catch(() => ({}));

    // Resource can come from body or query string.
    const resource = resourceFrom(body.resource ?? new URL(req.url).searchParams.get('resource'));
    if (!resource) return json({ error: 'resource must be ai or payment' }, 400);
    const table = resource === 'ai' ? 'ai_api_keys' : 'payment_gateway_keys';

    // ── LIST (no action, no id, no provider = fetch all rows) ────────────────
    // Also handles GET method from non-JS clients.
    if (req.method === 'GET' || (!body.action && !body.id && !body.provider)) {
      const { data, error } = await auth.client.from(table).select('*').order(resource === 'ai' ? 'created_at' : 'provider');
      if (error) throw error;
      return json({ data: (data ?? []).map((row) => resource === 'ai' ? safeAi(row) : safePayment(row)) });
    }

    // ── DELETE ───────────────────────────────────────────────────────────────
    if (req.method === 'DELETE' || body.action === 'delete') {
      if (typeof body.id !== 'string') return json({ error: 'id is required' }, 400);
      const { error } = await auth.client.from(table).delete().eq('id', body.id);
      if (error) throw error;
      return json({ ok: true });
    }

    // ── PATCH (activate / deactivate) ────────────────────────────────────────
    if (req.method === 'PATCH') {
      if (typeof body.id !== 'string' || !body.updates || typeof body.updates !== 'object') {
        return json({ error: 'id and updates are required' }, 400);
      }
      const updates = { is_active: Boolean((body.updates as Record<string, unknown>).is_active) };
      const { data, error } = await auth.client.from(table).update(updates).eq('id', body.id).select('*').single();
      if (error) throw error;
      return json({ data: resource === 'ai' ? safeAi(data) : safePayment(data) });
    }

    // ── POST actions ─────────────────────────────────────────────────────────
    if (body.action === 'toggle-active') {
      if (typeof body.id !== 'string') return json({ error: 'id is required' }, 400);
      const { data, error } = await auth.client.from(table).update({ is_active: Boolean(body.is_active) }).eq('id', body.id).select('*').single();
      if (error) throw error;
      return json({ data: resource === 'ai' ? safeAi(data) : safePayment(data) });
    }

    if (body.action === 'set-primary' || body.action === 'set-fallback') {
      if (resource !== 'ai' || typeof body.id !== 'string') return json({ error: 'Invalid AI provider action' }, 400);
      const field = body.action === 'set-primary' ? 'is_primary' : 'is_fallback';
      const { error: clearError } = await auth.client.from(table).update({ [field]: false }).neq('id', '00000000-0000-0000-0000-000000000000');
      if (clearError) throw clearError;
      const { data, error } = await auth.client.from(table).update({ [field]: true, is_active: true }).eq('id', body.id).select('*').single();
      if (error) throw error;
      return json({ data: safeAi(data) });
    }

    // ── INSERT new key ───────────────────────────────────────────────────────
    const allowedProviders = resource === 'ai' ? aiProviders : paymentProviders;
    if (typeof body.provider !== 'string' || !allowedProviders.has(body.provider)) {
      return json({ error: 'Unsupported provider' }, 400);
    }

    if (resource === 'ai') {
      if (typeof body.name !== 'string' || !body.name.trim() || typeof body.key !== 'string' || !body.key.trim()) {
        return json({ error: 'name and key are required' }, 400);
      }
      const { data, error } = await auth.client.from(table).insert({
        name: body.name.trim().slice(0, 120), provider: body.provider, key: body.key.trim(),
        is_active: true, is_primary: false, is_fallback: false, usage_count: 0,
      }).select('*').single();
      if (error) throw error;
      return json({ data: safeAi(data) }, 201);
    }

    // Payment gateway upsert
    if (body.key_secret !== undefined && typeof body.key_secret !== 'string') {
      return json({ error: 'key_secret must be a string' }, 400);
    }
    const payload: Record<string, unknown> = {
      provider: body.provider, is_live: Boolean(body.is_live), is_active: true,
    };
    if (typeof body.key_id === 'string' && body.key_id.trim()) payload.key_id = body.key_id.trim();
    if (typeof body.key_secret === 'string' && body.key_secret.trim()) payload.key_secret = body.key_secret.trim();
    if (typeof body.webhook_secret === 'string' && body.webhook_secret.trim()) payload.webhook_secret = body.webhook_secret.trim();
    const { data, error } = await auth.client.from(table).upsert(payload, { onConflict: 'provider' }).select('*').single();
    if (error) throw error;
    return json({ data: safePayment(data) }, 201);

  } catch (error) {
    console.error('admin-provider-secrets failed', error);
    return json({ error: error instanceof Error ? error.message : 'Request failed' }, 500);
  }
});
