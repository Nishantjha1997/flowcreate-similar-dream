
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Fetches all users, their roles, premium status, and resume count
export function useAllMembers(isAdmin: boolean) {
  return useQuery({
    queryKey: ["all-members", isAdmin],
    queryFn: async () => {
      console.log("useAllMembers called with isAdmin:", isAdmin);
      
      if (!isAdmin) {
        console.log("User is not admin, returning empty array");
        return [];
      }
      
      // Get all user roles
      const { data: roles, error: roleErr } = await supabase
        .from("user_roles")
        .select("user_id,role");
      if (roleErr) {
        console.error("Error fetching roles:", roleErr);
        throw roleErr;
      }
      console.log("Roles fetched:", roles);
      
      // Get all subscriptions
      const { data: subs, error: subErr } = await supabase
        .from("subscriptions")
        .select("user_id,is_premium");
      if (subErr) {
        console.error("Error fetching subscriptions:", subErr);
        throw subErr;
      }
      console.log("Subscriptions fetched:", subs);
      
      // Get all resumes
      const { data: resumes, error: resErr } = await supabase
        .from("resumes")
        .select("user_id,resume_data,id");
      if (resErr) {
        console.error("Error fetching resumes:", resErr);
        throw resErr;
      }
      console.log("Resumes fetched:", resumes);

      // Collect unique user ids
      const userIds = Array.from(new Set([
        ...roles.map((r) => r.user_id),
        ...subs.map((s) => s.user_id),
        ...resumes.map((r) => r.user_id),
      ]));
      console.log("Unique user IDs:", userIds);

      // Structure data per user
      const result = userIds.map((user_id) => {
        const userRoles = roles.filter(r => r.user_id === user_id).map(r => r.role);
        const sub = subs.find(s => s.user_id === user_id);
        const userResumes = resumes.filter(r => r.user_id === user_id);
        return {
          user_id,
          roles: userRoles,
          is_premium: !!sub && !!sub.is_premium,
          resume_count: userResumes.length,
          resumes: userResumes,
          email: null, // Email not available from client-side queries to auth.users
        };
      });
      
      console.log("Final result:", result);
      return result;
    },
    enabled: isAdmin,
  });
}
