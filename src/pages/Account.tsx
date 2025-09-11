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
import { Shield, Crown, Download, Edit, Plus, Trash2, Save, User, Briefcase, GraduationCap, Award } from 'lucide-react';
import Header from '@/components/Header';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ResumeData } from '@/utils/types';
import { usePDFGenerator } from '@/hooks/usePDFGenerator';
import ResumeTemplate from '@/utils/resumeTemplates';
import { templateNames } from '@/components/resume/ResumeData';

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
import { SmartProfileSuggestions } from '@/components/profile/SmartProfileSuggestions';
import { ProfileAutoSave } from '@/components/profile/ProfileAutoSave';
import { AdvancedSkillsForm } from '@/components/profile/AdvancedSkillsForm';
import { ProfileAnalytics } from '@/components/profile/ProfileAnalytics';

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
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [fullName, setFullName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [deletingResumeId, setDeletingResumeId] = useState<string | null>(null);
  const [pendingChanges, setPendingChanges] = useState<any>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [extractedProfileData, setExtractedProfileData] = useState<any>(null);

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
    
    // This is a placeholder - in a real app, you would update the profile in Supabase
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
    
    // This is a placeholder - in a real app, you would update the password in Supabase
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
      
      // Create a temporary container for the resume
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '-9999px';
      tempContainer.style.width = '8.5in';
      tempContainer.style.backgroundColor = 'white';
      tempContainer.style.padding = '0.5in';
      tempContainer.style.boxSizing = 'border-box';
      
      // Create resume element
      const resumeElement = document.createElement('div');
      resumeElement.className = 'resume-content bg-white p-6';
      
      // Render the actual template using our template system
      const { default: ResumeTemplate } = await import('@/utils/resumeTemplates');
      
      // Create a temporary React root to render the template
      const ReactDOM = await import('react-dom/client');
      const React = await import('react');
      
      const root = ReactDOM.createRoot(resumeElement);
      
      // Render the template
      root.render(
        React.createElement(ResumeTemplate, {
          data: resumeData,
          templateName: templateNames[resume.template_id] || 'modern'
        })
      );
      
      // Add to DOM temporarily
      document.body.appendChild(tempContainer);
      tempContainer.appendChild(resumeElement);
      
      // Wait for rendering to complete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Use the same PDF generation logic as ResumePreview
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
      
      // Clean up
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

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading your profile...</div>
        </div>
      </div>
    );
  }

  const mergedProfile = { ...profile, ...pendingChanges };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container max-w-6xl py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">My Account</h1>
            <p className="text-muted-foreground">Manage your comprehensive profile and resume data</p>
          </div>
          <div className="flex items-center space-x-2">
            {premiumData?.isPremium && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                <Crown className="w-3 h-3 mr-1" />
                Premium
              </Badge>
            )}
            {isAdmin && (
              <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-300">
                <Shield className="w-3 h-3 mr-1" />
                Admin
              </Badge>
            )}
          </div>
        </div>

        {hasUnsavedChanges && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-orange-800 text-sm">Unsaved Changes</CardTitle>
                  <CardDescription className="text-orange-700">
                    You have unsaved changes to your profile.
                  </CardDescription>
                </div>
                <Button onClick={saveProfileChanges} disabled={profileUpdating} size="sm">
                  <Save className="w-4 h-4 mr-2" />
                  {profileUpdating ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </CardHeader>
          </Card>
        )}

        {isAdmin && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800 flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Admin Access
              </CardTitle>
              <CardDescription>
                You have administrator privileges. Access the admin dashboard to manage users and system settings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/admin">
                <Button variant="destructive" className="w-full">
                  <Shield className="w-4 h-4 mr-2" />
                  Access Admin Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
        
        {extractedProfileData && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-blue-800 text-sm">Resume Data Extracted</CardTitle>
                  <CardDescription className="text-blue-700">
                    We've extracted information from your resume. Review and import the data below.
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button onClick={importExtractedData} size="sm">
                    Import Data
                  </Button>
                  <Button onClick={discardExtractedData} variant="outline" size="sm">
                    Discard
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Profile Overview */}
          <div className="lg:col-span-3 space-y-4">
            <ProfileCompletenessCard 
              profile={mergedProfile} 
              completeness={calculateCompleteness(mergedProfile)} 
            />
            <ProfileInsights 
              profile={mergedProfile} 
              completeness={calculateCompleteness(mergedProfile)} 
            />
            <PDFResumeUploader onDataExtracted={handlePDFDataExtracted} />
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-6">
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid w-full grid-cols-4 lg:grid-cols-4 mb-6">
                <TabsTrigger value="personal" className="text-xs sm:text-sm">
                  <User className="w-4 h-4 sm:mr-1" />
                  <span className="hidden sm:inline">Personal</span>
                </TabsTrigger>
                <TabsTrigger value="professional" className="text-xs sm:text-sm">
                  <Briefcase className="w-4 h-4 sm:mr-1" />
                  <span className="hidden sm:inline">Professional</span>
                </TabsTrigger>
                <TabsTrigger value="experience" className="text-xs sm:text-sm">
                  <Briefcase className="w-4 h-4 sm:mr-1" />
                  <span className="hidden sm:inline">Experience</span>
                </TabsTrigger>
                <TabsTrigger value="education" className="text-xs sm:text-sm">
                  <GraduationCap className="w-4 h-4 sm:mr-1" />
                  <span className="hidden sm:inline">Education</span>
                </TabsTrigger>
              </TabsList>
              
              {/* Secondary Tabs for Additional Sections */}
              <div className="mb-4">
                <TabsList className="grid w-full grid-cols-3 lg:grid-cols-3">
                  <TabsTrigger value="projects" className="text-xs sm:text-sm">
                    <Shield className="w-4 h-4 sm:mr-1" />
                    <span className="hidden sm:inline">Projects</span>
                  </TabsTrigger>
                  <TabsTrigger value="certifications" className="text-xs sm:text-sm">
                    <Award className="w-4 h-4 sm:mr-1" />
                    <span className="hidden sm:inline">Certifications</span>
                  </TabsTrigger>
                  <TabsTrigger value="skills" className="text-xs sm:text-sm">
                    <Award className="w-4 h-4 sm:mr-1" />
                    <span className="hidden sm:inline">Skills</span>
                  </TabsTrigger>
                </TabsList>
              </div>
          
              <TabsContent value="personal" className="mt-6">
                <PersonalInfoForm 
                  profile={mergedProfile} 
                  onUpdate={handleProfileUpdate} 
                />
              </TabsContent>
              
              <TabsContent value="professional" className="mt-6">
                <ProfessionalInfoForm 
                  profile={mergedProfile} 
                  onUpdate={handleProfileUpdate} 
                />
              </TabsContent>
              
              <TabsContent value="experience" className="mt-6">
                <WorkExperienceForm 
                  profile={mergedProfile} 
                  onUpdate={handleProfileUpdate} 
                />
              </TabsContent>
              
              <TabsContent value="education" className="mt-6">
                <EducationForm 
                  profile={mergedProfile} 
                  onUpdate={handleProfileUpdate} 
                />
              </TabsContent>
              
              <TabsContent value="projects" className="mt-6">
                <ProjectsForm 
                  profile={mergedProfile} 
                  onUpdate={handleProfileUpdate} 
                />
              </TabsContent>
              
              <TabsContent value="certifications" className="mt-6">
                <CertificationsForm 
                  profile={mergedProfile} 
                  onUpdate={handleProfileUpdate} 
                />
              </TabsContent>
              
              <TabsContent value="skills" className="mt-6">
                <div className="space-y-6">
                  <AdvancedSkillsForm 
                    profile={mergedProfile} 
                    onUpdate={handleProfileUpdate}
                    isPremium={premiumData?.isPremium || false}
                  />
                  <SkillsForm 
                    profile={mergedProfile} 
                    onUpdate={handleProfileUpdate} 
                  />
                  <VolunteerForm 
                    profile={mergedProfile} 
                    onUpdate={handleProfileUpdate} 
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Sidebar - Smart Suggestions & Analytics */}
          <div className="lg:col-span-3 space-y-4">
            <SmartProfileSuggestions 
              profile={mergedProfile} 
              onApplySuggestion={handleProfileUpdate}
              isPremium={premiumData?.isPremium || false}
            />
            <ProfileAnalytics 
              profile={mergedProfile} 
              completeness={calculateCompleteness(mergedProfile)} 
            />
          </div>
        </div>

        <div className="mt-12">
          <Tabs defaultValue="security" className="w-full">
            <TabsList className="grid w-full md:w-auto md:inline-flex grid-cols-2 mb-6">
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="resumes">My Resumes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Password</CardTitle>
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
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" disabled={isUpdating}>
                      {isUpdating ? "Updating..." : "Update Password"}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>

            <TabsContent value="resumes">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    My Resumes
                    <Link to="/resume-builder">
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Create New Resume
                      </Button>
                    </Link>
                  </CardTitle>
                  <CardDescription>
                    Manage all your saved resumes. Download or edit them anytime.
                    {!premiumData?.isPremium && (
                      <span className="block mt-2 text-yellow-700 bg-yellow-100 p-2 rounded">
                        Free users can save 1 resume. Upgrade to Premium for unlimited resumes!
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingResumes ? (
                    <div className="text-center py-8">Loading your resumes...</div>
                  ) : savedResumes && savedResumes.length > 0 ? (
                    <div className="space-y-4">
                      {savedResumes.map((resume) => (
                        <div key={resume.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h3 className="font-medium">{getResumeName(resume.resume_data)}</h3>
                            <p className="text-sm text-muted-foreground">
                              Created on {new Date(resume.created_at).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Last updated {new Date(resume.updated_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadResume(resume)}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                            <Link to={`/resume-builder?edit=${resume.id}`}>
                              <Button size="sm">
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </Button>
                            </Link>
                            {!premiumData?.isPremium && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteResume(resume.id)}
                                disabled={deletingResumeId === resume.id}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                {deletingResumeId === resume.id ? 'Deleting...' : 'Delete'}
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">You haven't created any resumes yet.</p>
                      <Link to="/resume-builder">
                        <Button>
                          <Plus className="w-4 h-4 mr-2" />
                          Create Your First Resume
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Auto-save indicator */}
      <ProfileAutoSave
        hasUnsavedChanges={hasUnsavedChanges}
        isUpdating={profileUpdating}
        lastSaved={profile?.updated_at ? new Date(profile.updated_at) : undefined}
        onSave={saveProfileChanges}
      />
    </div>
  );
};

export default Account;
