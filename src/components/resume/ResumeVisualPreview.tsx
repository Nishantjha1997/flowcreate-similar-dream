
import { useRef } from 'react';
import { FileText } from 'lucide-react';
import { ResumePreview } from '@/components/ResumePreview';
import ResumeTemplate from '@/utils/resumeTemplates';
import { ResumeData, adaptResumeData } from '@/utils/resumeAdapterUtils';

interface ResumeVisualPreviewProps {
  resume: ResumeData;
  templateId: string;
  templateNames: Record<string, string>;
  sectionOrder?: string[];
  hiddenSections?: string[];
}

export const ResumeVisualPreview = ({ resume, templateId, templateNames, sectionOrder, hiddenSections }: ResumeVisualPreviewProps) => {
  const resumeRef = useRef<HTMLDivElement>(null);
  
  const hasContent = resume.personal.name || resume.experience.some(e => e.title || e.company);

  // If sectionOrder/hiddenSections provided by props, use them, otherwise fallback to default template
  const getOrderedSections = () => {
    if (!sectionOrder) return undefined;
    const visibleSections = sectionOrder.filter(section => !hiddenSections?.includes(section));
    return visibleSections;
  };

  return (
    <div className="h-full w-full relative">
      {hasContent ? (
        <div className="absolute inset-0 overflow-auto p-4">
          <div className="w-full" style={{ transformOrigin: "top left" }}>
            <div ref={resumeRef} className="bg-white shadow-sm resume-content">
              <ResumeTemplate 
                data={resume} 
                templateName={templateNames[templateId] || 'modern'}
                sectionOrder={getOrderedSections()}
              />
            </div>
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
  const adaptedData = adaptResumeData(resume);
  
  return (
    <ResumePreview
      resumeData={adaptedData}
      previewComponent={
        <ResumeTemplate 
          data={resume} 
          templateName={templateNames[templateId] || 'modern'} 
        />
      }
    />
  );
};
