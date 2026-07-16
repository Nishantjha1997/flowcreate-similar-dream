import { useAuth } from "@/hooks/useAuth";
import { ScrollReveal } from "@/hooks/useScrollAnimation";
import { useAdminStatus } from "@/hooks/useAdminStatus";
import { useAllMembers } from "@/hooks/useAllMembers";
import { useUserProfiles } from "@/hooks/useUserProfiles";
import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { EnhancedSystemStats } from "@/components/admin/EnhancedSystemStats";
import { UserManagement } from "@/components/admin/UserManagement";
import { QuickActions } from "@/components/admin/QuickActions";
import { WebsiteCustomization } from "@/components/admin/WebsiteCustomization";
import { TemplateManagement } from "@/components/admin/TemplateManagement";
import { UserRegistrations } from "@/components/admin/UserRegistrations";
import { ImprovementPlans } from "@/components/admin/ImprovementPlans";
import { ContentManagement } from "@/components/admin/ContentManagement";
import { SecuritySettings } from "@/components/admin/SecuritySettings";
import { AIManagement } from "@/components/admin/AIManagement";
import { PaymentGatewayManagement } from "@/components/admin/PaymentGatewayManagement";
import { ATSManagement } from "@/components/admin/ATSManagement";
import { AdminAnalytics } from "@/components/admin/AdminAnalytics";
import { AuditLogs } from "@/components/admin/AuditLogs";
import { HelpCenter } from "@/components/admin/HelpCenter";
import { BlogManager } from "@/components/admin/BlogManager";
import { Skeleton } from "@/components/ui/loading-skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Home,
  ArrowLeft,
  Shield,
  Users,
  UserCheck,
  LayoutTemplate,
  Globe,
  Briefcase,
  Lock,
  ClipboardList,
  BrainCircuit,
  CreditCard,
  BarChart3,
  Lightbulb,
  FileText,
  Zap,
  ChevronRight,
  Menu,
  X,
  LogOut,
  Settings,
  MessageSquare,
  BookOpen,
} from "lucide-react";
import { useDesignMode } from "@/hooks/useDesignMode";
import { cn } from "@/lib/utils";

// ─── Nav structure ─────────────────────────────────────────────────────────────
const NAV_GROUPS = [
  {
    label: "Operations & Users",
    items: [
      { value: "registrations", label: "Registrations", icon: UserCheck },
      { value: "users", label: "User Management", icon: Users },
      { value: "helpcenter", label: "Help Center", icon: MessageSquare },
    ],
  },
  {
    label: "Core Builder",
    items: [
      { value: "templates", label: "Templates", icon: LayoutTemplate },
      { value: "website", label: "Website", icon: Globe },
      { value: "ats", label: "ATS Management", icon: Briefcase },
    ],
  },
  {
    label: "Security & Logs",
    items: [
      { value: "security", label: "Security Settings", icon: Lock },
      { value: "audit", label: "Audit Logs", icon: ClipboardList },
    ],
  },
  {
    label: "Integrations",
    items: [
      { value: "ai", label: "AI Management", icon: BrainCircuit },
      { value: "payments", label: "Payment Gateways", icon: CreditCard },
    ],
  },
  {
    label: "Utilities & Stats",
    items: [
      { value: "analytics", label: "Site Analytics", icon: BarChart3 },
      { value: "improvements", label: "Improvement Plans", icon: Lightbulb },
      { value: "content", label: "Content Management", icon: FileText },
      { value: "blog", label: "Blog Manager", icon: BookOpen },
      { value: "actions", label: "Quick Actions", icon: Zap },
    ],
  },
];

type TabValue = string;

