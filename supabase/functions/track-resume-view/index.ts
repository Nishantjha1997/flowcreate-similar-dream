
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * track-resume-view
 * 
 * Public (--no-verify-jwt) endpoint that logs a resume view event to
 * analytics_events. Called by SharedResumeView.tsx on mount.
 *
 * Accepts: { share_token?: string, resume_id?: string }
 * Records: IP (SHA-256 hashed), user-agent, referrer, page_url
 *           in event_properties JSON.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const shareToken = body?.share_token as string | undefined;
    const resumeId = body?.resume_id as string | undefined;

    if (!shareToken && !resumeId) {
      return new Response(
        JSON.stringify({ error: "Either share_token or resume_id is required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Collect request metadata
    const userAgent = req.headers.get("user-agent") || null;
    const referrer = req.headers.get("referer") || null;
    const forwardedFor = req.headers.get("x-forwarded-for");
    const rawIp = forwardedFor?.split(",")[0]?.trim() || "unknown";

    // Hash IP with SHA-256 for privacy
    const ipHashBuffer = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(rawIp)
    );
    const ipHash = Array.from(new Uint8Array(ipHashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    // Build event properties
    const eventProperties: Record<string, unknown> = {
      ip_hash: ipHash,
      user_agent: userAgent,
      referrer: referrer,
      share_token: shareToken || null,
    };

    // Parse device info from user-agent (basic)
    if (userAgent) {
      const ua = userAgent.toLowerCase();
      if (ua.includes("mobile") || ua.includes("android") || ua.includes("iphone")) {
        eventProperties.device_type = "mobile";
      } else if (ua.includes("tablet") || ua.includes("ipad")) {
        eventProperties.device_type = "tablet";
      } else {
        eventProperties.device_type = "desktop";
      }

      // Browser detection
      if (ua.includes("edg/") || ua.includes("edge/")) {
        eventProperties.browser = "edge";
      } else if (ua.includes("chrome") && !ua.includes("edg/")) {
        eventProperties.browser = "chrome";
      } else if (ua.includes("firefox")) {
        eventProperties.browser = "firefox";
      } else if (ua.includes("safari") && !ua.includes("chrome")) {
        eventProperties.browser = "safari";
      } else {
        eventProperties.browser = "other";
      }
    }

    // Resolve resume_id from share_token if not directly provided
    let resolvedResumeId = resumeId || null;
    let resolvedUserId: string | null = null;

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    if (shareToken && !resolvedResumeId) {
      const { data: share } = await admin
        .from("resume_shares")
        .select("resume_id, user_id")
        .eq("share_token", shareToken)
        .maybeSingle();

      if (share) {
        resolvedResumeId = share.resume_id;
        resolvedUserId = share.user_id;
      }
    }

    // Insert analytics event
    const { error: insertError } = await admin
      .from("analytics_events")
      .insert({
        event_name: "resume_view",
        event_properties: eventProperties,
        page_url: shareToken
          ? `/r/${shareToken}`
          : `/resume/${resolvedResumeId}`,
        session_id: null,
        user_agent: userAgent,
        user_id: resolvedUserId,
        ip_address: null, // We store hashed IP in event_properties instead
      });

    if (insertError) {
      console.error("[track-resume-view] Insert error:", insertError.message);
      // Non-fatal; we still return success to the client
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[track-resume-view] Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
