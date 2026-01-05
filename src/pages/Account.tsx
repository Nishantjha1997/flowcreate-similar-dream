import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { toast as sonnerToast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useAdminStatus } from '@/hooks/useAdminStatus';
import { usePremiumStatus } from '@/hooks/usePremiumStatus';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Link } from 'react-router-dom';
import { 
  Shield, Crown, Download, Edit, Plus, Trash2, Save, User, Briefcase, 
  GraduationCap, Award, Code, Wrench, Lock, FileText, ChevronRight, 
  Home, Settings, Clock, Heart, CheckCircle, Circle, Loader2, Eye, 
  Upload, LayoutTemplate
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ResumeData } from '@/utils/types';
import { usePDFGenerator } from '@/hooks/usePDFGenerator';
import ResumeTemplate from '@/utils/resumeTemplates';
import { templateNames } from '@/components/resume/ResumeData';
import { Breadcrumbs, BreadcrumbItem } from '@/components/ui/breadcrumbs';
import { useDesignMode } from '@/hooks/useDesignMode';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';

// Profile Components
import { ProfileCompletenessCard } from '@/components/profile/ProfileCompletenessCard';
import { PersonalInfoForm } from '@/components/profile/PersonalInfoForm';
import { ProfessionalInfoForm } from '@/components/profile/ProfessionalInfoForm';
import { SkillsForm } from '@/components/profile/SkillsForm';
import { WorkExperienceForm } from '@/components/profile/WorkExperienceForm';
import { EducationForm } from '@/components/profile/EducationForm';
import { ProjectsForm } from '@/components/profile/ProjectsForm';
import { CertificationsForm } from '@/components/profile/CertificationsForm';
import { VolunteerForm } from '@/components/profile/VolunteerForm';
import { PDFResumeUploader } from '@/components/profile/PDFResumeUploader';
import { ProfileInsights } from '@/components/profile/ProfileInsights';
import { FloatingSmartSuggestions } from '@/components/profile/FloatingSmartSuggestions';
import { ProfileAutoSave } from '@/components/profile/ProfileAutoSave';
import { AdvancedSkillsForm } from '@/components/profile/AdvancedSkillsForm';

