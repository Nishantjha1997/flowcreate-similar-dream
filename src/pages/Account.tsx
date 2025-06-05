import { useState } from 'react';
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
import { Link } from 'react-router-dom';
import { Shield, Crown, Download, Edit, Plus, Trash2 } from 'lucide-react';
import Header from '@/components/Header';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ResumeData } from '@/utils/types';
import { usePDFGenerator } from '@/hooks/usePDFGenerator';
import ResumeTemplate from '@/utils/resumeTemplates';
import { templateNames } from '@/components/resume/ResumeData';

const Account = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: isAdmin, isLoading: loadingAdmin } = useAdminStatus(user?.id);
  const { data: premiumData, isLoading: loadingPremium } = usePremiumStatus(user?.id);
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [fullName, setFullName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [deletingResumeId, setDeletingResumeId] = useState<string | null>(null);

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
      
      // Render the resume template in the container
      const resumeElement = document.createElement('div');
      resumeElement.innerHTML = '';
      
      // We need to create a React element and render it
      // For now, let's use a simple approach
      document.body.appendChild(tempContainer);
      tempContainer.appendChild(resumeElement);
      
      // Create the resume content HTML
      const resumeHTML = `
        <div style="font-family: 'Arial', sans-serif; line-height: 1.6; color: #333;">
          <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid ${resumeData.customization.primaryColor}; padding-bottom: 15px;">
            <h1 style="margin: 0; color: ${resumeData.customization.primaryColor}; font-size: 28px;">${resumeData.personal.name}</h1>
            <p style="margin: 5px 0; color: ${resumeData.customization.secondaryColor};">
              ${resumeData.personal.email} | ${resumeData.personal.phone} | ${resumeData.personal.address}
            </p>
            ${resumeData.personal.website ? `<p style="margin: 5px 0;">Website: ${resumeData.personal.website}</p>` : ''}
            ${resumeData.personal.linkedin ? `<p style="margin: 5px 0;">LinkedIn: ${resumeData.personal.linkedin}</p>` : ''}
          </div>
          
          ${resumeData.personal.summary ? `
            <div style="margin-bottom: 20px;">
              <h2 style="color: ${resumeData.customization.primaryColor}; border-bottom: 1px solid #eee; padding-bottom: 5px;">Summary</h2>
              <p>${resumeData.personal.summary}</p>
            </div>
          ` : ''}
          
          ${resumeData.experience && resumeData.experience.length > 0 ? `
            <div style="margin-bottom: 20px;">
              <h2 style="color: ${resumeData.customization.primaryColor}; border-bottom: 1px solid #eee; padding-bottom: 5px;">Experience</h2>
              ${resumeData.experience.map(exp => `
                <div style="margin-bottom: 15px;">
                  <h3 style="margin: 0; color: ${resumeData.customization.secondaryColor};">${exp.title}</h3>
                  <p style="margin: 2px 0; font-weight: bold;">${exp.company} | ${exp.location}</p>
                  <p style="margin: 2px 0; font-style: italic;">${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}</p>
                  ${exp.description ? `<p style="margin: 8px 0;">${exp.description}</p>` : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}
          
          ${resumeData.education && resumeData.education.length > 0 ? `
            <div style="margin-bottom: 20px;">
              <h2 style="color: ${resumeData.customization.primaryColor}; border-bottom: 1px solid #eee; padding-bottom: 5px;">Education</h2>
              ${resumeData.education.map(edu => `
                <div style="margin-bottom: 15px;">
                  <h3 style="margin: 0; color: ${resumeData.customization.secondaryColor};">${edu.degree} ${edu.field ? `in ${edu.field}` : ''}</h3>
                  <p style="margin: 2px 0; font-weight: bold;">${edu.school}</p>
                  <p style="margin: 2px 0; font-style: italic;">${edu.startDate} - ${edu.endDate}</p>
                  ${edu.description ? `<p style="margin: 8px 0;">${edu.description}</p>` : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}
          
          ${resumeData.skills && resumeData.skills.length > 0 ? `
            <div style="margin-bottom: 20px;">
              <h2 style="color: ${resumeData.customization.primaryColor}; border-bottom: 1px solid #eee; padding-bottom: 5px;">Skills</h2>
              <p>${resumeData.skills.join(', ')}</p>
            </div>
          ` : ''}
          
          ${resumeData.projects && resumeData.projects.length > 0 ? `
            <div style="margin-bottom: 20px;">
              <h2 style="color: ${resumeData.customization.primaryColor}; border-bottom: 1px solid #eee; padding-bottom: 5px;">Projects</h2>
              ${resumeData.projects.map(project => `
                <div style="margin-bottom: 15px;">
                  <h3 style="margin: 0; color: ${resumeData.customization.secondaryColor};">${project.title}</h3>
                  ${project.link ? `<p style="margin: 2px 0;"><a href="${project.link}" style="color: ${resumeData.customization.primaryColor};">${project.link}</a></p>` : ''}
                  ${project.description ? `<p style="margin: 8px 0;">${project.description}</p>` : ''}
                  ${project.technologies && project.technologies.length > 0 ? `<p style="margin: 5px 0; font-style: italic;">Technologies: ${project.technologies.join(', ')}</p>` : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
      `;
      
      resumeElement.innerHTML = resumeHTML;
      
      // Generate PDF with correct single argument
      generatePDF(resumeElement);
      
      // Clean up
      setTimeout(() => {
        if (tempContainer.parentNode) {
          document.body.removeChild(tempContainer);
        }
      }, 1000);
      
      toast({
        title: "Downloading resume",
        description: `${resumeName} is being prepared for download.`,
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

  const getResumeName = (resumeData: any) => {
    try {
      const data = resumeData as ResumeData;
      return data.personal?.name || 'Untitled Resume';
    } catch {
      return 'Untitled Resume';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container max-w-6xl py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">My Account</h1>
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
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full md:w-auto md:inline-flex grid-cols-3 mb-6">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="resumes">My Resumes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your account profile information and email address.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleUpdateProfile}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={user?.email || ''}
                      disabled 
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      Your email address is your identity on FlowCreate and is used for login.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name" 
                      value={fullName} 
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isUpdating}>
                    {isUpdating ? "Saving..." : "Save Changes"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          
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
  );
};

export default Account;
