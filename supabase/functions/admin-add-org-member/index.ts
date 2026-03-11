import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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

    const { action, organizationId, email, userId, role, memberId } = await req.json()

    if (action === 'add') {
      // Find user by email
      const { data: authData, error: listErr } = await supabaseAdmin.auth.admin.listUsers()
      if (listErr) throw listErr

      const targetUser = authData.users.find(u => u.email === email)
      if (!targetUser) {
        return new Response(JSON.stringify({ error: 'User not found with that email' }), {
          status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Check if already a member
      const { data: existing } = await supabaseAdmin
        .from('organization_members')
        .select('id')
        .eq('organization_id', organizationId)
        .eq('user_id', targetUser.id)
        .single()

      if (existing) {
        return new Response(JSON.stringify({ error: 'User is already a member of this organization' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      const { error: insertErr } = await supabaseAdmin
        .from('organization_members')
        .insert({
          organization_id: organizationId,
          user_id: targetUser.id,
          role: role || 'member',
          invited_by: user.id,
        })

      if (insertErr) throw insertErr

      return new Response(JSON.stringify({ success: true, userId: targetUser.id }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (action === 'remove') {
      const { error: delErr } = await supabaseAdmin
        .from('organization_members')
        .delete()
        .eq('id', memberId)

      if (delErr) throw delErr

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (action === 'update-role') {
      const { error: updErr } = await supabaseAdmin
        .from('organization_members')
        .update({ role })
        .eq('id', memberId)

      if (updErr) throw updErr

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (action === 'list') {
      // Fetch members with user emails
      const { data: members, error: memErr } = await supabaseAdmin
        .from('organization_members')
        .select('*')
        .eq('organization_id', organizationId)

      if (memErr) throw memErr

      // Get emails for all member user_ids
      const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers()
      const emailMap: Record<string, string> = {}
      authUsers?.users?.forEach(u => { emailMap[u.id] = u.email || '' })

      const enriched = members.map(m => ({
        ...m,
        email: emailMap[m.user_id] || 'Unknown',
      }))

      return new Response(JSON.stringify({ members: enriched }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('admin-add-org-member error:', error)
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
