
import { useAuth } from "@/hooks/useAuth";
import { useAdminStatus } from "@/hooks/useAdminStatus";
import { useAllMembers } from "@/hooks/useAllMembers";
import { useUserProfiles } from "@/hooks/useUserProfiles";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { EnhancedSystemStats } from "@/components/admin/EnhancedSystemStats";
import { UserManagement } from "@/components/admin/UserManagement";
import { QuickActions } from "@/components/admin/QuickActions";
import { WebsiteCustomization } from "@/components/admin/WebsiteCustomization";
import { TemplateManagement } from "@/components/admin/TemplateManagement";
import { UserRegistrations } from "@/components/admin/UserRegistrations";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Admin = () => {
  const { user, isLoading } = useAuth();
  const userId = user?.id;
  const navigate = useNavigate();

  const { data: isAdmin, isLoading: loadingAdmin } = useAdminStatus(userId);
  const { data: members = [], isLoading: loadingMembers, refetch } = useAllMembers(!!isAdmin);
  const { data: userProfiles = [], isLoading: loadingProfiles } = useUserProfiles(!!isAdmin);

  useEffect(() => {
    if (!isLoading && !loadingAdmin) {
      if (!userId) {
        toast({ title: "Not logged in", description: "Please log in first.", variant: "destructive" });
        navigate("/login");
      } else if (!isAdmin) {
        toast({ title: "Forbidden", description: "You are not an admin.", variant: "destructive" });
        navigate("/");
      }
    }
  }, [userId, isAdmin, isLoading, loadingAdmin, navigate]);

  if (isLoading || loadingAdmin) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded mb-4 w-64"></div>
            <div className="h-4 bg-muted rounded mb-8 w-96"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Complete website and user management system. Signed in as:{" "}
            <span className="font-semibold">{user?.email}</span>
          </p>
        </div>

        <EnhancedSystemStats 
          members={members} 
          userProfiles={userProfiles}
          isLoading={loadingMembers || loadingProfiles} 
        />
        
        <Tabs defaultValue="registrations" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="registrations">User Registrations</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="website">Website</TabsTrigger>
            <TabsTrigger value="actions">Quick Actions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="registrations" className="mt-6">
            <UserRegistrations isAdmin={!!isAdmin} />
          </TabsContent>
          
          <TabsContent value="users" className="mt-6">
            <UserManagement 
              members={members} 
              isLoading={loadingMembers} 
              refetch={refetch} 
            />
          </TabsContent>
          
          <TabsContent value="templates" className="mt-6">
            <TemplateManagement />
          </TabsContent>
          
          <TabsContent value="website" className="mt-6">
            <WebsiteCustomization />
          </TabsContent>
          
          <TabsContent value="actions" className="mt-6">
            <QuickActions refetch={refetch} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
