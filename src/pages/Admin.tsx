import { useAuth } from "@/hooks/useAuth";
import { ScrollReveal } from "@/hooks/useScrollAnimation";
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
import { PaymentGatewayManagement } from "@/components/admin/PaymentGatewayManagement";
import { ATSManagement } from "@/components/admin/ATSManagement";
import { AdminAnalytics } from "@/components/admin/AdminAnalytics";
import { AuditLogs } from "@/components/admin/AuditLogs";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Shield } from "lucide-react";
import { useDesignMode } from "@/hooks/useDesignMode";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

const Admin = () => {
  const { user, isLoading } = useAuth();
  const userId = user?.id;
  const navigate = useNavigate();
  const { isNeoBrutalism } = useDesignMode();

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
    <div className={`min-h-screen p-8 ${
      isNeoBrutalism 
        ? 'bg-background' 
        : 'bg-[hsl(var(--surface-elevated))]'
    }`}>
        <div className="max-w-7xl mx-auto">
          <GlassCard variant="elevated" neoBrutalism={isNeoBrutalism} className="p-8">
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
    <div className={`min-h-screen p-8 ${
      isNeoBrutalism 
        ? 'bg-background' 
        : 'bg-[hsl(var(--surface-elevated))]'
    }`}>
      <div className="max-w-7xl mx-auto space-y-8">
        <ScrollReveal>
          <Breadcrumbs className="mb-4" />
        </ScrollReveal>
        
        <ScrollReveal delay={50}>
          <GlassCard variant="elevated" neoBrutalism={isNeoBrutalism} className="p-8">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Shield className={`h-10 w-10 ${isNeoBrutalism ? 'text-primary' : 'text-primary'}`} />
                  <h1 className={`text-4xl font-bold ${
                    isNeoBrutalism 
                      ? 'uppercase tracking-wide text-foreground' 
                      : 'text-foreground tracking-tight'
                  }`}>
                    Admin Dashboard
                  </h1>
                </div>
                <p className="text-muted-foreground text-lg">
                  Complete website and user management system. Signed in as:{" "}
                  <span className={`font-semibold ${isNeoBrutalism ? 'text-primary' : 'text-primary'}`}>{user?.email}</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link to="/">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className={`gap-2 ${
                      isNeoBrutalism 
                        ? 'rounded-none border-2 border-foreground font-bold uppercase shadow-[3px_3px_0px_0px_hsl(var(--foreground))] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all' 
                        : ''
                    }`}
                  >
                    <Home className="h-4 w-4" />
                    Main Site
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate(-1)}
                  className={`gap-2 ${
                    isNeoBrutalism 
                      ? 'rounded-none border-2 border-foreground font-bold uppercase hover:bg-muted' 
                      : ''
                  }`}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              </div>
            </div>
          </GlassCard>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <EnhancedSystemStats 
            members={members} 
            userProfiles={userProfiles}
            isLoading={loadingMembers || loadingProfiles} 
          />
        </ScrollReveal>
        
        <ScrollReveal delay={150}>
        <GlassCard variant="elevated" neoBrutalism={isNeoBrutalism} className="p-6">
          <Tabs defaultValue="registrations" className="w-full flex flex-col lg:flex-row gap-8">
            {/* Sidebar Navigation */}
            <div className="w-full lg:w-64 flex-shrink-0">
              <TabsList className={`flex flex-col h-auto w-full gap-5 bg-transparent p-0 border-0 items-start`}>
                
                {/* Operations Group */}
                <div className="w-full space-y-1.5">
                  <div className="px-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Operations & Users
                  </div>
                  <div className="flex flex-col w-full gap-1">
                    <TabsTrigger 
                      value="registrations" 
                      className={`w-full justify-start text-left px-3 py-2 text-xs transition-all duration-200 ${
                        isNeoBrutalism 
                          ? 'rounded-none uppercase font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-2 data-[state=active]:border-foreground' 
                          : 'data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-semibold hover:bg-muted/50 rounded-md'
                      }`}
                    >
                      Registrations
                    </TabsTrigger>
                    <TabsTrigger 
                      value="users" 
                      className={`w-full justify-start text-left px-3 py-2 text-xs transition-all duration-200 ${
                        isNeoBrutalism 
                          ? 'rounded-none uppercase font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-2 data-[state=active]:border-foreground' 
                          : 'data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-semibold hover:bg-muted/50 rounded-md'
                      }`}
                    >
                      User Management
                    </TabsTrigger>
                  </div>
                </div>

                {/* Core Features Group */}
                <div className="w-full space-y-1.5">
                  <div className="px-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Core Builder
                  </div>
                  <div className="flex flex-col w-full gap-1">
                    <TabsTrigger 
                      value="templates" 
                      className={`w-full justify-start text-left px-3 py-2 text-xs transition-all duration-200 ${
                        isNeoBrutalism 
                          ? 'rounded-none uppercase font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-2 data-[state=active]:border-foreground' 
                          : 'data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-semibold hover:bg-muted/50 rounded-md'
                      }`}
                    >
                      Templates
                    </TabsTrigger>
                    <TabsTrigger 
                      value="website" 
                      className={`w-full justify-start text-left px-3 py-2 text-xs transition-all duration-200 ${
                        isNeoBrutalism 
                          ? 'rounded-none uppercase font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-2 data-[state=active]:border-foreground' 
                          : 'data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-semibold hover:bg-muted/50 rounded-md'
                      }`}
                    >
                      Website Customization
                    </TabsTrigger>
                    <TabsTrigger 
                      value="ats" 
                      className={`w-full justify-start text-left px-3 py-2 text-xs transition-all duration-200 ${
                        isNeoBrutalism 
                          ? 'rounded-none uppercase font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-2 data-[state=active]:border-foreground' 
                          : 'data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-semibold hover:bg-muted/50 rounded-md'
                      }`}
                    >
                      ATS Management
                    </TabsTrigger>
                  </div>
                </div>

                {/* Security Group */}
                <div className="w-full space-y-1.5">
                  <div className="px-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Security & Logs
                  </div>
                  <div className="flex flex-col w-full gap-1">
                    <TabsTrigger 
                      value="security" 
                      className={`w-full justify-start text-left px-3 py-2 text-xs transition-all duration-200 ${
                        isNeoBrutalism 
                          ? 'rounded-none uppercase font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-2 data-[state=active]:border-foreground' 
                          : 'data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-semibold hover:bg-muted/50 rounded-md'
                      }`}
                    >
                      Security Settings
                    </TabsTrigger>
                    <TabsTrigger 
                      value="audit" 
                      className={`w-full justify-start text-left px-3 py-2 text-xs transition-all duration-200 ${
                        isNeoBrutalism 
                          ? 'rounded-none uppercase font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-2 data-[state=active]:border-foreground' 
                          : 'data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-semibold hover:bg-muted/50 rounded-md'
                      }`}
                    >
                      Audit Logs
                    </TabsTrigger>
                  </div>
                </div>

                {/* Integrations Group */}
                <div className="w-full space-y-1.5">
                  <div className="px-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Integrations
                  </div>
                  <div className="flex flex-col w-full gap-1">
                    <TabsTrigger 
                      value="ai" 
                      className={`w-full justify-start text-left px-3 py-2 text-xs transition-all duration-200 ${
                        isNeoBrutalism 
                          ? 'rounded-none uppercase font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-2 data-[state=active]:border-foreground' 
                          : 'data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-semibold hover:bg-muted/50 rounded-md'
                      }`}
                    >
                      AI Management
                    </TabsTrigger>
                    <TabsTrigger 
                      value="payments" 
                      className={`w-full justify-start text-left px-3 py-2 text-xs transition-all duration-200 ${
                        isNeoBrutalism 
                          ? 'rounded-none uppercase font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-2 data-[state=active]:border-foreground' 
                          : 'data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-semibold hover:bg-muted/50 rounded-md'
                      }`}
                    >
                      Payment Gateways
                    </TabsTrigger>
                  </div>
                </div>

                {/* System & Utilities Group */}
                <div className="w-full space-y-1.5">
                  <div className="px-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Utilities & Stats
                  </div>
                  <div className="flex flex-col w-full gap-1">
                    <TabsTrigger 
                      value="analytics" 
                      className={`w-full justify-start text-left px-3 py-2 text-xs transition-all duration-200 ${
                        isNeoBrutalism 
                          ? 'rounded-none uppercase font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-2 data-[state=active]:border-foreground' 
                          : 'data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-semibold hover:bg-muted/50 rounded-md'
                      }`}
                    >
                      Site Analytics
                    </TabsTrigger>
                    <TabsTrigger 
                      value="improvements" 
                      className={`w-full justify-start text-left px-3 py-2 text-xs transition-all duration-200 ${
                        isNeoBrutalism 
                          ? 'rounded-none uppercase font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-2 data-[state=active]:border-foreground' 
                          : 'data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-semibold hover:bg-muted/50 rounded-md'
                      }`}
                    >
                      Improvement Plans
                    </TabsTrigger>
                    <TabsTrigger 
                      value="content" 
                      className={`w-full justify-start text-left px-3 py-2 text-xs transition-all duration-200 ${
                        isNeoBrutalism 
                          ? 'rounded-none uppercase font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-2 data-[state=active]:border-foreground' 
                          : 'data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-semibold hover:bg-muted/50 rounded-md'
                      }`}
                    >
                      Content Management
                    </TabsTrigger>
                    <TabsTrigger 
                      value="actions" 
                      className={`w-full justify-start text-left px-3 py-2 text-xs transition-all duration-200 ${
                        isNeoBrutalism 
                          ? 'rounded-none uppercase font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-2 data-[state=active]:border-foreground' 
                          : 'data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-semibold hover:bg-muted/50 rounded-md'
                      }`}
                    >
                      Quick Actions
                    </TabsTrigger>
                  </div>
                </div>

              </TabsList>
            </div>
            
            {/* Scrollable Content Container */}
            <div className="flex-1 min-w-0">
              <TabsContent value="registrations" className="mt-0">
                <UserRegistrations isAdmin={!!isAdmin} />
              </TabsContent>
              
              <TabsContent value="users" className="mt-0">
                <UserManagement 
                  members={members} 
                  userProfiles={userProfiles}
                  isLoading={loadingMembers || loadingProfiles} 
                  refetch={() => { refetch(); }} 
                />
              </TabsContent>
              
              <TabsContent value="ats" className="mt-0">
                <ATSManagement isAdmin={!!isAdmin} />
              </TabsContent>
              
              <TabsContent value="templates" className="mt-0">
                <TemplateManagement />
              </TabsContent>
              
              <TabsContent value="website" className="mt-0">
                <WebsiteCustomization />
              </TabsContent>
              
              <TabsContent value="improvements" className="mt-0">
                <ImprovementPlans />
              </TabsContent>
              
              <TabsContent value="actions" className="mt-0">
                <QuickActions refetch={refetch} />
              </TabsContent>
              
              <TabsContent value="content" className="mt-0">
                <ContentManagement />
              </TabsContent>
              
              <TabsContent value="security" className="mt-0">
                <SecuritySettings />
              </TabsContent>
              
              <TabsContent value="ai" className="mt-0">
                <AIManagement />
              </TabsContent>

              <TabsContent value="payments" className="mt-0">
                <PaymentGatewayManagement />
              </TabsContent>

              <TabsContent value="analytics" className="mt-0">
                <AdminAnalytics isAdmin={!!isAdmin} />
              </TabsContent>
              
              <TabsContent value="audit" className="mt-0">
                <AuditLogs isAdmin={!!isAdmin} />
              </TabsContent>
            </div>
          </Tabs>
        </GlassCard>
        </ScrollReveal>
      </div>
    </div>
  );
};

export default Admin;
