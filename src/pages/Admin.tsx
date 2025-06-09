
import { useAuth } from "@/hooks/useAuth";
import { useAdminStatus } from "@/hooks/useAdminStatus";
import { useAllMembers } from "@/hooks/useAllMembers";
import { useUserProfiles } from "@/hooks/useUserProfiles";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { EnhancedSystemStats } from "@/components/admin/EnhancedSystemStats";
import { UserManagement } from "@/components/admin/UserManagement";
import { QuickActions } from "@/components/admin/QuickActions";
import { WebsiteCustomization } from "@/components/admin/WebsiteCustomization";
import { TemplateManagement } from "@/components/admin/TemplateManagement";
import { UserRegistrations } from "@/components/admin/UserRegistrations";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GlassCard } from "@/components/ui/glass-card";
import { Skeleton } from "@/components/ui/loading-skeleton";

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
        toast({ 
          title: "Not logged in", 
          description: "Please log in first.", 
          variant: "destructive" 
        });
        navigate("/login");
      } else if (!isAdmin) {
        toast({ 
          title: "Forbidden", 
          description: "You are not an admin.", 
          variant: "destructive" 
        });
        navigate("/");
      }
    }
  }, [userId, isAdmin, isLoading, loadingAdmin, navigate]);

  if (isLoading || loadingAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 p-8">
        <div className="max-w-7xl mx-auto">
          <GlassCard variant="elevated" className="p-8">
            <div className="space-y-6">
              <div className="space-y-3">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-96" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <Skeleton key={i} className="h-32" />
                ))}
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <GlassCard variant="elevated" className="p-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground text-lg">
              Complete website and user management system. Signed in as:{" "}
              <span className="font-semibold text-blue-600">{user?.email}</span>
            </p>
          </div>
        </GlassCard>

        <EnhancedSystemStats 
          members={members} 
          userProfiles={userProfiles}
          isLoading={loadingMembers || loadingProfiles} 
        />
        
        <GlassCard variant="elevated" className="p-6">
          <Tabs defaultValue="registrations" className="w-full">
            <TabsList className="grid w-full grid-cols-5 bg-white/50 backdrop-blur-sm border border-white/20">
              <TabsTrigger value="registrations" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
                User Registrations
              </TabsTrigger>
              <TabsTrigger value="users" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
                User Management
              </TabsTrigger>
              <TabsTrigger value="templates" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
                Templates
              </TabsTrigger>
              <TabsTrigger value="website" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
                Website
              </TabsTrigger>
              <TabsTrigger value="actions" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
                Quick Actions
              </TabsTrigger>
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
        </GlassCard>
      </div>
    </div>
  );
};

export default Admin;
