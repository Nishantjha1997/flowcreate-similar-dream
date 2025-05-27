
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Returns true if the current user is an "admin"
export function useAdminStatus(userId: string | undefined) {
  return useQuery({
    queryKey: ["admin-status", userId],
    queryFn: async () => {
      if (!userId) return false;
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();
      if (error) throw error;
      return !!data && data.role === "admin";
    },
    enabled: !!userId,
  });
}
