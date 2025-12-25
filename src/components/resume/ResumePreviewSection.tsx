import React from 'react';
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
    <div className="h-full flex flex-col rounded-lg border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-2.5 border-b bg-muted/30">
        <h3 className="text-sm font-semibold">Live Preview</h3>
      </div>
      
      {/* Preview Content - Takes remaining height */}
      <div className="flex-1 overflow-auto bg-muted/20 p-4 min-h-[500px]">
        <div 
          className="resume-container bg-white rounded shadow-sm mx-auto max-w-[800px]" 
          id="resume-preview-container" 
          ref={resumeRef}
        >
          <ResumeVisualPreview 
            resume={resume}
            templateId={templateId}
            templateNames={templateNames}
            sectionOrder={sectionOrder}
            hiddenSections={hiddenSections}
          />
        </div>
      </div>
    </div>
  );
};