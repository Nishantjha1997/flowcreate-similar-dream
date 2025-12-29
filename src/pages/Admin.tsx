import { useAuth } from "@/hooks/useAuth";
import { useAdminStatus } from "@/hooks/useAdminStatus";
import { useAllMembers } from "@/hooks/useAllMembers";
import { useUserProfiles } from "@/hooks/useUserProfiles";
import { useNavigate, Link } from "react-router-dom";
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
import { ImprovementPlans } from "@/components/admin/ImprovementPlans";
import { ContentManagement } from "@/components/admin/ContentManagement";
import { SecuritySettings } from "@/components/admin/SecuritySettings";
import { AIManagement } from "@/components/admin/AIManagement";
import { ATSManagement } from "@/components/admin/ATSManagement";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <GlassCard variant="elevated" className="p-8">
          <div className="flex items-start justify-between">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground text-lg">
                Complete website and user management system. Signed in as:{" "}
                <span className="font-semibold text-blue-600">{user?.email}</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/">
                <Button variant="outline" size="sm" className="gap-2">
                  <Home className="h-4 w-4" />
                  Main Site
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate(-1)}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </div>
          </div>
        </GlassCard>

        <EnhancedSystemStats 
          members={members} 
          userProfiles={userProfiles}
          isLoading={loadingMembers || loadingProfiles} 
        />
        
        <GlassCard variant="elevated" className="p-6">
          <Tabs defaultValue="registrations" className="w-full">
            <TabsList className="grid w-full grid-cols-10 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20">
              <TabsTrigger value="registrations" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white text-xs">
                Registrations
              </TabsTrigger>
              <TabsTrigger value="users" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white text-xs">
                Users
              </TabsTrigger>
              <TabsTrigger value="ats" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white text-xs">
                ATS
              </TabsTrigger>
              <TabsTrigger value="templates" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white text-xs">
                Templates
              </TabsTrigger>
              <TabsTrigger value="website" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white text-xs">
                Website
              </TabsTrigger>
              <TabsTrigger value="improvements" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white text-xs">
                Improvements
              </TabsTrigger>
              <TabsTrigger value="actions" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white text-xs">
                Actions
              </TabsTrigger>
              <TabsTrigger value="content" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white text-xs">
                Content
              </TabsTrigger>
              <TabsTrigger value="security" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white text-xs">
                Security
              </TabsTrigger>
              <TabsTrigger value="ai" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white text-xs">
                AI
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
            
            <TabsContent value="ats" className="mt-6">
              <ATSManagement isAdmin={!!isAdmin} />
            </TabsContent>
            
            <TabsContent value="templates" className="mt-6">
              <TemplateManagement />
            </TabsContent>
            
            <TabsContent value="website" className="mt-6">
              <WebsiteCustomization />
            </TabsContent>
            
            <TabsContent value="improvements" className="mt-6">
              <ImprovementPlans />
            </TabsContent>
            
            <TabsContent value="actions" className="mt-6">
              <QuickActions refetch={refetch} />
            </TabsContent>
            
            <TabsContent value="content" className="mt-6">
              <ContentManagement />
            </TabsContent>
            
            <TabsContent value="security" className="mt-6">
              <SecuritySettings />
            </TabsContent>
            
            <TabsContent value="ai" className="mt-6">
              <AIManagement />
            </TabsContent>
          </Tabs>
        </GlassCard>
      </div>
    </div>
  );
};

export default Admin;
