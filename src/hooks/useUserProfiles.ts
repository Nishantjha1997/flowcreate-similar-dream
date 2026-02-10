
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
  avatarUrl?: string | null;
}

interface ListUsersResponse {
  users: UserProfile[];
  total: number;
  page: number;
  perPage: number;
}

export function useUserProfiles(isAdmin: boolean) {
  return useQuery({
    queryKey: ["user-profiles", isAdmin],
    queryFn: async (): Promise<UserProfile[]> => {
      if (!isAdmin) return [];

      try {
        const { data, error } = await supabase.functions.invoke('admin-list-users', {
          method: 'GET',
        });

        if (error) {
          console.error("Error fetching users from edge function:", error);
          throw error;
        }

        return data?.users || [];
      } catch (error) {
        console.error("Error in useUserProfiles:", error);
        return [];
      }
    },
    enabled: isAdmin,
    refetchInterval: 30000,
  });
}
