import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.0';
import { callTextModel, type AIProvider } from '../_shared/aiProviders.ts';

const url = Deno.env.get('SUPABASE_URL') ?? '';
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const token = req.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');
    if (!token) return json({ error: 'Admin authorization required' }, 403);
    const admin = createClient(url, serviceRoleKey);
    const { data: userData } = await admin.auth.getUser(token);
    if (!userData.user) return json({ error: 'Admin authorization required' }, 403);
    const { data: role } = await admin.from('user_roles').select('role').eq('user_id', userData.user.id).eq('role', 'admin').maybeSingle();
    if (!role) return json({ error: 'Admin authorization required' }, 403);
    const body = await req.json().catch(() => ({}));
    if (typeof body.id !== 'string') return json({ error: 'Provider id is required' }, 400);
    const { data: row } = await admin.from('ai_api_keys').select('provider,key').eq('id', body.id).eq('is_active', true).maybeSingle();
    if (!row) return json({ error: 'Active provider key not found' }, 404);
    const provider = row.provider as AIProvider;
    if (!['gemini', 'deepseek', 'openai'].includes(provider)) return json({ error: 'Unsupported provider' }, 400);
    const result = await callTextModel(provider, row.key, 'Reply with exactly: MakeCV connection OK', { maxTokens: 16, temperature: 0, timeoutMs: 15000 });
    if (!result.text) return json({ ok: false, provider, error: result.error ?? 'Provider returned no text' }, 502);
    return json({ ok: true, provider, message: result.text.slice(0, 120) });
  } catch (error) {
    console.error('test-ai-provider failed', error);
    return json({ error: 'Provider test failed' }, 500);
  }
});
