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

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

// Maps notification type -> the notification_preferences column that gates it.
// Types not listed here are always delivered in-app (transactional).
const PREFERENCE_GATE: Record<string, string> = {
  ats_new_application: 'ats_new_application',
  ats_interview_scheduled: 'ats_interview_scheduled',
  ats_offer_updates: 'ats_offer_updates',
  billing_payment_success: 'billing_alerts',
  billing_payment_failed: 'billing_alerts',
  billing_subscription_canceled: 'billing_alerts',
  marketing: 'marketing_emails',
}

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

    // --- Load preferences (missing row = defaults: everything on except marketing) ---
    const { data: prefs } = await admin
      .from('notification_preferences')
      .select('*')
      .eq('user_id', user_id)
      .maybeSingle()

    const gateColumn = PREFERENCE_GATE[type]
    const categoryAllowed = !gateColumn || !prefs || prefs[gateColumn] !== false
    const inAppAllowed = (!prefs || prefs.in_app_enabled !== false) && categoryAllowed
    const emailAllowed =
      send_email === true && (!prefs || prefs.email_enabled !== false) && categoryAllowed

    let notificationId: string | undefined
    if (inAppAllowed) {
      const { data, error } = await admin
        .from('notifications')
        .insert({
          user_id,
          type,
          title,
          body: body ?? null,
          action_url: action_url ?? null,
          metadata: metadata ?? {},
        })
        .select('id')
        .single()
      if (error) {
        console.error('notification insert failed:', error.message)
        return json({ error: 'Failed to create notification' }, 500)
      }
      notificationId = data.id
    }

    // --- Optional email via Resend ---
    let emailed = false
    const resendKey = Deno.env.get('RESEND_API_KEY')
    if (emailAllowed && resendKey) {
      const { data: userResp } = await admin.auth.admin.getUserById(user_id)
      const email = userResp?.user?.email
      if (email) {
        const from = Deno.env.get('NOTIFY_FROM_EMAIL') ?? 'FlowCreate <onboarding@resend.dev>'
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from,
            to: [email],
            subject: title,
            html: `
              <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto;">
                <h2 style="color: #111;">${title}</h2>
                <p style="color: #444; line-height: 1.6;">${body ?? ''}</p>
                ${action_url ? `<p><a href="${action_url}" style="background:#6366f1;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;">View details</a></p>` : ''}
                <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
                <p style="color:#999;font-size:12px;">You can change your notification preferences in your FlowCreate account settings.</p>
              </div>`,
          }),
        })
        emailed = res.ok
        if (!res.ok) console.error('Resend send failed:', res.status, await res.text())
      }
    }

    return json({ success: true, notification_id: notificationId, emailed })
  } catch (error) {
    console.error('send-notification error:', error)
    return json({ error: 'Internal error' }, 500)
  }
})
