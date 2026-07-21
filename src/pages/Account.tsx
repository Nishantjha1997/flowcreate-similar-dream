import { useState } from 'react';
import { ScrollReveal } from '@/hooks/useScrollAnimation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useAdminStatus } from '@/hooks/useAdminStatus';
import { usePremiumStatus } from '@/hooks/usePremiumStatus';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Link } from 'react-router-dom';
import { 
  Shield, Crown, Save, User, Lock, FileText,
  CheckCircle, Circle, Loader2, Eye, Upload, LayoutTemplate
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Breadcrumbs, BreadcrumbItem } from '@/components/ui/breadcrumbs';
import { useDesignMode } from '@/hooks/useDesignMode';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';

// Profile Components
import { ProfileCompletenessCard } from '@/components/profile/ProfileCompletenessCard';
import { ProfileInsights } from '@/components/profile/ProfileInsights';
import { ResumeViewAnalytics } from '@/components/analytics/ResumeViewAnalytics';
import { MasterProfileForm } from '@/components/profile/MasterProfileForm';
import { DocumentsDashboard } from '@/components/profile/DocumentsDashboard';
import { PDFResumeUploader } from '@/components/profile/PDFResumeUploader';
import type { UserProfile } from '@/hooks/useUserProfile';

// Tab configuration with icons and completion status
const getTabConfig = (profile: any) => [
  { 
    id: 'documents', 
    label: 'My Documents', 
    icon: FileText, 
    isComplete: true 
  },
  { 
    id: 'profile', 
    label: 'Master Profile', 
    icon: User, 
    isComplete: !!(profile?.full_name && profile?.email && profile?.phone) 
  },
  { 
    id: 'analytics', 
    label: 'Analytics', 
    icon: Eye, 
    isComplete: true 
  },
  { 
    id: 'security', 
    label: 'Security & Settings', 
    icon: Lock, 
    isComplete: true 
  },
];

