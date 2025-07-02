import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { ResumeVisualPreview } from '@/components/resume/ResumeVisualPreview';
import { ResumeData } from '@/utils/types';
import { usePDFGenerator } from '@/hooks/usePDFGenerator';
import { toast } from 'sonner';

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
  const resumeName = resume.personal?.name || 'resume';
  const { isGenerating, generatePDF } = usePDFGenerator(`${resumeName}.pdf`);

  const handleDownload = () => {
    if (resumeRef.current) {
      generatePDF(resumeRef.current);
    } else {
      toast.error("Could not find resume content to download.");
    }
  };
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
        <h3 className="text-lg font-semibold">Live Preview</h3>
        <Button onClick={handleDownload} size="sm" disabled={isGenerating} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          {isGenerating ? 'Generating...' : 'Download PDF'}
        </Button>
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
