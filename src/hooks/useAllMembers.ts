
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Fetches all users, their roles, premium status, and resume count
export function useAllMembers(isAdmin: boolean) {
  return useQuery({
    queryKey: ["all-members", isAdmin],
    queryFn: async () => {
      if (!isAdmin) return [];
      
      // Get all user roles
      const { data: roles, error: roleErr } = await supabase
        .from("user_roles")
        .select("user_id,role");
      if (roleErr) throw roleErr;
      
      // Get all subscriptions
      const { data: subs, error: subErr } = await supabase
        .from("subscriptions")
        .select("user_id,is_premium");
      if (subErr) throw subErr;
      
      // Get all resumes
      const { data: resumes, error: resErr } = await supabase
        .from("resumes")
        .select("user_id,resume_data,id");
      if (resErr) throw resErr;

      // Collect unique user ids
      const userIds = Array.from(new Set([
        ...roles.map((r) => r.user_id),
        ...subs.map((s) => s.user_id),
        ...resumes.map((r) => r.user_id),
      ]));

      // Structure data per user
      return userIds.map((user_id) => {
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
    },
    enabled: isAdmin,
  });
}
