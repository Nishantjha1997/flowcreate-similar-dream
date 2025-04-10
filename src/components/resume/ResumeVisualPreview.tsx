
import { useRef } from 'react';
import { FileText } from 'lucide-react';
import { ResumePreview } from '@/components/ResumePreview';
import ResumeTemplate from '@/utils/resumeTemplates';
import { ResumeData, adaptResumeData } from '@/utils/resumeAdapterUtils';

interface ResumeVisualPreviewProps {
  resume: ResumeData;
  templateId: string;
  templateNames: Record<string, string>;
}

export const ResumeVisualPreview = ({ resume, templateId, templateNames }: ResumeVisualPreviewProps) => {
  const resumeRef = useRef<HTMLDivElement>(null);
  
  // Check if resume has at least some content to display
  const hasContent = resume.personal.name || resume.experience.some(e => e.title || e.company);
  
  return (
    <div className="flex-1 p-0 relative overflow-auto">
      {hasContent ? (
        <div className="absolute inset-0 overflow-auto" style={{ zoom: 0.65 }}>
          <div ref={resumeRef}>
            <ResumeTemplate 
              data={resume} 
              templateName={templateNames[templateId] || 'modern'} 
            />
          </div>
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-background border-dashed border-2 m-4 rounded-md">
          <div className="text-center p-4">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="text-lg font-medium mt-2">Resume Preview</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Start filling in your information to see your resume take shape.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export const EnhancedResumePreview = ({ resume, templateId, templateNames }: ResumeVisualPreviewProps) => {
  return (
    <ResumePreview
      resumeData={adaptResumeData(resume)}
      previewComponent={
        <ResumeTemplate 
          data={resume} 
          templateName={templateNames[templateId] || 'modern'} 
        />
      }
    />
  );
};
