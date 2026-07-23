import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEntitlements } from '@/hooks/useEntitlements';

export function useAIQuota(userId: string | undefined) {
  const entitlements = useEntitlements(userId);
  const usage = useQuery({
    queryKey: ['ai-quota', userId],
    enabled: !!userId,
    staleTime: 30_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('usage_limits')
        .select('ai_requests,last_reset_at')
        .eq('user_id', userId!)
        .maybeSingle();
      if (error) throw error;
      const resetAt = data?.last_reset_at ? new Date(data.last_reset_at).getTime() : 0;
      const resetDue = !resetAt || Date.now() - resetAt >= 30 * 24 * 60 * 60 * 1000;
      return { used: resetDue ? 0 : data?.ai_requests ?? 0, resetDue };
    },
  });

  const cap = entitlements.data?.limits.ai_requests_per_month ?? 0;
  const used = usage.data?.used ?? 0;
  return {
    used,
    cap,
    isLoading: entitlements.isLoading || usage.isLoading,
    isUnlimited: cap === -1,
    canUse: cap === -1 || used < cap,
    isPremium: entitlements.data?.isPremium === true,
    refresh: usage.refetch,
  };
}
