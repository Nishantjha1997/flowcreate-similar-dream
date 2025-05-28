
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Returns true if the current user is an "admin"
export function useAdminStatus(userId: string | undefined) {
  return useQuery({
    queryKey: ["admin-status", userId],
    queryFn: async () => {
      console.log("useAdminStatus called with userId:", userId);
      
      if (!userId) {
        console.log("No userId provided, returning false");
        return false;
      }
      
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();
      
      if (error) {
        console.error("Error checking admin status:", error);
        throw error;
      }
      
      const isAdmin = !!data && data.role === "admin";
      console.log("Admin status result:", { data, isAdmin });
      
      return isAdmin;
    },
    enabled: !!userId,
  });
}
