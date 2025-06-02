
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  lastSignIn: string | null;
  emailConfirmed: boolean;
  status: string;
  roles?: string[];
  isPremium?: boolean;
}

export function useUserProfiles(isAdmin: boolean) {
  return useQuery({
    queryKey: ["user-profiles", isAdmin],
    queryFn: async (): Promise<UserProfile[]> => {
      console.log("useUserProfiles called with isAdmin:", isAdmin);
      
      if (!isAdmin) {
        console.log("User is not admin, returning empty array");
        return [];
      }
      
      try {
        // Get all user roles
        const { data: userRoles, error: rolesError } = await supabase
          .from("user_roles")
          .select("user_id, role");
        
        if (rolesError) {
          console.error("Error fetching user roles:", rolesError);
          throw rolesError;
        }
        
        // Get all subscriptions
        const { data: subscriptions, error: subsError } = await supabase
          .from("subscriptions")
          .select("user_id, is_premium, created_at, updated_at");
        
        if (subsError) {
          console.error("Error fetching subscriptions:", subsError);
          throw subsError;
        }
        
        // Get all resumes to identify users
        const { data: resumes, error: resumesError } = await supabase
          .from("resumes")
          .select("user_id, created_at");
        
        if (resumesError) {
          console.error("Error fetching resumes:", resumesError);
          throw resumesError;
        }
        
        // Collect all unique user IDs
        const userIds = new Set<string>();
        userRoles?.forEach(role => userIds.add(role.user_id));
        subscriptions?.forEach(sub => userIds.add(sub.user_id));
        resumes?.forEach(resume => userIds.add(resume.user_id));
        
        // Create profiles from collected data
        const userProfiles: UserProfile[] = Array.from(userIds).map(userId => {
          const userRolesList = userRoles?.filter(role => role.user_id === userId).map(role => role.role) || [];
          const userSubscription = subscriptions?.find(sub => sub.user_id === userId);
          const userResume = resumes?.find(resume => resume.user_id === userId);
          
          return {
            id: userId,
            email: `user-${userId.substring(0, 8)}@example.com`,
            firstName: "User",
            lastName: userId.substring(0, 8),
            createdAt: userSubscription?.created_at || userResume?.created_at || new Date().toISOString(),
            lastSignIn: null,
            emailConfirmed: true,
            status: userRolesList.length > 0 ? "active" : "pending",
            roles: userRolesList,
            isPremium: userSubscription?.is_premium || false
          };
        });
        
        console.log("User profiles found:", userProfiles);
        return userProfiles;
        
      } catch (error) {
        console.error("Error in useUserProfiles:", error);
        return [];
      }
    },
    enabled: isAdmin,
    refetchInterval: 30000, // Refresh every 30 seconds for real-time updates
  });
}
