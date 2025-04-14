
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { usePDFGenerator } from '@/hooks/usePDFGenerator';

interface ResumeHeaderSectionProps {
  resumeElementRef: React.RefObject<HTMLDivElement>;
  resumeName: string;
  handleShare: () => void;
}

export const ResumeHeaderSection = ({ 
  resumeElementRef,
  resumeName,
  handleShare 
}: ResumeHeaderSectionProps) => {
  const { isGenerating, generatePDF } = usePDFGenerator(`${resumeName}.pdf`);

  const handleDownload = () => {
    if (!resumeElementRef.current) {
      toast.error("Could not find resume content to download.");
      return;
    }
    
    // Use the same generator function as the preview
    generatePDF(resumeElementRef.current);
  };

  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">Resume Builder</h1>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleDownload}
          disabled={isGenerating}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4 mr-2" />
          {isGenerating ? "Generating PDF..." : "Download PDF"}
        </Button>
        <Button size="sm" onClick={handleShare}>
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </div>
    </div>
  );
};
