import React from 'react';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { ResumeData } from '@/utils/types';
import { Download, Eye, Printer, Share2, Mail, Link, Smartphone } from 'lucide-react';
import { toast } from 'sonner';
import { usePDFGenerator } from '@/hooks/usePDFGenerator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ResumePreviewProps {
  resumeData: ResumeData;
  previewComponent: React.ReactElement<{
    sectionOrder?: string[];
    hiddenSections?: string[];
  }>;
  sectionOrder?: string[];
  hiddenSections?: string[];
}

/**
 * ResumePreview component for displaying, downloading, printing and sharing resumes
 * @param {ResumePreviewProps} props - Component props
 * @returns {JSX.Element} The resume preview component
 */
export const ResumePreview = ({
  resumeData,
  previewComponent,
  sectionOrder,
  hiddenSections
}: ResumePreviewProps) => {
  const resumeRef = useRef<HTMLDivElement>(null);
  const fileName = `${resumeData.personal?.name || 'resume'}.pdf`;
  const { isGenerating, generatePDF, printResume } = usePDFGenerator(fileName);
  const handleDownload = () => generatePDF(resumeRef.current);
  const handlePrint = () => printResume(resumeRef.current);

  /**
   * Shares the resume via different methods
   * @param {string} method - The sharing method to use
   */
  function handleShare(method: 'email' | 'link' | 'phone') {
    switch (method) {
      case 'email': {
        const emailSubject = `Resume: ${resumeData.personal?.name || 'My Resume'}`;
        const emailBody = "Please find my resume attached.";
        window.location.href = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
        toast.success("Email client opened");
        break;
      }
        
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
          <Eye className="h-4 w-4" /> Preview & Download
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <div className="p-2">
          <div ref={resumeRef} className="bg-white rounded-md shadow-md p-6 mb-4 resume-content">
            {/* Pass the extra props for live PDF preview */}
            {React.cloneElement(
              previewComponent,
              {
                sectionOrder,
                hiddenSections
              }
            )}
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
              variant="outline"
              className="flex items-center gap-2"
            >
              <Printer className="h-4 w-4" />
              ATS PDF / Print
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
