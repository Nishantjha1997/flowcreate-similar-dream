
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { ResumeData } from '@/utils/types';
import { Download, Eye, Printer, Share2, Mail, Link, Smartphone } from 'lucide-react';
import { toast } from 'sonner';
import html2pdf from 'html2pdf.js';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ResumePreviewProps {
  resumeData: ResumeData;
  previewComponent: React.ReactNode;
}

/**
 * ResumePreview component for displaying, downloading, printing and sharing resumes
 * @param {ResumePreviewProps} props - Component props
 * @returns {JSX.Element} The resume preview component
 */
export const ResumePreview = ({ resumeData, previewComponent }: ResumePreviewProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const resumeRef = useRef<HTMLDivElement>(null);
  
  /**
   * Generates and downloads the resume as a PDF
   */
  const handleDownload = () => {
    if (!resumeRef.current) {
      toast.error("Could not generate PDF. Please try again.");
      return;
    }

    setIsGenerating(true);
    
    const element = resumeRef.current;
    const filename = `${resumeData.personal?.name || 'resume'}.pdf`;
    
    const options = {
      margin: [10, 10, 10, 10],
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Use setTimeout to allow the toast to show before the potentially heavy PDF operation
    setTimeout(() => {
      html2pdf()
        .from(element)
        .set(options)
        .save()
        .then(() => {
          setIsGenerating(false);
          toast.success("Resume downloaded successfully!");
        })
        .catch((error) => {
          console.error("Error generating PDF:", error);
          setIsGenerating(false);
          toast.error("Error generating PDF. Please try again.");
        });
    }, 100);
  };

  /**
   * Prepares and initiates the print dialog for the resume
   */
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

  /**
   * Shares the resume via different methods
   * @param {string} method - The sharing method to use
   */
  function handleShare(method: 'email' | 'link' | 'phone') {
    switch (method) {
      case 'email':
        const emailSubject = `Resume: ${resumeData.personal?.name || 'My Resume'}`;
        const emailBody = "Please find my resume attached.";
        window.location.href = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
        toast.success("Email client opened");
        break;
        
      case 'link':
        // In a real app, this would generate a shareable link to the resume
        // For now, we'll just copy the current page URL
        navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
        break;
        
      case 'phone':
        // Open SMS if on mobile or prompt to enter phone number
        if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
          window.location.href = `sms:?body=Check out my resume: ${window.location.href}`;
          toast.success("SMS app opened");
        } else {
          toast.info("Send to phone feature works best on mobile devices");
          // In a real app, you might add a modal to input a phone number
        }
        break;
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2 text-sm">
          <Eye className="h-4 w-4" /> Full Preview
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

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleShare('email')} className="cursor-pointer">
                  <Mail className="mr-2 h-4 w-4" />
                  <span>Share via Email</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleShare('link')} className="cursor-pointer">
                  <Link className="mr-2 h-4 w-4" />
                  <span>Copy Link</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleShare('phone')} className="cursor-pointer">
                  <Smartphone className="mr-2 h-4 w-4" />
                  <span>Send to Phone</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
