import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileText, Loader2, AlertCircle, CheckCircle2, Key } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/hooks/useUserProfile';
import { PDFDataPreviewModal } from './PDFDataPreviewModal';

interface PDFResumeUploaderProps {
  onDataExtracted: (data: Partial<UserProfile>) => void;
}

export const PDFResumeUploader: React.FC<PDFResumeUploaderProps> = ({
  onDataExtracted,
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [extractedData, setExtractedData] = useState<Partial<UserProfile> | null>(null);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);

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
    setApiKeyMissing(false);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const { data, error } = await supabase.functions.invoke('extract-resume-data', {
        body: formData,
      });

      if (error) throw error;

      // Check if API key is missing
      if (data.requiresApiKey) {
        setApiKeyMissing(true);
        toast.error('AI resume parsing requires configuration. Please contact the administrator.');
        return;
      }

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

        setExtractedData(profileData);
        setUploadSuccess(true);
        setShowPreviewModal(true);
        toast.success('Resume data extracted successfully! Please review and import.');
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

  const handleImportData = (selectedData: Partial<UserProfile>) => {
    onDataExtracted(selectedData);
    setShowPreviewModal(false);
    setExtractedData(null);
    toast.success('Selected data imported successfully!');
  };

  const handleCloseModal = () => {
    setShowPreviewModal(false);
    setExtractedData(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Import from Resume
        </CardTitle>
        <CardDescription>
          Upload your existing resume (PDF) to automatically fill your profile data using AI
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
                        Processing with AI...
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
                Resume data successfully extracted! Review the preview to select what to import.
              </AlertDescription>
            </Alert>
          )}

          {apiKeyMissing && (
            <Alert className="border-orange-200 bg-orange-50">
              <Key className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <strong>AI Parsing Not Configured:</strong> This feature requires a Gemini API key to be configured. 
                Please contact the administrator to enable AI resume parsing, or manually enter your profile information.
              </AlertDescription>
            </Alert>
          )}

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>How it works:</strong> We use Google Gemini AI to extract information from your resume including 
              personal details, work experience, education, skills, and projects. You can review and selectively 
              import the extracted data into your profile.
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
      
      {extractedData && (
        <PDFDataPreviewModal
          isOpen={showPreviewModal}
          onClose={handleCloseModal}
          extractedData={extractedData}
          onImport={handleImportData}
        />
      )}
    </Card>
  );
};