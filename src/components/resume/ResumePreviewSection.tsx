
import React, { useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ResumeVisualPreview, EnhancedResumePreview } from '@/components/resume/ResumeVisualPreview';
import { ResumeData } from '@/utils/resumeAdapterUtils';

interface ResumePreviewSectionProps {
  resume: ResumeData;
  templateId: string;
  templateNames: Record<string, string>;
}

export const ResumePreviewSection = ({ 
  resume, 
  templateId, 
  templateNames 
}: ResumePreviewSectionProps) => {
  const resumeRef = useRef<HTMLDivElement>(null);
  
  return (
    <Card className="h-full flex flex-col">
      <div className="p-4 bg-muted flex items-center justify-between border-b">
        <h3 className="font-medium">Preview</h3>
        <EnhancedResumePreview 
          resume={resume}
          templateId={templateId}
          templateNames={templateNames}
        />
      </div>
      <CardContent className="flex-1 p-0 relative overflow-auto">
        <div className="resume-container" id="resume-preview-container" ref={resumeRef}>
          <ResumeVisualPreview 
            resume={resume}
            templateId={templateId}
            templateNames={templateNames}
          />
        </div>
      </CardContent>
    </Card>
  );
};
