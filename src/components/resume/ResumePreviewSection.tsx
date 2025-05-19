
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { ResumeVisualPreview, EnhancedResumePreview } from '@/components/resume/ResumeVisualPreview';
import { ResumeData } from '@/utils/types';

interface ResumePreviewSectionProps {
  resume: ResumeData;
  templateId: string;
  templateNames: Record<string, string>;
  resumeRef: React.RefObject<HTMLDivElement>;
  handleDownload: () => void;
  isGenerating: boolean;
  sectionOrder: string[];
  hiddenSections: string[];
}

export const ResumePreviewSection = ({ 
  resume, 
  templateId, 
  templateNames,
  resumeRef,
  handleDownload,
  isGenerating,
  sectionOrder,
  hiddenSections
}: ResumePreviewSectionProps) => {
  
  return (
    <Card className="h-full flex flex-col">
      <div className="p-4 bg-muted flex items-center justify-between border-b">
        <h3 className="font-medium">Preview</h3>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDownload}
            disabled={isGenerating}
            className="flex items-center gap-1"
          >
            <Download className="h-3 w-3" />
            {isGenerating ? 'Generating...' : 'PDF'}
          </Button>
          
          <EnhancedResumePreview 
            resume={resume}
            templateId={templateId}
            templateNames={templateNames}
          />
        </div>
      </div>
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
