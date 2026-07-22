// self-delete-account
// Lets an authenticated user permanently delete their own account and data.
// No admin privileges required - the target is always the caller (auth.uid()),
// never a value from the request body. Mirrors admin-delete-user's manual
// deletion order (same tables, same reasoning: FKs aren't all ON DELETE CASCADE).
//
// Request:  POST (no body needed - the caller's JWT identifies the account)
// Response: { success: true } | { error: string }
// Deploy:   supabase functions deploy self-delete-account

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { checkRateLimit, rateLimitResponse } from '../_shared/rateLimiter.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    // Rate limit: 3 attempts per user per 10 minutes (irreversible action)
    const rl = await checkRateLimit(`self-delete-account:${user.id}`, 3, 10 * 60_000)
    if (!rl.allowed) {
      return rateLimitResponse(corsHeaders, rl.resetAt)
    }

    const targetUserId = user.id

    // Delete app data first (order matters for foreign keys)
    await supabaseAdmin.from('usage_limits').delete().eq('user_id', targetUserId)
    await supabaseAdmin.from('user_roles').delete().eq('user_id', targetUserId)
    await supabaseAdmin.from('subscriptions').delete().eq('user_id', targetUserId)
    await supabaseAdmin.from('resumes').delete().eq('user_id', targetUserId)
    await supabaseAdmin.from('profiles').delete().eq('user_id', targetUserId)
    await supabaseAdmin.from('organization_members').delete().eq('user_id', targetUserId)

    // Delete from auth (must be last)
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(targetUserId)

    if (deleteError) {
      return new Response(JSON.stringify({ error: deleteError.message }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('self-delete-account error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
