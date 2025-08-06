import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileText, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { ResumeData } from '@/utils/types';

interface PDFUploaderProps {
  onDataExtracted: (extractedData: Partial<ResumeData>) => void;
}

interface ExtractedData {
  personal?: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    website?: string;
    summary?: string;
  };
  experience?: Array<{
    title: string;
    company: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
  }>;
  education?: Array<{
    degree: string;
    institution: string;
    startDate: string;
    endDate: string;
    gpa?: string;
  }>;
  skills?: string;
  projects?: Array<{
    name: string;
    description: string;
    technologies: string;
    url?: string;
  }>;
}

export const PDFUploader: React.FC<PDFUploaderProps> = ({ onDataExtracted }) => {
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
        
        // Transform extracted data to ResumeData format
        const resumeData: Partial<ResumeData> = {
          personal: {
            name: extractedData.personal?.name || '',
            email: extractedData.personal?.email || '',
            phone: extractedData.personal?.phone || '',
            address: extractedData.personal?.address || '',
            linkedin: extractedData.personal?.linkedin || '',
            website: extractedData.personal?.website || '',
            summary: extractedData.personal?.summary || '',
            profileImage: ''
          },
          experience: extractedData.experience?.map((exp: any, index: number) => ({
            id: Date.now() + index,
            title: exp.title,
            company: exp.company,
            location: '',
            startDate: exp.startDate,
            endDate: exp.endDate,
            current: exp.current,
            description: exp.description
          })) || [],
          education: extractedData.education?.map((edu: any, index: number) => ({
            id: Date.now() + index,
            school: edu.institution,
            degree: edu.degree,
            field: '',
            startDate: edu.startDate,
            endDate: edu.endDate,
            description: ''
          })) || [],
          skills: Array.isArray(extractedData.skills) 
            ? extractedData.skills 
            : (typeof extractedData.skills === 'string' 
              ? extractedData.skills.split(',').map(s => s.trim()).filter(Boolean)
              : []),
          projects: extractedData.projects?.map((proj: any, index: number) => ({
            id: Date.now() + index,
            title: proj.name,
            description: proj.description,
            link: proj.url,
            technologies: proj.technologies?.split(',').map((tech: string) => tech.trim()) || []
          })) || []
        };

        onDataExtracted(resumeData);
        setUploadSuccess(true);
        toast.success('Resume data extracted and applied successfully!');
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
            Resume data successfully extracted and applied to your resume builder!
          </AlertDescription>
        </Alert>
      )}

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>How it works:</strong> We use Gemini AI to extract information from your resume including 
          personal details, work experience, education, skills, and projects. The data will be automatically 
          filled into your resume builder.
        </AlertDescription>
      </Alert>
    </div>
  );
};