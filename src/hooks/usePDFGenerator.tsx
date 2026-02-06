
import { useState } from 'react';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export const usePDFGenerator = (fileName: string = 'document') => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = (element: HTMLElement | null) => {
    if (!element) {
      toast.error("Could not generate PDF. Please try again.");
      return;
    }

    setIsGenerating(true);
    toast.info("Generating PDF...", { duration: 3000 });
    
    // Create a clone of the resume content for PDF generation
    const container = document.createElement('div');
    
    const resumeContent = element.querySelector('.resume-content') || 
                          element.querySelector('.resume-container') || 
                          element;
    
    if (!resumeContent) {
      toast.error("Could not find resume content to download.");
      setIsGenerating(false);
      return;
    }
    
    container.innerHTML = resumeContent.innerHTML;
    container.style.width = '8.5in';
    container.style.height = 'auto';
    container.style.padding = '0';
    container.style.backgroundColor = 'white';
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    
    const resumeElement = container.firstElementChild as HTMLElement;
    if (resumeElement) {
      resumeElement.style.transform = 'none';
      resumeElement.style.width = '100%';
      resumeElement.style.height = 'auto';
      resumeElement.style.margin = '0';
      resumeElement.style.padding = '0.5in';
      resumeElement.style.boxSizing = 'border-box';
      resumeElement.style.backgroundColor = 'white';
      resumeElement.style.overflow = 'visible';
    }
    
    document.body.appendChild(container);

    setTimeout(async () => {
      try {
        const canvas = await html2canvas(container, {
          scale: 3,
          useCORS: true,
          logging: false,
        });
        
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
        });
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
        const imgX = (pdfWidth - imgWidth * ratio) / 2;
        
        pdf.addImage(imgData, 'JPEG', imgX, 0, imgWidth * ratio, imgHeight * ratio);
        pdf.save(fileName);
        
        setIsGenerating(false);
        toast.success("Resume downloaded successfully!");
      } catch (error) {
        console.error("Error generating PDF:", error);
        setIsGenerating(false);
        toast.error("Error generating PDF. Please try again.");
      } finally {
        if (container.parentNode) {
          document.body.removeChild(container);
        }
      }
    }, 300);
  };

  return { isGenerating, generatePDF };
};
