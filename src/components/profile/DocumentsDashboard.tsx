import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { usePDFGenerator } from '@/hooks/usePDFGenerator';
import { resolveTemplateKey } from '@/templates/registry';
import { ResumeData } from '@/utils/types';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  FileText, Plus, Edit, Download, Trash2, Copy, Share2, Eye, 
  ExternalLink, Loader2, FilePlus, ChevronRight 
} from 'lucide-react';
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface DocumentsDashboardProps {
  isNeoBrutalism?: boolean;
  isPremium?: boolean;
}

export const DocumentsDashboard = ({
  isNeoBrutalism = false,
  isPremium = false
}: DocumentsDashboardProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { generatePDF } = usePDFGenerator();

  const [deletingResumeId, setDeletingResumeId] = useState<string | null>(null);
  const [deletingLetterId, setDeletingLetterId] = useState<string | null>(null);
  const [cloningId, setCloningId] = useState<string | null>(null);
  
  // Sharing state
  const [sharingResumeId, setSharingResumeId] = useState<string | null>(null);
  const [sharingResumeTitle, setSharingResumeTitle] = useState<string>('');
  const [allowComments, setAllowComments] = useState<boolean>(true);
  const [isCreatingShare, setIsCreatingShare] = useState<boolean>(false);
  const [activeShareUrl, setActiveShareUrl] = useState<string | null>(null);

  // Fetch resumes
  const { data: savedResumes, isLoading: loadingResumes, refetch: refetchResumes } = useQuery({
    queryKey: ['userResumes', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  // Fetch cover letters
  const { data: savedLetters, isLoading: loadingLetters, refetch: refetchLetters } = useQuery({
    queryKey: ['userCoverLetters', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('cover_letters')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  const getResumeName = (resumeData: any) => {
    try {
      const data = resumeData as ResumeData;
      return data.personal?.name || 'Untitled Resume';
    } catch {
      return 'Untitled Resume';
    }
  };

  const handleDownloadResume = async (resume: any) => {
    try {
      const resumeData = resume.resume_data as unknown as ResumeData;
      const resumeName = resumeData.personal?.name || 'resume';
      
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '-9999px';
      tempContainer.style.width = '794px'; // A4 width
      tempContainer.style.backgroundColor = 'white';
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
          templateName: resolveTemplateKey(resume.template_id)
        })
      );
      
      document.body.appendChild(tempContainer);
      tempContainer.appendChild(resumeElement);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const html2canvasModule = await import('html2canvas');
      const { jsPDF } = await import('jspdf');
      
      const canvas = await html2canvasModule.default(resumeElement, {
        scale: 3,
        useCORS: true,
        logging: false,
        width: 794,
        height: resumeElement.scrollHeight
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate how many pages based on scrollHeight
      const canvasHeight = canvas.height;
      const canvasWidth = canvas.width;
      const pageHeightCanvas = (pdfHeight / pdfWidth) * canvasWidth;
      
      let heightLeft = canvasHeight;
      let position = 0;
      let pageCount = 0;
      
      while (heightLeft >= 0) {
        if (pageCount > 0) {
          pdf.addPage();
        }
        
        pdf.addImage(
          imgData, 
          'JPEG', 
          0, 
          position, 
          pdfWidth, 
          (canvasHeight * pdfWidth) / canvasWidth
        );
        
        heightLeft -= pageHeightCanvas;
        position -= pdfHeight;
        pageCount++;
      }
      
      pdf.save(`${resumeName}.pdf`);
      
      root.unmount();
      if (tempContainer.parentNode) {
        document.body.removeChild(tempContainer);
      }
      
      toast.success('Resume downloaded successfully!');
    } catch (error) {
      console.error('Error downloading resume:', error);
      toast.error('Download failed. Please try again.');
    }
  };

  const handleCloneResume = async (resume: any) => {
    if (!user?.id) return;
    setCloningId(resume.id);
    
    try {
      const sourceData = resume.resume_data as unknown as ResumeData;
      const clonedResumeData = {
        ...sourceData,
        personal: {
          ...sourceData.personal,
          name: `${sourceData.personal?.name || 'Untitled'} (Copy)`
        }
      };

      const { error } = await supabase
        .from('resumes')
        .insert({
          user_id: user.id,
          resume_data: clonedResumeData as any,
          template_id: resume.template_id,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      toast.success('Resume cloned successfully!');
      refetchResumes();
    } catch (error) {
      console.error('Error cloning resume:', error);
      toast.error('Clone failed. Please try again.');
    } finally {
      setCloningId(null);
    }
  };

  const handleDeleteResume = async (resumeId: string) => {
    if (!user?.id) return;
    if (!confirm('Are you sure you want to delete this resume?')) return;
    setDeletingResumeId(resumeId);
    
    try {
      const { error } = await supabase
        .from('resumes')
        .delete()
        .eq('id', resumeId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      toast.success('Resume deleted successfully.');
      refetchResumes();
    } catch (error) {
      console.error('Error deleting resume:', error);
      toast.error('Delete failed. Please try again.');
    } finally {
      setDeletingResumeId(null);
    }
  };

  const handleDeleteLetter = async (letterId: string) => {
    if (!user?.id) return;
    if (!confirm('Are you sure you want to delete this cover letter?')) return;
    setDeletingLetterId(letterId);
    
    try {
      const { error } = await supabase
        .from('cover_letters')
        .delete()
        .eq('id', letterId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      toast.success('Cover letter deleted successfully.');
      refetchLetters();
    } catch (error) {
      console.error('Error deleting letter:', error);
      toast.error('Delete failed. Please try again.');
    } finally {
      setDeletingLetterId(null);
    }
  };

  const handleShareResume = async () => {
    if (!sharingResumeId || !user?.id) return;
    setIsCreatingShare(true);
    
    try {
      // First check if share already exists
      const { data: existingShares, error: fetchError } = await supabase
        .from('resume_shares')
        .select('*')
        .eq('resume_id', sharingResumeId)
        .eq('is_active', true)
        .limit(1);

      if (fetchError) throw fetchError;

      let shareData = existingShares?.[0];

      if (!shareData) {
        // Create new share row
        const { data, error: insertError } = await supabase
          .from('resume_shares')
          .insert({
            resume_id: sharingResumeId,
            user_id: user.id,
            allow_comments: allowComments,
            is_active: true
          })
          .select('*')
          .single();

        if (insertError) throw insertError;
        shareData = data;
      }

      const shareLink = `${window.location.origin}/share/${shareData.share_token}`;
      setActiveShareUrl(shareLink);
      navigator.clipboard.writeText(shareLink);
      toast.success('Share link copied to clipboard!');
    } catch (error) {
      console.error('Error sharing resume:', error);
      toast.error('Failed to create share link.');
    } finally {
      setIsCreatingShare(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Resumes Dashboard Grid */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              My Resumes
            </h2>
            <p className="text-sm text-muted-foreground">
              Create, edit, and export your professional resumes.
            </p>
          </div>
          <Link to="/resume-builder">
            <Button className={isNeoBrutalism ? 'border-2 border-foreground shadow-[3px_3px_0px_0px_hsl(var(--foreground))] hover:translate-y-0.5 hover:shadow-none' : ''}>
              <Plus className="w-4 h-4 mr-2" />
              Create Resume
            </Button>
          </Link>
        </div>

        {loadingResumes ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="h-48 bg-muted/40" />
              </Card>
            ))}
          </div>
        ) : savedResumes && savedResumes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedResumes.map((resume) => (
              <Card 
                key={resume.id} 
                className={`flex flex-col justify-between overflow-hidden transition-all ${
                  isNeoBrutalism 
                    ? 'border-3 border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_hsl(var(--foreground))]' 
                    : 'border hover:shadow-md'
                }`}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="line-clamp-1 text-base font-bold">
                    {getResumeName(resume.resume_data)}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    Template: <span className="font-semibold text-primary">{resolveTemplateKey(resume.template_id)}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="py-2 text-xs text-muted-foreground flex-1">
                  Last updated {new Date(resume.updated_at).toLocaleDateString()}
                </CardContent>
                <div className="border-t bg-muted/20 p-3 grid grid-cols-5 gap-1.5">
                  <Link to={`/resume-builder?id=${resume.id}`} className="col-span-1">
                    <Button variant="outline" size="icon" className="w-full h-9" title="Edit">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="col-span-1"
                    onClick={() => handleCloneResume(resume)}
                    disabled={cloningId === resume.id}
                    title="Clone / Duplicate"
                  >
                    {cloningId === resume.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="col-span-1"
                    onClick={() => handleDownloadResume(resume)}
                    title="Download PDF"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="col-span-1"
                    onClick={() => {
                      setSharingResumeId(resume.id);
                      setSharingResumeTitle(getResumeName(resume.resume_data));
                      setActiveShareUrl(null);
                    }}
                    title="Share Link"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="col-span-1 text-destructive hover:bg-destructive/10"
                    onClick={() => handleDeleteResume(resume.id)}
                    disabled={deletingResumeId === resume.id}
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed rounded-xl bg-muted/10">
            <FileText className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">No resumes created yet.</p>
          </div>
        )}
      </section>

      {/* Cover Letters Dashboard Grid */}
      <section className="space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FilePlus className="w-5 h-5 text-purple-600" />
              My Cover Letters
            </h2>
            <p className="text-sm text-muted-foreground">
              Write custom cover letters for your job applications.
            </p>
          </div>
          <Link to="/cover-letter-builder">
            <Button className={isNeoBrutalism ? 'border-2 border-foreground bg-purple-600 text-white hover:bg-purple-700 shadow-[3px_3px_0px_0px_hsl(var(--foreground))] hover:translate-y-0.5 hover:shadow-none' : 'bg-purple-600 hover:bg-purple-700 text-white'}>
              <Plus className="w-4 h-4 mr-2" />
              Create Cover Letter
            </Button>
          </Link>
        </div>

        {loadingLetters ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="h-48 bg-muted/40" />
              </Card>
            ))}
          </div>
        ) : savedLetters && savedLetters.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedLetters.map((letter) => (
              <Card 
                key={letter.id} 
                className={`flex flex-col justify-between overflow-hidden transition-all ${
                  isNeoBrutalism 
                    ? 'border-3 border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_hsl(var(--foreground))]' 
                    : 'border hover:shadow-md'
                }`}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="line-clamp-1 text-base font-bold">
                    {letter.title || 'Untitled Cover Letter'}
                  </CardTitle>
                  <CardDescription>
                    Template: <span className="font-semibold text-purple-600">{letter.template_id || 'clean-slate'}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="py-2 text-xs text-muted-foreground flex-1">
                  Last updated {new Date(letter.updated_at).toLocaleDateString()}
                </CardContent>
                <div className="border-t bg-muted/20 p-3 grid grid-cols-3 gap-2">
                  <Link to={`/cover-letter-builder?edit=${letter.id}`} className="col-span-1">
                    <Button variant="outline" size="sm" className="w-full gap-1">
                      <Edit className="w-3.5 h-3.5" />
                      Edit
                    </Button>
                  </Link>
                  <Link to={`/cover-letter-builder?edit=${letter.id}`} className="col-span-1">
                    <Button variant="outline" size="sm" className="w-full gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      View
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="col-span-1 text-destructive hover:bg-destructive/10 gap-1"
                    onClick={() => handleDeleteLetter(letter.id)}
                    disabled={deletingLetterId === letter.id}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed rounded-xl bg-muted/10">
            <FilePlus className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">No cover letters created yet.</p>
          </div>
        )}
      </section>

      {/* Share Dialog */}
      <Dialog open={sharingResumeId !== null} onOpenChange={(open) => !open && setSharingResumeId(null)}>
        <DialogContent className={isNeoBrutalism ? 'border-4 border-foreground' : ''}>
          <DialogHeader>
            <DialogTitle>Share: {sharingResumeTitle}</DialogTitle>
            <DialogDescription>
              Generate a shareable public link for this resume.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="comments-toggle" className="flex flex-col gap-0.5">
                <span>Allow Comments</span>
                <span className="font-normal text-xs text-muted-foreground">
                  Recipients can leave comments on sections.
                </span>
              </Label>
              <Switch 
                id="comments-toggle" 
                checked={allowComments} 
                onCheckedChange={setAllowComments} 
              />
            </div>

            {activeShareUrl && (
              <div className="p-3 bg-muted rounded-md border flex items-center justify-between gap-2 overflow-hidden">
                <span className="text-xs font-mono truncate select-all">{activeShareUrl}</span>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => {
                    navigator.clipboard.writeText(activeShareUrl);
                    toast.success('Copied link!');
                  }}
                >
                  Copy
                </Button>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSharingResumeId(null)}>
              Close
            </Button>
            <Button 
              onClick={handleShareResume} 
              disabled={isCreatingShare}
              className={isNeoBrutalism ? 'border-2 border-foreground' : ''}
            >
              {isCreatingShare ? 'Generating...' : activeShareUrl ? 'Re-Copy Link' : 'Generate Link'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
