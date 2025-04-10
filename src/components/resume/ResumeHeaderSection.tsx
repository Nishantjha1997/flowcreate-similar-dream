
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Share2 } from 'lucide-react';
import { toast } from 'sonner';

interface ResumeHeaderSectionProps {
  handleDownload: () => void;
  isGenerating: boolean;
}

export const ResumeHeaderSection = ({ handleDownload, isGenerating }: ResumeHeaderSectionProps) => {
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
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
