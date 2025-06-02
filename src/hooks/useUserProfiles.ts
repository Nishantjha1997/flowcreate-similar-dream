
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useUserProfiles(isAdmin: boolean) {
  return useQuery({
    queryKey: ["user-profiles", isAdmin],
    queryFn: async () => {
      console.log("useUserProfiles called with isAdmin:", isAdmin);
      
      if (!isAdmin) {
        console.log("User is not admin, returning empty array");
        return [];
      }
      
      // Get auth users data via admin function
      const { data: authUsers, error: authError } = await supabase.rpc('get_all_users');
      
      if (authError) {
        console.error("Error fetching auth users:", authError);
        throw authError;
      }
      
      console.log("Auth users fetched:", authUsers);
      return authUsers || [];
    },
    enabled: isAdmin,
  });
}
