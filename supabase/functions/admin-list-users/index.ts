import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { checkRateLimit, rateLimitResponse } from '../_shared/rateLimiter.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Verify auth
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Check admin
    const { data: userRole } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single()

    if (!userRole) {
      return new Response(JSON.stringify({ error: 'Insufficient permissions' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Rate limit: 20 requests per admin per minute
    const rl = checkRateLimit(`admin-list-users:${user.id}`, 20, 60_000)
    if (!rl.allowed) {
      return rateLimitResponse(corsHeaders, rl.resetAt)
    }

    // Parse pagination params
    const url = new URL(req.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const perPage = Math.min(parseInt(url.searchParams.get('per_page') || '100'), 1000)

    // Fetch users from auth using admin API
    const { data: authData, error: listError } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage,
    })

    if (listError) {
      return new Response(JSON.stringify({ error: listError.message }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Fetch roles and subscriptions
    const userIds = authData.users.map(u => u.id)

    const [rolesResult, subsResult, profilesResult] = await Promise.all([
      supabaseAdmin.from('user_roles').select('user_id, role').in('user_id', userIds),
      supabaseAdmin.from('subscriptions').select('user_id, is_premium').in('user_id', userIds),
      supabaseAdmin.from('profiles').select('user_id, full_name, avatar_url').in('user_id', userIds),
    ])

    const rolesMap: Record<string, string[]> = {}
    rolesResult.data?.forEach(r => {
      if (!rolesMap[r.user_id]) rolesMap[r.user_id] = []
      rolesMap[r.user_id].push(r.role)
    })

    const subsMap: Record<string, boolean> = {}
    subsResult.data?.forEach(s => { subsMap[s.user_id] = s.is_premium })

    const profilesMap: Record<string, { full_name: string | null; avatar_url: string | null }> = {}
    profilesResult.data?.forEach(p => { profilesMap[p.user_id] = { full_name: p.full_name, avatar_url: p.avatar_url } })

    const users = authData.users.map(u => {
      const meta = u.user_metadata || {}
      const profile = profilesMap[u.id]
      const fullName = profile?.full_name || `${meta.first_name || ''} ${meta.last_name || ''}`.trim()
      const nameParts = fullName.split(' ')

      return {
        id: u.id,
        email: u.email || '',
        firstName: nameParts[0] || 'User',
        lastName: nameParts.slice(1).join(' ') || '',
        createdAt: u.created_at,
        lastSignIn: u.last_sign_in_at || null,
        emailConfirmed: !!u.email_confirmed_at,
        status: rolesMap[u.id]?.length ? 'active' : 'pending',
        roles: rolesMap[u.id] || [],
        isPremium: subsMap[u.id] || false,
        avatarUrl: profile?.avatar_url || meta.avatar_url || null,
      }
    })

    return new Response(JSON.stringify({
      users,
      total: authData.total || users.length,
      page,
      perPage,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('admin-list-users error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
