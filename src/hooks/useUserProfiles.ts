
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
      
      // For now, we'll use mock data since we don't have access to auth.users table
      // In a real implementation, you'd need a custom function to get user data
      const mockUserData: UserProfile[] = [
        {
          id: "1",
          email: "john.doe@example.com",
          firstName: "John",
          lastName: "Doe",
          createdAt: "2024-01-15T10:30:00Z",
          lastSignIn: "2024-01-20T14:22:00Z",
          emailConfirmed: true,
          status: "active"
        },
        {
          id: "2", 
          email: "jane.smith@example.com",
          firstName: "Jane",
          lastName: "Smith",
          createdAt: "2024-01-18T09:15:00Z",
          lastSignIn: "2024-01-19T16:45:00Z",
          emailConfirmed: true,
          status: "active"
        },
        {
          id: "3",
          email: "pending.user@example.com",
          firstName: "Pending",
          lastName: "User",
          createdAt: "2024-01-20T11:00:00Z",
          lastSignIn: null,
          emailConfirmed: false,
          status: "pending"
        }
      ];
      
      console.log("Mock user data:", mockUserData);
      return mockUserData;
    },
    enabled: isAdmin,
  });
}