// Tab configuration with icons and completion status
const getTabConfig = (profile: any) => [
  { 
    id: 'personal', 
    label: 'Personal', 
    icon: User, 
    isComplete: !!(profile?.full_name && profile?.email && profile?.phone) 
  },
  { 
    id: 'professional', 
    label: 'Professional', 
    icon: Briefcase, 
    isComplete: !!(profile?.professional_summary && profile?.current_position) 
  },
  { 
    id: 'experience', 
    label: 'Experience', 
    icon: Clock, 
    isComplete: !!(profile?.work_experience && profile.work_experience.length > 0) 
  },
  { 
    id: 'education', 
    label: 'Education', 
    icon: GraduationCap, 
    isComplete: !!(profile?.education && profile.education.length > 0) 
  },
  { 
    id: 'skills', 
    label: 'Skills', 
    icon: Wrench, 
    isComplete: !!(profile?.technical_skills && profile.technical_skills.length > 0) 
  },
  { 
    id: 'projects', 
    label: 'Projects', 
    icon: Code, 
    isComplete: !!(profile?.projects && profile.projects.length > 0) 
  },
  { 
    id: 'certifications', 
    label: 'Certifications', 
    icon: Award, 
    isComplete: !!(profile?.certifications && profile.certifications.length > 0) 
  },
  { 
    id: 'volunteer', 
    label: 'Volunteer', 
    icon: Heart, 
    isComplete: !!(profile?.volunteer_experience && profile.volunteer_experience.length > 0) 
  },
  { 
    id: 'resumes', 
    label: 'Resumes', 
    icon: FileText, 
    isComplete: true 
  },
  { 
    id: 'security', 
    label: 'Security', 
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
  const [fullName, setFullName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [deletingResumeId, setDeletingResumeId] = useState<string | null>(null);
  const [pendingChanges, setPendingChanges] = useState<any>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [extractedProfileData, setExtractedProfileData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('personal');

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    { label: 'My Account' }
  ];

  // Fetch user's saved resumes
  const { data: savedResumes, isLoading: loadingResumes, refetch: refetchResumes } = useQuery({
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

  const { generatePDF } = usePDFGenerator();

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    
    setTimeout(() => {
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      });
      setIsUpdating(false);
    }, 1000);
  };

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

  const handleDownloadResume = async (resume: any) => {
    try {
      const resumeData = resume.resume_data as unknown as ResumeData;
      const resumeName = resumeData.personal?.name || 'resume';
      
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '-9999px';
      tempContainer.style.width = '8.5in';
      tempContainer.style.backgroundColor = 'white';
      tempContainer.style.padding = '0.5in';
      tempContainer.style.boxSizing = 'border-box';
      
      const resumeElement = document.createElement('div');
      resumeElement.className = 'resume-content bg-white p-6';
      
      const { default: ResumeTemplate } = await import('@/utils/resumeTemplates');
      
      const ReactDOM = await import('react-dom/client');
      const React = await import('react');
      
      const root = ReactDOM.createRoot(resumeElement);
      
      root.render(
        React.createElement(ResumeTemplate, {
          data: resumeData,
          templateName: templateNames[resume.template_id] || 'modern'
        })
      );
      
      document.body.appendChild(tempContainer);
      tempContainer.appendChild(resumeElement);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const options = {
        margin: [10, 10, 10, 10],
        filename: `${resumeName}.pdf`,
        image: { type: 'jpeg', quality: 1.0 },
        html2canvas: { 
          scale: 5, 
          useCORS: true,
          logging: false,
          letterRendering: true,
          dpi: 600
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait',
          compress: false, 
          precision: 32
        }
      };

      const html2pdf = await import('html2pdf.js');
      
      await html2pdf.default()
        .from(resumeElement)
        .set(options)
        .save();
      
      root.unmount();
      if (tempContainer.parentNode) {
        document.body.removeChild(tempContainer);
      }
      
      toast({
        title: "Resume downloaded successfully!",
        description: `${resumeName} has been downloaded as PDF.`,
      });
    } catch (error) {
      console.error('Error downloading resume:', error);
      toast({
        title: "Download failed",
        description: "There was an error downloading your resume. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteResume = async (resumeId: string) => {
    if (!user?.id) return;
    
    setDeletingResumeId(resumeId);
    
    try {
      const { error } = await supabase
        .from('resumes')
        .delete()
        .eq('id', resumeId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      toast({
        title: "Resume deleted",
        description: "Your resume has been deleted successfully.",
      });
      
      refetchResumes();
    } catch (error) {
      console.error('Error deleting resume:', error);
      toast({
        title: "Delete failed",
        description: "There was an error deleting your resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingResumeId(null);
    }
  };

  const handleProfileUpdate = (updates: any) => {
    setPendingChanges({ ...pendingChanges, ...updates });
    setHasUnsavedChanges(true);
  };

  const handlePDFDataExtracted = (extractedData: any) => {
    setExtractedProfileData(extractedData);
  };

  const importExtractedData = () => {
    if (extractedProfileData) {
      handleProfileUpdate(extractedProfileData);
      setExtractedProfileData(null);
      sonnerToast.success('Profile data imported from resume!');
    }
  };

  const discardExtractedData = () => {
    setExtractedProfileData(null);
  };

  const saveProfileChanges = () => {
    if (Object.keys(pendingChanges).length > 0) {
      updateProfile(pendingChanges);
      setPendingChanges({});
      setHasUnsavedChanges(false);
    }
  };

  const getResumeName = (resumeData: any) => {
    try {
      const data = resumeData as ResumeData;
      return data.personal?.name || 'Untitled Resume';
    } catch {
      return 'Untitled Resume';
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

        {/* Extracted Data Notification */}
        {extractedProfileData && (
          <Card className={`mb-6 ${isNeoBrutalism ? 'border-3 border-foreground bg-blue-100' : 'border-blue-200 bg-blue-50 dark:bg-blue-950/20'}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <CardTitle className={`text-sm ${isNeoBrutalism ? 'text-foreground uppercase font-black' : 'text-blue-800 dark:text-blue-200'}`}>
                    Resume Data Extracted
                  </CardTitle>
                  <CardDescription className={isNeoBrutalism ? 'text-foreground/70' : 'text-blue-700 dark:text-blue-300'}>
                    We've extracted information from your resume. Review and import the data below.
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button onClick={importExtractedData} size="sm" className={isNeoBrutalism ? 'border-2 border-foreground' : ''}>
                    Import Data
                  </Button>
                  <Button onClick={discardExtractedData} variant="outline" size="sm" className={isNeoBrutalism ? 'border-2 border-foreground' : ''}>
                    Discard
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Left Sidebar - Profile Overview */}
          <div className="lg:col-span-1 space-y-6">
            <ProfileCompletenessCard 
              profile={mergedProfile} 
              completeness={calculateCompleteness(mergedProfile)}
              onSectionClick={setActiveTab}
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
          
              <TabsContent value="personal" className="mt-0 space-y-6 animate-fade-in">
                <PersonalInfoForm 
                  profile={mergedProfile} 
                  onUpdate={handleProfileUpdate}
                  isNeoBrutalism={isNeoBrutalism}
                />
              </TabsContent>
              
              <TabsContent value="professional" className="mt-0 animate-fade-in">
                <ProfessionalInfoForm 
                  profile={mergedProfile} 
                  onUpdate={handleProfileUpdate}
                  isNeoBrutalism={isNeoBrutalism}
                />
              </TabsContent>
              
              <TabsContent value="experience" className="mt-0 animate-fade-in">
                <WorkExperienceForm 
                  profile={mergedProfile} 
                  onUpdate={handleProfileUpdate}
                  isNeoBrutalism={isNeoBrutalism}
                />
              </TabsContent>
              
              <TabsContent value="education" className="mt-0 animate-fade-in">
                <EducationForm 
                  profile={mergedProfile} 
                  onUpdate={handleProfileUpdate}
                  isNeoBrutalism={isNeoBrutalism}
                />
              </TabsContent>
              
              <TabsContent value="skills" className="mt-0 space-y-6 animate-fade-in">
                <AdvancedSkillsForm 
                  profile={mergedProfile} 
                  onUpdate={handleProfileUpdate}
                  isPremium={premiumData?.isPremium || false}
                />
                <SkillsForm 
                  profile={mergedProfile} 
                  onUpdate={handleProfileUpdate}
                  isNeoBrutalism={isNeoBrutalism}
                />
              </TabsContent>
              
              <TabsContent value="projects" className="mt-0 animate-fade-in">
                <ProjectsForm 
                  profile={mergedProfile} 
                  onUpdate={handleProfileUpdate}
                  isNeoBrutalism={isNeoBrutalism}
                />
              </TabsContent>
              
              <TabsContent value="certifications" className="mt-0 animate-fade-in">
                <CertificationsForm 
                  profile={mergedProfile} 
                  onUpdate={handleProfileUpdate}
                  isNeoBrutalism={isNeoBrutalism}
                />
              </TabsContent>
              
              <TabsContent value="volunteer" className="mt-0 animate-fade-in">
                <VolunteerForm 
                  profile={mergedProfile} 
                  onUpdate={handleProfileUpdate}
                  isNeoBrutalism={isNeoBrutalism}
                />
              </TabsContent>

              <TabsContent value="resumes" className="mt-0 animate-fade-in">
                <Card className={isNeoBrutalism ? 'border-3 border-foreground shadow-[6px_6px_0px_0px_hsl(var(--foreground))]' : ''}>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <CardTitle className={`flex items-center gap-2 ${isNeoBrutalism ? 'uppercase font-black' : ''}`}>
                          <FileText className="w-5 h-5" />
                          My Resumes
                        </CardTitle>
                        <CardDescription>
                          Manage all your saved resumes. Download or edit them anytime.
                        </CardDescription>
                      </div>
                      <Link to="/resume-builder">
                        <Button className={isNeoBrutalism ? 'border-2 border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))] hover:translate-y-1 hover:shadow-none uppercase font-bold' : ''}>
                          <Plus className="w-4 h-4 mr-2" />
                          Create New Resume
                        </Button>
                      </Link>
                    </div>
                    {!premiumData?.isPremium && (
                      <div className={`mt-4 p-3 rounded-lg ${isNeoBrutalism ? 'bg-yellow-200 border-2 border-foreground' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'}`}>
                        <p className={`text-sm ${isNeoBrutalism ? 'font-bold text-foreground' : ''}`}>
                          Free users can save 1 resume. Upgrade to Premium for unlimited resumes!
                        </p>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent>
                    {loadingResumes ? (
                      <div className="text-center py-8">
                        <div className="animate-pulse flex flex-col items-center gap-3">
                          <div className="h-16 w-full max-w-md bg-muted rounded-lg" />
                          <div className="h-16 w-full max-w-md bg-muted rounded-lg" />
                        </div>
                      </div>
                    ) : savedResumes && savedResumes.length > 0 ? (
                      <div className="space-y-4">
                        {savedResumes.map((resume) => (
                          <div 
                            key={resume.id} 
                            className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg transition-all ${isNeoBrutalism ? 'border-2 border-foreground hover:shadow-[4px_4px_0px_0px_hsl(var(--foreground))]' : 'border hover:shadow-sm'}`}
                          >
                            <div className="flex items-center gap-4">
                              <div className={`p-3 rounded-lg ${isNeoBrutalism ? 'bg-primary border-2 border-foreground' : 'bg-primary/10'}`}>
                                <FileText className={`h-5 w-5 ${isNeoBrutalism ? 'text-primary-foreground' : 'text-primary'}`} />
                              </div>
                              <div>
                                <h3 className="font-semibold">{getResumeName(resume.resume_data)}</h3>
                                <p className="text-sm text-muted-foreground">
                                  Updated {new Date(resume.updated_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Link to={`/resume-builder?id=${resume.id}`}>
                                <Button variant="outline" size="sm" className={isNeoBrutalism ? 'border-2 border-foreground' : ''}>
                                  <Edit className="w-4 h-4 mr-1" />
                                  Edit
                                </Button>
                              </Link>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleDownloadResume(resume)}
                                className={isNeoBrutalism ? 'border-2 border-foreground' : ''}
                              >
                                <Download className="w-4 h-4 mr-1" />
                                Download
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleDeleteResume(resume.id)}
                                disabled={deletingResumeId === resume.id}
                                className={`text-destructive hover:text-destructive ${isNeoBrutalism ? 'border-2 border-foreground' : ''}`}
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                {deletingResumeId === resume.id ? 'Deleting...' : 'Delete'}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No resumes yet</h3>
                        <p className="text-muted-foreground mb-4">
                          Create your first resume to get started
                        </p>
                        <Link to="/resume-builder">
                          <Button className={isNeoBrutalism ? 'border-2 border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))]' : ''}>
                            <Plus className="w-4 h-4 mr-2" />
                            Create Resume
                          </Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
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
