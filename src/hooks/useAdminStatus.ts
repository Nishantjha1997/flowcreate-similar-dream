
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
      
      // Use the new is_admin() function instead of direct table query
      const { data, error } = await supabase.rpc('is_admin');
      
      if (error) {
        console.error("Error checking admin status:", error);
        throw error;
      }
      
      console.log("Admin status result:", { data, isAdmin: data });
      
      return !!data;
    },
    enabled: !!userId,
  });
}
