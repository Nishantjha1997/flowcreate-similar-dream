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

export const ResumeVisualPreview = ({
  resume,
  templateId,
  templateNames,
  sectionOrder,
  hiddenSections
}: ResumeVisualPreviewProps) => {
  const resumeRef = useRef<HTMLDivElement>(null);
  
  const hasContent = resume.personal.name || resume.experience.some(e => e.title || e.company);

  // If sectionOrder/hiddenSections provided by props, use them, otherwise fallback to default template
  const getOrderedSections = () => {
    if (!sectionOrder) return undefined;
    const visibleSections = sectionOrder.filter(section => !hiddenSections?.includes(section));
    return visibleSections;
  };

  if (!hasContent) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-muted/30 border-dashed border-2 rounded-md">
        <div className="text-center p-6">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="text-lg font-medium mt-3">Resume Preview</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-[250px]">
            Start filling in your information to see your resume take shape.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={resumeRef} className="resume-content">
      <ResumeTemplate 
        data={resume} 
        templateName={templateNames[templateId] || 'modern'}
        sectionOrder={getOrderedSections()}
        hiddenSections={hiddenSections}
      />
    </div>
  );
};

export const EnhancedResumePreview = ({
  resume,
  templateId,
  templateNames,
  sectionOrder,
  hiddenSections
}: ResumeVisualPreviewProps) => {
  const adaptedData = adaptResumeData(resume);

  return (
    <ResumePreview
      resumeData={adaptedData}
      previewComponent={
        <ResumeTemplate 
          data={resume} 
          templateName={templateNames[templateId] || 'modern'}
          sectionOrder={sectionOrder}
          hiddenSections={hiddenSections}
        />
      }
      sectionOrder={sectionOrder}
      hiddenSections={hiddenSections}
    />
  );
};