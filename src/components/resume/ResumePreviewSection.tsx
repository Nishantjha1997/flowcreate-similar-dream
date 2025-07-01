import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ResumeVisualPreview } from '@/components/resume/ResumeVisualPreview';
import { ResumeData } from '@/utils/types';

interface ResumePreviewSectionProps {
  resume: ResumeData;
  templateId: string;
  templateNames: Record<string, string>;
  resumeRef: React.RefObject<HTMLDivElement>;
  sectionOrder: string[];
  hiddenSections: string[];
}

export const ResumePreviewSection = ({ 
  resume, 
  templateId, 
  templateNames,
  resumeRef,
  sectionOrder,
  hiddenSections
}: ResumePreviewSectionProps) => {
  
  return (
    <Card className="h-full flex flex-col">
      <CardContent className="flex-1 p-0 relative overflow-auto">
        <div className="resume-container h-full" id="resume-preview-container" ref={resumeRef}>
          <ResumeVisualPreview 
            resume={resume}
            templateId={templateId}
            templateNames={templateNames}
            sectionOrder={sectionOrder}
            hiddenSections={hiddenSections}
          />
        </div>
      </CardContent>
    </Card>
  );
};
