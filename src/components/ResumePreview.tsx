
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { ResumeData } from '@/utils/resumeTemplates';
import { Download, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface ResumePreviewProps {
  resumeData: ResumeData;
  previewComponent: React.ReactNode;
}

export const ResumePreview = ({ resumeData, previewComponent }: ResumePreviewProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  
  const handleDownload = () => {
    setIsGenerating(true);
    // Simulating a delay for PDF generation
    setTimeout(() => {
      setIsGenerating(false);
      // In a real implementation, we would use a library like jsPDF or html2pdf
      // to generate and download the PDF
      
      toast.success("Resume downloaded successfully!");
      
      // This is a placeholder - in a real implementation we would 
      // trigger the actual download here
      const dummyLink = document.createElement('a');
      dummyLink.href = 'data:application/pdf;charset=utf-8,';
      dummyLink.download = `${resumeData.personalInfo?.name || 'resume'}.pdf`;
      document.body.appendChild(dummyLink);
      dummyLink.click();
      document.body.removeChild(dummyLink);
    }, 1500);
  };
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full flex items-center gap-2 mb-4">
          <Eye className="h-4 w-4" /> Preview Resume
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <div className="p-2">
          <div className="bg-white rounded-md shadow-md p-6 mb-4">
            {previewComponent}
          </div>
          
          <div className="flex justify-center mt-4">
            <Button 
              onClick={handleDownload} 
              disabled={isGenerating}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              {isGenerating ? "Generating PDF..." : "Download PDF"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
