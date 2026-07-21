// send-notification
// Internal notification dispatcher: writes an in-app notification row and
// (optionally) sends a transactional email via Resend, honouring the user's
// notification_preferences.
//
// AUTHORIZATION: this function is INTERNAL. It accepts either
//   - the service-role key as the bearer token (server-to-server calls from
//     other edge functions / cron), or
//   - a platform-admin user JWT (for admin-panel broadcasts).
// It must never be callable by regular users — they could spam other users.
//
// Request:
//   POST {
//     user_id: string,           // recipient
//     type: string,              // e.g. 'ats_new_application', 'billing_alerts'
//     title: string,
//     body?: string,
//     action_url?: string,
//     metadata?: object,
//     send_email?: boolean       // default false; true = also email via Resend
//   }
// Response: { success: true, notification_id?: string, emailed: boolean }
//
// Secrets: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY (optional),
//          NOTIFY_FROM_EMAIL (e.g. "FlowCreate <notifications@yourdomain.com>")
// Deploy:  supabase functions deploy send-notification

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { notifyUser } from '../_shared/notify.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const admin = createClient(supabaseUrl, serviceRoleKey)

    // --- Authorize: service role key OR platform-admin JWT ---
    const authHeader = req.headers.get('Authorization') ?? ''
    const token = authHeader.replace('Bearer ', '')
    if (!token) return json({ error: 'Unauthorized' }, 401)

    let authorized = token === serviceRoleKey
    if (!authorized) {
      const { data: userData } = await admin.auth.getUser(token)
      if (userData?.user) {
        const { data: roleRow } = await admin
          .from('user_roles')
          .select('id')
          .eq('user_id', userData.user.id)
          .eq('role', 'admin')
          .maybeSingle()
        authorized = !!roleRow
      }
    }
    if (!authorized) return json({ error: 'Forbidden' }, 403)

    // --- Validate input ---
    const { user_id, type, title, body, action_url, metadata, send_email } = await req.json()
    if (typeof user_id !== 'string' || !user_id) return json({ error: 'user_id required' }, 400)
    if (typeof type !== 'string' || !type.trim()) return json({ error: 'type required' }, 400)
    if (typeof title !== 'string' || !title.trim()) return json({ error: 'title required' }, 400)

    const result = await notifyUser(admin, { user_id, type, title, body, action_url, metadata, send_email })
    if (!result.success) return json({ error: result.error ?? 'Failed to create notification' }, 500)

    return json({ success: true, notification_id: result.notification_id, emailed: result.emailed })
  } catch (error) {
    console.error('send-notification error:', error)
    return json({ error: 'Internal error' }, 500)
  }
})
