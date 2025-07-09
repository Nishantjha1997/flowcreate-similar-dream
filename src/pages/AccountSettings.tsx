import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useAdminStatus } from '@/hooks/useAdminStatus';
import { usePremiumStatus } from '@/hooks/usePremiumStatus';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Link } from 'react-router-dom';
import { Shield, Crown, Download, Edit, Plus, Trash2, Save, RefreshCw, User, Briefcase, GraduationCap, Award } from 'lucide-react';
import Header from '@/components/Header';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ResumeData } from '@/utils/types';
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

const AccountSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: isAdmin } = useAdminStatus(user?.id);
  const { data: premiumData } = usePremiumStatus(user?.id);
  const { 
    profile, 
    isLoading: profileLoading, 
    updateProfile, 
    isUpdating,
    calculateCompleteness 
  } = useUserProfile();
  
  const [pendingChanges, setPendingChanges] = useState<any>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

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

  const handleDeleteResume = async (resumeId: string) => {
    if (!user?.id) return;
    
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
      <div className="container max-w-7xl py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Account Settings</h1>
            <p className="text-muted-foreground">Manage your comprehensive profile</p>
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
                <Button onClick={saveProfileChanges} disabled={isUpdating} size="sm">
                  <Save className="w-4 h-4 mr-2" />
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </CardHeader>
          </Card>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <ProfileCompletenessCard 
              profile={mergedProfile} 
              completeness={calculateCompleteness(mergedProfile)} 
            />
          </div>

          <div className="lg:col-span-3">
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid w-full grid-cols-7 lg:grid-cols-7">
                <TabsTrigger value="personal">
                  <User className="w-4 h-4 mr-1" />
                  Personal
                </TabsTrigger>
                <TabsTrigger value="professional">
                  <Briefcase className="w-4 h-4 mr-1" />
                  Professional
                </TabsTrigger>
                <TabsTrigger value="experience">
                  <Briefcase className="w-4 h-4 mr-1" />
                  Experience
                </TabsTrigger>
                <TabsTrigger value="education">
                  <GraduationCap className="w-4 h-4 mr-1" />
                  Education
                </TabsTrigger>
                <TabsTrigger value="projects">
                  <Shield className="w-4 h-4 mr-1" />
                  Projects
                </TabsTrigger>
                <TabsTrigger value="certifications">
                  <Award className="w-4 h-4 mr-1" />
                  Certifications
                </TabsTrigger>
                <TabsTrigger value="skills">
                  <Award className="w-4 h-4 mr-1" />
                  Skills
                </TabsTrigger>
              </TabsList>
              
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
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;