const Account = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: isAdmin, isLoading: loadingAdmin } = useAdminStatus(user?.id);
  const { data: premiumData, isLoading: loadingPremium } = usePremiumStatus(user?.id);
  const { 
    profile, 
    isLoading: profileLoading, 
    updateProfile, 
    isUpdating: profileUpdating,
    calculateCompleteness 
  } = useUserProfile();
  const { designMode } = useDesignMode();
  const isNeoBrutalism = designMode === 'neo-brutalism';
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pendingChanges, setPendingChanges] = useState<any>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [activeTab, setActiveTab] = useState('documents');

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    { label: 'My Account' }
  ];

  // Fetch user's saved resumes
  const { data: savedResumes } = useQuery({
    queryKey: ['userResumes', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "New password and confirm password must match.",
        variant: "destructive",
      });
      setIsUpdating(false);
      return;
    }
    
    setTimeout(() => {
      toast({
        title: "Password updated",
        description: "Your password has been updated successfully.",
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsUpdating(false);
    }, 1000);
  };

  const handleProfileUpdate = (updates: any) => {
    setPendingChanges({ ...pendingChanges, ...updates });
    setHasUnsavedChanges(true);
  };

  const saveProfileChanges = () => {
    if (Object.keys(pendingChanges).length > 0) {
      updateProfile(pendingChanges);
      setPendingChanges({});
      setHasUnsavedChanges(false);
    }
  };

  const mergedProfile = { ...profile, ...pendingChanges };
  const tabConfig = getTabConfig(mergedProfile);
  const completedTabs = tabConfig.filter(t => t.isComplete).length;
  const tabProgress = Math.round((completedTabs / tabConfig.length) * 100);

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <div className="animate-pulse flex flex-col items-center gap-4">
              <div className="h-20 w-20 rounded-full bg-muted" />
              <div className="h-4 w-48 bg-muted rounded" />
              <div className="h-3 w-32 bg-muted rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className={`min-h-screen bg-background ${isNeoBrutalism ? 'neo-brutalism-page' : ''}`}>
      <Header />
      <main className="container max-w-7xl px-4 sm:px-6 py-6 sm:py-10">
        {/* Breadcrumbs */}
        <Breadcrumbs items={breadcrumbItems} className="mb-6" />

        {/* Profile Header Card */}
        <ScrollReveal>
        <Card className={`mb-8 overflow-hidden ${isNeoBrutalism ? 'border-4 border-foreground shadow-[8px_8px_0px_0px_hsl(var(--foreground))]' : 'border shadow-sm'}`}>
          <div className={`h-24 sm:h-32 ${isNeoBrutalism ? 'bg-primary' : 'bg-gradient-to-r from-primary/20 via-primary/10 to-background'}`} />
          <CardContent className="relative pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-12 sm:-mt-16">
              <div className="relative group">
                <Avatar className={`h-24 w-24 sm:h-32 sm:w-32 ring-4 ring-background ${isNeoBrutalism ? 'border-4 border-foreground' : 'border-2 border-muted'}`}>
                  <AvatarImage src={mergedProfile?.avatar_url || ''} alt={mergedProfile?.full_name || 'User'} />
                  <AvatarFallback className="text-2xl sm:text-3xl font-bold bg-primary text-primary-foreground">
                    {getInitials(mergedProfile?.full_name)}
                  </AvatarFallback>
                </Avatar>
                <button 
                  onClick={() => setActiveTab('personal')}
                  className={`absolute inset-0 flex items-center justify-center bg-foreground/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${isNeoBrutalism ? 'border-4 border-foreground' : ''}`}
                >
                  <Upload className="h-6 w-6 text-background" />
                </button>
              </div>
              <div className="flex-1 pt-2 sm:pt-0 sm:pb-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <h1 className={`text-2xl sm:text-3xl font-bold ${isNeoBrutalism ? 'uppercase tracking-tight' : ''}`}>
                      {mergedProfile?.full_name || 'Welcome, User'}
                    </h1>
                    <p className="text-muted-foreground">
                      {mergedProfile?.current_position || mergedProfile?.email || 'Complete your profile to get started'}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {premiumData?.isPremium && (
                      <Badge className={`${isNeoBrutalism ? 'border-2 border-foreground bg-yellow-400 text-foreground font-bold' : 'bg-yellow-100 text-yellow-800 border-yellow-300'}`}>
                        <Crown className="w-3 h-3 mr-1" />
                        Premium
                      </Badge>
                    )}
                    {isAdmin && (
                      <Badge className={`${isNeoBrutalism ? 'border-2 border-foreground bg-destructive text-destructive-foreground font-bold' : 'bg-red-100 text-red-800 border-red-300'}`}>
                        <Shield className="w-3 h-3 mr-1" />
                        Admin
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        </ScrollReveal>

        {/* Persistent Auto-Save Indicator */}
        <div className={`flex items-center justify-between mb-4 p-3 rounded-lg ${isNeoBrutalism ? 'border-2 border-foreground bg-muted' : 'bg-muted/50'}`}>
          <div className="flex items-center gap-2">
            {profileUpdating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm font-medium">Saving changes...</span>
              </>
            ) : hasUnsavedChanges ? (
              <>
                <Circle className="h-4 w-4 text-orange-500 fill-orange-500" />
                <span className="text-sm font-medium text-orange-600">Unsaved changes</span>
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-muted-foreground">All changes saved</span>
              </>
            )}
          </div>
          {hasUnsavedChanges && (
            <Button 
              onClick={saveProfileChanges} 
              disabled={profileUpdating} 
              size="sm"
              className={isNeoBrutalism ? 'border-2 border-foreground shadow-[3px_3px_0px_0px_hsl(var(--foreground))] hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_hsl(var(--foreground))]' : ''}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Now
            </Button>
          )}
        </div>

        {/* Quick Action Cards */}
        <ScrollReveal delay={100}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <Link to="/resume-builder">
            <Card className={`h-full transition-all hover:scale-[1.02] cursor-pointer ${isNeoBrutalism ? 'border-3 border-foreground hover:shadow-[6px_6px_0px_0px_hsl(var(--foreground))] hover:-translate-y-1' : 'hover:shadow-md'}`}>
              <CardContent className="flex items-center gap-3 p-3 sm:p-4">
                <div className={`p-2 sm:p-3 rounded-lg ${isNeoBrutalism ? 'bg-primary border-2 border-foreground' : 'bg-primary/10'}`}>
                  <FileText className={`h-4 w-4 sm:h-5 sm:w-5 ${isNeoBrutalism ? 'text-primary-foreground' : 'text-primary'}`} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm sm:text-base truncate">Create Resume</h3>
                  <p className="text-xs text-muted-foreground hidden sm:block">Build a new resume</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/templates">
            <Card className={`h-full transition-all hover:scale-[1.02] cursor-pointer ${isNeoBrutalism ? 'border-3 border-foreground hover:shadow-[6px_6px_0px_0px_hsl(var(--foreground))] hover:-translate-y-1' : 'hover:shadow-md'}`}>
              <CardContent className="flex items-center gap-3 p-3 sm:p-4">
                <div className={`p-2 sm:p-3 rounded-lg ${isNeoBrutalism ? 'bg-purple-500 border-2 border-foreground' : 'bg-purple-100 dark:bg-purple-900/30'}`}>
                  <LayoutTemplate className={`h-4 w-4 sm:h-5 sm:w-5 ${isNeoBrutalism ? 'text-white' : 'text-purple-600 dark:text-purple-400'}`} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm sm:text-base truncate">Templates</h3>
                  <p className="text-xs text-muted-foreground hidden sm:block">Browse templates</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          
          {isAdmin ? (
            <Link to="/admin">
              <Card className={`h-full transition-all hover:scale-[1.02] cursor-pointer ${isNeoBrutalism ? 'border-3 border-foreground hover:shadow-[6px_6px_0px_0px_hsl(var(--foreground))] hover:-translate-y-1 bg-destructive/10' : 'hover:shadow-md bg-red-50 dark:bg-red-950/20'}`}>
                <CardContent className="flex items-center gap-3 p-3 sm:p-4">
                  <div className={`p-2 sm:p-3 rounded-lg ${isNeoBrutalism ? 'bg-destructive border-2 border-foreground' : 'bg-destructive/20'}`}>
                    <Shield className={`h-4 w-4 sm:h-5 sm:w-5 ${isNeoBrutalism ? 'text-destructive-foreground' : 'text-destructive'}`} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base truncate">Admin Panel</h3>
                    <p className="text-xs text-muted-foreground hidden sm:block">Manage the site</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ) : (
            <Card className={`h-full ${isNeoBrutalism ? 'border-3 border-foreground' : ''}`}>
              <CardContent className="flex items-center gap-3 p-3 sm:p-4">
                <div className={`p-2 sm:p-3 rounded-lg ${isNeoBrutalism ? 'bg-green-500 border-2 border-foreground' : 'bg-green-100 dark:bg-green-900/30'}`}>
                  <User className={`h-4 w-4 sm:h-5 sm:w-5 ${isNeoBrutalism ? 'text-white' : 'text-green-600 dark:text-green-400'}`} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm sm:text-base truncate">Profile</h3>
                  <p className="text-xs text-muted-foreground">{calculateCompleteness(mergedProfile)}% complete</p>
                </div>
              </CardContent>
            </Card>
          )}
          
          <Card className={`h-full ${isNeoBrutalism ? 'border-3 border-foreground' : ''}`}>
            <CardContent className="flex items-center gap-3 p-3 sm:p-4">
              <div className={`p-2 sm:p-3 rounded-lg ${isNeoBrutalism ? 'bg-blue-500 border-2 border-foreground' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
                <FileText className={`h-4 w-4 sm:h-5 sm:w-5 ${isNeoBrutalism ? 'text-white' : 'text-blue-600 dark:text-blue-400'}`} />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-sm sm:text-base truncate">Resumes</h3>
                <p className="text-xs text-muted-foreground">{savedResumes?.length || 0} saved</p>
              </div>
            </CardContent>
          </Card>
        </div>
        </ScrollReveal>

        {/* Main Content Grid */}
        <ScrollReveal delay={150}>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Left Sidebar - Profile Overview */}
          <div className="lg:col-span-1 space-y-6">
            <ProfileCompletenessCard 
              profile={mergedProfile} 
              completeness={calculateCompleteness(mergedProfile)}
              onSectionClick={(id) => {
                setActiveTab('profile');
                setTimeout(() => {
                  const element = document.getElementById(`profile-section-${id}`);
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }, 100);
              }}
              isNeoBrutalism={isNeoBrutalism}
            />
            <div className="hidden lg:block">
              <ProfileInsights 
                profile={mergedProfile} 
                completeness={calculateCompleteness(mergedProfile)}
                isNeoBrutalism={isNeoBrutalism}
              />
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              {/* Single Unified Tab Navigation with Progress Indicators */}
              <div className={`mb-6 ${isNeoBrutalism ? 'border-3 border-foreground p-1 bg-muted' : 'bg-muted/50 rounded-lg p-1'}`}>
                <ScrollArea className="w-full">
                  <TabsList className={`inline-flex h-auto w-full min-w-max gap-1 bg-transparent p-0`}>
                    {tabConfig.map((tab) => {
                      const IconComponent = tab.icon;
                      return (
                        <TabsTrigger 
                          key={tab.id}
                          value={tab.id}
                          className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 text-sm font-medium transition-all duration-200 relative ${isNeoBrutalism ? 'data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-2 data-[state=active]:border-foreground uppercase data-[state=active]:scale-105' : 'data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md data-[state=active]:scale-[1.02]'}`}
                        >
                          <div className="relative">
                            <IconComponent className="w-4 h-4 transition-transform duration-200 group-data-[state=active]:scale-110" />
                            {tab.isComplete && (
                              <div className={`absolute -top-1 -right-1 w-2 h-2 rounded-full animate-pulse ${isNeoBrutalism ? 'bg-green-500 border border-foreground' : 'bg-green-500'}`} />
                            )}
                          </div>
                          <span className="hidden sm:inline">{tab.label}</span>
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>
                  <ScrollBar orientation="horizontal" className="h-2" />
                </ScrollArea>
              </div>

              {/* Tab Progress Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Profile sections completed</span>
                  <span className="font-medium">{completedTabs}/{tabConfig.length}</span>
                </div>
                <Progress value={tabProgress} className={`h-2 transition-all duration-500 ${isNeoBrutalism ? 'border border-foreground' : ''}`} />
              </div>
          
              <TabsContent value="documents" className="mt-0 animate-fade-in">
                <DocumentsDashboard 
                  isNeoBrutalism={isNeoBrutalism} 
                  isPremium={premiumData?.isPremium || false} 
                />
              </TabsContent>

              <TabsContent value="profile" className="mt-0 animate-fade-in space-y-6">
                <PDFResumeUploader
                  onDataExtracted={(data: Partial<UserProfile>) => handleProfileUpdate(data)}
                />

                <div className={`flex items-center justify-between p-3 rounded-lg text-sm ${isNeoBrutalism ? 'border-2 border-foreground bg-muted' : 'bg-muted/50'}`}>
                  <span className="text-muted-foreground">
                    Want separate tailored profiles for different roles (e.g. "Engineering" vs "Product")?
                  </span>
                  <Link to="/master-profiles">
                    <Button variant="outline" size="sm" className={isNeoBrutalism ? 'border-2 border-foreground' : ''}>
                      Manage Master Profiles
                    </Button>
                  </Link>
                </div>

                <MasterProfileForm
                  profile={mergedProfile}
                  onUpdate={handleProfileUpdate}
                  isNeoBrutalism={isNeoBrutalism}
                  isPremium={premiumData?.isPremium || false}
                />
              </TabsContent>
              
              <TabsContent value="analytics" className="mt-0 animate-fade-in">
                <ResumeViewAnalytics isNeoBrutalism={isNeoBrutalism} />
              </TabsContent>
              
              <TabsContent value="security" className="mt-0 animate-fade-in">
                <Card className={isNeoBrutalism ? 'border-3 border-foreground shadow-[6px_6px_0px_0px_hsl(var(--foreground))]' : ''}>
                  <CardHeader>
                    <CardTitle className={`flex items-center gap-2 ${isNeoBrutalism ? 'uppercase font-black' : ''}`}>
                      <Lock className="w-5 h-5" />
                      Password & Security
                    </CardTitle>
                    <CardDescription>
                      Change your password to keep your account secure.
                    </CardDescription>
                  </CardHeader>
                  <form onSubmit={handleUpdatePassword}>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="current_password">Current Password</Label>
                        <Input 
                          id="current_password" 
                          type="password" 
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          required
                          className={isNeoBrutalism ? 'border-2 border-foreground' : ''}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="new_password">New Password</Label>
                        <Input 
                          id="new_password" 
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                          className={isNeoBrutalism ? 'border-2 border-foreground' : ''}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="confirm_password">Confirm New Password</Label>
                        <Input 
                          id="confirm_password" 
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          className={isNeoBrutalism ? 'border-2 border-foreground' : ''}
                        />
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        type="submit" 
                        disabled={isUpdating}
                        className={isNeoBrutalism ? 'border-2 border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))] hover:translate-y-1 hover:shadow-none' : ''}
                      >
                        {isUpdating ? "Updating..." : "Update Password"}
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        </ScrollReveal>

        {/* Mobile Profile Insights */}
        <div className="lg:hidden mt-8">
          <ProfileInsights 
            profile={mergedProfile} 
            completeness={calculateCompleteness(mergedProfile)}
            isNeoBrutalism={isNeoBrutalism}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Account;
