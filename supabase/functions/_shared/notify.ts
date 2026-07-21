import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Core notification logic shared by send-notification (the HTTP-callable
// dispatcher for admin/external callers) and any edge function that wants to
// notify a user server-to-server (payment webhooks, etc). Keeping this in one
// place means every caller gets the same preference-gating and email
// behavior instead of some callers raw-inserting into `notifications` and
// silently skipping the Resend email entirely.

export interface NotifyParams {
  user_id: string
  type: string
  title: string
  body?: string
  action_url?: string
  metadata?: Record<string, unknown>
  send_email?: boolean
}

export interface NotifyResult {
  success: boolean
  notification_id?: string
  emailed: boolean
  error?: string
}

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

export async function notifyUser(admin: SupabaseClient, params: NotifyParams): Promise<NotifyResult> {
  const { user_id, type, title, body, action_url, metadata, send_email } = params

  const { data: prefs } = await admin
    .from('notification_preferences')
    .select('*')
    .eq('user_id', user_id)
    .maybeSingle()

  const gateColumn = PREFERENCE_GATE[type]
  const categoryAllowed = !gateColumn || !prefs || prefs[gateColumn] !== false
  const inAppAllowed = (!prefs || prefs.in_app_enabled !== false) && categoryAllowed
  const emailAllowed = send_email === true && (!prefs || prefs.email_enabled !== false) && categoryAllowed

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
      return { success: false, emailed: false, error: 'Failed to create notification' }
    }
    notificationId = data.id
  }

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

  return { success: true, notification_id: notificationId, emailed }
}