// ─── Component ─────────────────────────────────────────────────────────────────
const Admin = () => {
  const { user, isLoading } = useAuth();
  const userId = user?.id;
  const navigate = useNavigate();
  const { isNeoBrutalism } = useDesignMode();

  const { data: isAdmin, isLoading: loadingAdmin } = useAdminStatus(userId);
  const { data: members = [], isLoading: loadingMembers, refetch } = useAllMembers(!!isAdmin);
  const { data: userProfiles = [], isLoading: loadingProfiles } = useUserProfiles(!!isAdmin);

  const [activeTab, setActiveTab] = useState<TabValue>("registrations");
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  // Loading skeleton
  if (isLoading || loadingAdmin) {
    return (
      <div className="min-h-screen bg-[hsl(var(--surface-elevated))] p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-6">
            <div className="w-64 flex-shrink-0 space-y-3">
              {[...Array(12)].map((_, i) => <Skeleton key={i} className="h-9 w-full rounded-lg" />)}
            </div>
            <div className="flex-1 space-y-4">
              <Skeleton className="h-32 w-full rounded-xl" />
              <div className="grid grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
              </div>
              <Skeleton className="h-96 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  const avatarInitials = user?.email?.slice(0, 2).toUpperCase() ?? "AD";

  // Find current tab label + icon
  const currentItem = NAV_GROUPS.flatMap(g => g.items).find(i => i.value === activeTab);
  const CurrentIcon = currentItem?.icon ?? Shield;

  return (
    <div className="min-h-screen bg-[hsl(var(--surface-elevated))] flex flex-col">

      {/* ── Top Header Bar ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="flex items-center justify-between px-4 h-14 max-w-[1600px] mx-auto">
          {/* Left: Mobile menu toggle + logo */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-8 w-8"
              onClick={() => setSidebarOpen(s => !s)}
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
                <Shield className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-sm tracking-tight hidden sm:block">Admin Console</span>
            </div>
          </div>

          {/* Center: breadcrumb */}
          <div className="hidden md:flex items-center gap-1.5 text-sm text-muted-foreground">
            <span>Admin</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium">{currentItem?.label ?? "Dashboard"}</span>
          </div>

          {/* Right: quick actions */}
          <div className="flex items-center gap-2">
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-1.5 h-8 text-xs">
                <Home className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Main Site</span>
              </Button>
            </Link>
            <Button variant="ghost" size="sm" className="gap-1.5 h-8 text-xs" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            {/* Avatar */}
            <div className="h-7 w-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-bold text-primary ml-1">
              {avatarInitials}
            </div>
          </div>
        </div>
      </header>

      {/* ── Body: sidebar + content ─────────────────────────────────────── */}
      <div className="flex flex-1 max-w-[1600px] mx-auto w-full">

        {/* ── Sidebar ──────────────────────────────────────────────────── */}
        <aside className={cn(
          "fixed inset-y-0 left-0 top-14 z-40 w-60 border-r border-border/50 bg-background/95 backdrop-blur-sm",
          "flex flex-col overflow-y-auto",
          "transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:top-0",
          sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full",
        )}>
          {/* Admin Profile Block */}
          <div className="p-4 border-b border-border/40">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                {avatarInitials}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold truncate text-foreground">{user?.email?.split("@")[0]}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[10px] text-muted-foreground">Super Admin</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Groups */}
          <nav className="flex-1 p-3 space-y-5 overflow-y-auto">
            {NAV_GROUPS.map((group) => (
              <div key={group.label}>
                <p className="px-2 mb-1.5 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">
                  {group.label}
                </p>
                <ul className="space-y-0.5">
                  {group.items.map(({ value, label, icon: Icon }) => {
                    const isActive = activeTab === value;
                    return (
                      <li key={value}>
                        <button
                          onClick={() => { setActiveTab(value); setSidebarOpen(false); }}
                          className={cn(
                            "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all duration-150 text-left group",
                            isActive
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                          )}
                        >
                          <Icon className={cn(
                            "h-3.5 w-3.5 flex-shrink-0 transition-colors",
                            isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground",
                          )} />
                          <span className="flex-1 truncate">{label}</span>
                          {isActive && <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground/70 flex-shrink-0" />}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-3 border-t border-border/40">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/5 h-8"
              onClick={() => navigate("/")}
            >
              <LogOut className="h-3.5 w-3.5" />
              Exit Admin
            </Button>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── Main Content ─────────────────────────────────────────────── */}
        <main className="flex-1 min-w-0 p-4 lg:p-6 space-y-5 overflow-x-hidden">

          {/* Page Header */}
          <ScrollReveal>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "h-9 w-9 rounded-xl flex items-center justify-center",
                  "bg-primary/10 border border-primary/20",
                )}>
                  <CurrentIcon className="h-4.5 w-4.5 text-primary" />
                </div>
                <div>
                  <h1 className="text-lg font-bold tracking-tight text-foreground">{currentItem?.label ?? "Dashboard"}</h1>
                  <p className="text-xs text-muted-foreground">Admin · FlowCreate Console</p>
                </div>
              </div>
              <Badge variant="secondary" className="text-[10px] gap-1 hidden sm:flex">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Live
              </Badge>
            </div>
          </ScrollReveal>

          {/* Stats Row */}
          <ScrollReveal delay={50}>
            <EnhancedSystemStats
              members={members}
              userProfiles={userProfiles}
              isLoading={loadingMembers || loadingProfiles}
            />
          </ScrollReveal>

          {/* Tab Content Panel */}
          <ScrollReveal delay={100}>
            <div className="rounded-xl border border-border/40 bg-card shadow-sm overflow-hidden">
              <div className="p-5">
                {activeTab === "registrations" && <UserRegistrations isAdmin={!!isAdmin} />}
                {activeTab === "users" && (
                  <UserManagement
                    members={members}
                    userProfiles={userProfiles}
                    isLoading={loadingMembers || loadingProfiles}
                    refetch={() => { refetch(); }}
                  />
                )}
                {activeTab === "helpcenter" && <HelpCenter isAdmin={!!isAdmin} />}
                {activeTab === "blog" && <BlogManager />}
                {activeTab === "ats" && <ATSManagement isAdmin={!!isAdmin} />}
                {activeTab === "templates" && <TemplateManagement />}
                {activeTab === "website" && <WebsiteCustomization />}
                {activeTab === "improvements" && <ImprovementPlans />}
                {activeTab === "actions" && <QuickActions refetch={refetch} />}
                {activeTab === "content" && <ContentManagement />}
                {activeTab === "security" && <SecuritySettings />}
                {activeTab === "ai" && <AIManagement />}
                {activeTab === "payments" && <PaymentGatewayManagement />}
                {activeTab === "analytics" && <AdminAnalytics isAdmin={!!isAdmin} />}
                {activeTab === "audit" && <AuditLogs isAdmin={!!isAdmin} />}
              </div>
            </div>
          </ScrollReveal>

        </main>
      </div>
    </div>
  );
};

export default Admin;
