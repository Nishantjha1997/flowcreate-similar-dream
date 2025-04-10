
import React from 'react';
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
        <div className="resume-container" style={{ display: 'none' }}>
          <ResumeVisualPreview 
            resume={resume}
            templateId={templateId}
            templateNames={templateNames}
          />
        </div>
        <ResumeVisualPreview 
          resume={resume}
          templateId={templateId}
          templateNames={templateNames}
        />
      </CardContent>
    </Card>
  );
};
