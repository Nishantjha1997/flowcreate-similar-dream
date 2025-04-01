
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { ResumeData } from '@/utils/resumeTemplates';
import { Download, Eye, Printer } from 'lucide-react';
import { toast } from 'sonner';

interface ResumePreviewProps {
  resumeData: ResumeData;
  previewComponent: React.ReactNode;
}

export const ResumePreview = ({ resumeData, previewComponent }: ResumePreviewProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const resumeRef = useRef<HTMLDivElement>(null);
  
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
      dummyLink.download = `${resumeData.personal?.name || 'resume'}.pdf`;
      document.body.appendChild(dummyLink);
      dummyLink.click();
      document.body.removeChild(dummyLink);
    }, 1500);
  };

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      const printWindow = window.open('', '_blank');
      
      if (printWindow && resumeRef.current) {
        printWindow.document.write(`
          <html>
            <head>
              <title>${resumeData.personal?.name || 'Resume'}</title>
              <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
              <style>
                @media print {
                  body { 
                    margin: 0;
                    padding: 0;
                    background: white;
                  }
                  .resume-container {
                    width: 8.5in;
                    height: 11in;
                    margin: 0 auto;
                    padding: 0.5in;
                    box-shadow: none;
                  }
                  @page {
                    size: letter;
                    margin: 0;
                  }
                }
                body { font-family: 'Roboto', sans-serif; }
                .resume-container {
                  background: white;
                  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                }
              </style>
            </head>
            <body onload="window.print();window.close()">
              <div class="resume-container">
                ${resumeRef.current.innerHTML}
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
      
      setIsPrinting(false);
      toast.success("Resume sent to printer!");
    }, 500);
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
          <div ref={resumeRef} className="bg-white rounded-md shadow-md p-6 mb-4">
            {previewComponent}
          </div>
          
          <div className="flex justify-center gap-3 mt-4">
            <Button 
              onClick={handleDownload} 
              disabled={isGenerating}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              {isGenerating ? "Generating PDF..." : "Download PDF"}
            </Button>
            <Button 
              onClick={handlePrint} 
              disabled={isPrinting}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Printer className="h-4 w-4" />
              {isPrinting ? "Preparing..." : "Print Resume"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
