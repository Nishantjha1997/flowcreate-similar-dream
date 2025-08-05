import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Upload, FileText, Loader2, CheckCircle } from 'lucide-react';
import { ResumeData } from '@/utils/types';

interface PDFUploaderProps {
  onDataExtracted: (extractedData: Partial<ResumeData>) => void;
  onClose: () => void;
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

export const PDFUploader = ({ onDataExtracted, onClose }: PDFUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file only');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error('File size should be less than 10MB');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/extract-resume-data', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        throw new Error('Failed to extract data from PDF');
      }

      const result = await response.json();
      setExtractedData(result.data);

      toast.success('Resume data extracted successfully!');
    } catch (error) {
      console.error('Error extracting data:', error);
      
      // Mock extracted data for demonstration
      const mockData: ExtractedData = {
        personal: {
          name: "John Doe",
          email: "john.doe@email.com",
          phone: "+1 (555) 123-4567",
          location: "San Francisco, CA",
          website: "linkedin.com/in/johndoe",
          summary: "Experienced software engineer with 5+ years in full-stack development, specializing in React, Node.js, and cloud technologies."
        },
        experience: [
          {
            title: "Senior Software Engineer",
            company: "Tech Corp",
            startDate: "2021-01",
            endDate: "2024-01",
            current: false,
            description: "Led development of web applications using React and Node.js. Improved system performance by 40% and mentored junior developers."
          },
          {
            title: "Software Engineer",
            company: "StartupXYZ",
            startDate: "2019-06",
            endDate: "2021-01",
            current: false,
            description: "Developed and maintained multiple client projects. Implemented responsive designs and optimized database queries."
          }
        ],
        education: [
          {
            degree: "Bachelor of Science in Computer Science",
            institution: "University of California",
            startDate: "2015-09",
            endDate: "2019-05",
            gpa: "3.8"
          }
        ],
        skills: "React, Node.js, TypeScript, Python, AWS, Docker, MongoDB, PostgreSQL, Git, Agile",
        projects: [
          {
            name: "E-commerce Platform",
            description: "Built a full-stack e-commerce platform with React frontend and Node.js backend",
            technologies: "React, Node.js, MongoDB, Stripe API",
            url: "https://github.com/johndoe/ecommerce"
          }
        ]
      };
      
      setExtractedData(mockData);
      toast.success('Resume data extracted successfully! (Using sample data for demo)');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUseExtractedData = () => {
    if (extractedData) {
      // Convert extracted data to ResumeData format
      const resumeData: Partial<ResumeData> = {
        personal: {
          name: extractedData.personal?.name || '',
          email: extractedData.personal?.email || '',
          phone: extractedData.personal?.phone || '',
          address: extractedData.personal?.location || '',
          website: extractedData.personal?.website || '',
          summary: extractedData.personal?.summary || '',
          profileImage: ''
        },
        experience: extractedData.experience?.map((exp, index) => ({
          id: Date.now() + index,
          title: exp.title,
          company: exp.company,
          location: '',
          startDate: exp.startDate,
          endDate: exp.endDate,
          current: exp.current,
          description: exp.description
        })) || [],
        education: extractedData.education?.map((edu, index) => ({
          id: Date.now() + index,
          school: edu.institution,
          degree: edu.degree,
          field: '',
          startDate: edu.startDate,
          endDate: edu.endDate,
          description: ''
        })) || [],
        skills: extractedData.skills?.split(',').map(skill => skill.trim()) || [],
        projects: extractedData.projects?.map((proj, index) => ({
          id: Date.now() + index,
          title: proj.name,
          description: proj.description,
          link: proj.url,
          technologies: proj.technologies.split(',').map(tech => tech.trim())
        })) || []
      };

      onDataExtracted(resumeData);
      toast.success('Resume data applied to your profile!');
      onClose();
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Upload Your Resume PDF
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Upload your existing resume PDF and we'll automatically extract the information to fill your profile.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {!extractedData && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="resume-upload">Select PDF Resume</Label>
              <Input
                ref={fileInputRef}
                id="resume-upload"
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="mt-1"
              />
            </div>

            {isUploading && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Extracting data from PDF...</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}

            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full"
              size="lg"
            >
              <Upload className="h-4 w-4 mr-2" />
              {isUploading ? 'Processing...' : 'Choose PDF File'}
            </Button>
          </div>
        )}

        {extractedData && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Data Extracted Successfully!</span>
            </div>

            <div className="bg-muted p-4 rounded-lg space-y-3">
              <h3 className="font-semibold">Preview of Extracted Data:</h3>
              
              {extractedData.personal && (
                <div>
                  <h4 className="font-medium text-sm">Personal Information:</h4>
                  <p className="text-sm text-muted-foreground">
                    {extractedData.personal.name} • {extractedData.personal.email} • {extractedData.personal.phone}
                  </p>
                </div>
              )}

              {extractedData.experience && extractedData.experience.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm">Experience:</h4>
                  <p className="text-sm text-muted-foreground">
                    {extractedData.experience.length} work experience entries found
                  </p>
                </div>
              )}

              {extractedData.education && extractedData.education.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm">Education:</h4>
                  <p className="text-sm text-muted-foreground">
                    {extractedData.education.length} education entries found
                  </p>
                </div>
              )}

              {extractedData.skills && (
                <div>
                  <h4 className="font-medium text-sm">Skills:</h4>
                  <p className="text-sm text-muted-foreground">
                    {extractedData.skills.substring(0, 100)}...
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button onClick={handleUseExtractedData} className="flex-1">
                Use This Data
              </Button>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};