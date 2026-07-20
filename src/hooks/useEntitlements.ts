import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface EntitlementLimits {
  max_resumes: number;              // -1 = unlimited
  ai_requests_per_month: number;    // -1 = unlimited, 0 = none
  premium_templates: boolean;
}

export interface Entitlements {
  plan: string;                     // subscription_plans.slug ('free', 'monthly', ...)
  isPremium: boolean;
  status: string;
  limits: EntitlementLimits;
  features: string[];
}

const FREE_ENTITLEMENTS: Entitlements = {
  plan: "free",
  isPremium: false,
  status: "active",
  limits: { max_resumes: 1, ai_requests_per_month: 0, premium_templates: false },
  features: [],
};

/**
 * Plan entitlements resolved server-side by the get_user_entitlements RPC
 * (subscription row joined to the subscription_plans catalog). Falls back to
 * the free tier on any error, so gating can never accidentally unlock.
 *
 * Complements usePremiumStatus (which stays the source of the raw boolean);
 * use this hook when you need plan LIMITS rather than just premium yes/no.
 */
export function useEntitlements(userId: string | undefined) {
  return useQuery({
    queryKey: ["entitlements", userId],
    enabled: !!userId,
    staleTime: 60_000,
    queryFn: async (): Promise<Entitlements> => {
      const { data, error } = await supabase.rpc("get_user_entitlements");
      if (error || !data || typeof data !== "object" || Array.isArray(data)) {
        return FREE_ENTITLEMENTS;
      }
      const raw = data as Record<string, unknown>;
      const rawLimits = (raw.limits ?? {}) as Record<string, unknown>;
      const isPremium = raw.is_premium === true;
      const maxResumes =
        typeof rawLimits.max_resumes === "number" ? rawLimits.max_resumes : 1;
      const aiRequests =
        typeof rawLimits.ai_requests_per_month === "number"
          ? rawLimits.ai_requests_per_month
          : 0;

      return {
        plan: typeof raw.plan === "string" ? raw.plan : "free",
        isPremium,
        status: typeof raw.status === "string" ? raw.status : "active",
        limits: {
          // Guard legacy/manual premium rows that still point at the free plan.
          // The database migration repairs these rows; this keeps paid users
          // working immediately while that migration rolls out.
          max_resumes: isPremium && maxResumes === 1 ? -1 : maxResumes,
          ai_requests_per_month: isPremium && aiRequests === 0 ? 100 : aiRequests,
          premium_templates: isPremium || rawLimits.premium_templates === true,
        },
        features: Array.isArray(raw.features)
          ? raw.features.filter((f): f is string => typeof f === "string")
          : [],
      };
    },
  });
}
