import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
        <h3 className="text-lg font-semibold">Live Preview</h3>
      </CardHeader>
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
