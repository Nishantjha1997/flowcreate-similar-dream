
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function usePremiumStatus(userId: string | undefined) {
  return useQuery({
    queryKey: ["subscription-status", userId],
    queryFn: async () => {
      if (!userId) return { isPremium: false };
      const { data, error } = await supabase
        .from("subscriptions")
        .select("is_premium")
        .eq("user_id", userId)
        .maybeSingle();
      if (error) throw error;
      return { isPremium: !!data?.is_premium };
    },
    enabled: !!userId,
  });
}
