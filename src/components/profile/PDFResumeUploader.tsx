import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileText, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/hooks/useUserProfile';

interface PDFResumeUploaderProps {
  onDataExtracted: (data: Partial<UserProfile>) => void;
}

export const PDFResumeUploader: React.FC<PDFResumeUploaderProps> = ({
  onDataExtracted,
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Please select a PDF file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error('File size must be less than 10MB');
      return;
    }

    await handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    setUploadSuccess(false);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const { data, error } = await supabase.functions.invoke('extract-resume-data', {
        body: formData,
      });

      if (error) throw error;

      if (data.success && data.data) {
        const extractedData = data.data;
        
        // Transform extracted data to UserProfile format
        const profileData: Partial<UserProfile> = {
          full_name: extractedData.personal?.name || '',
          email: extractedData.personal?.email || '',
          phone: extractedData.personal?.phone || '',
          address: extractedData.personal?.address || '',
          linkedin_url: extractedData.personal?.linkedin || '',
          website_url: extractedData.personal?.website || '',
          professional_summary: extractedData.personal?.summary || '',
          
          // Convert skills array to technical_skills
          technical_skills: Array.isArray(extractedData.skills) 
            ? extractedData.skills 
            : (typeof extractedData.skills === 'string' 
              ? extractedData.skills.split(',').map((s: string) => s.trim()).filter(Boolean)
              : []),
          
          // Store structured data
          work_experience: extractedData.experience || [],
          education: extractedData.education || [],
          projects: extractedData.projects || [],
          certifications: extractedData.certifications || [],
          languages: extractedData.languages || [],
        };

        onDataExtracted(profileData);
        setUploadSuccess(true);
        toast.success('Resume data extracted and ready to import!');
      } else {
        throw new Error(data.error || 'Failed to extract resume data');
      }
    } catch (error: any) {
      console.error('Error uploading resume:', error);
      toast.error(`Failed to extract resume data: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Import from Resume
        </CardTitle>
        <CardDescription>
          Upload your existing resume (PDF) to automatically fill your profile data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
            <div className="mx-auto w-12 h-12 text-muted-foreground mb-4">
              <FileText className="w-full h-full" />
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Upload your resume</h3>
              <p className="text-sm text-muted-foreground">
                PDF format, up to 10MB
              </p>
            </div>
            <div className="mt-4">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
                id="resume-upload"
                disabled={uploading}
              />
              <label htmlFor="resume-upload">
                <Button asChild disabled={uploading}>
                  <span className="cursor-pointer">
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Select PDF File
                      </>
                    )}
                  </span>
                </Button>
              </label>
            </div>
          </div>

          {uploadSuccess && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Resume data successfully extracted! The extracted information is ready to be imported into your profile.
              </AlertDescription>
            </Alert>
          )}

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>How it works:</strong> We use AI to extract information from your resume including 
              personal details, work experience, education, skills, and projects. You can review and edit 
              the extracted data before saving it to your profile.
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  );
};