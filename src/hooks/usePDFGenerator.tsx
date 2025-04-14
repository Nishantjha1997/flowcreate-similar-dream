
import { useState } from 'react';
import html2pdf from 'html2pdf.js';
import { toast } from 'sonner';

export const usePDFGenerator = (fileName: string = 'document') => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = (element: HTMLElement | null) => {
    if (!element) {
      toast.error("Could not generate PDF. Please try again.");
      return;
    }

    setIsGenerating(true);
    
    // Max quality PDF options
    const options = {
      margin: [10, 10, 10, 10],
      filename: fileName,
      image: { type: 'jpeg', quality: 1.0 },
      html2canvas: { 
        scale: 4, // Higher scale for maximum resolution
        useCORS: true,
        logging: false,
        letterRendering: true,
        dpi: 300, // Higher DPI for print quality
        removeContainer: false
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait',
        compress: false, // Better quality with no compression
        precision: 16 // Higher precision for better text rendering
      }
    };

    // Extract the actual resume content to avoid scaling issues
    const resumeContent = element.querySelector('.resume-container') || element;
    
    // Create a proper clone with full styling for PDF generation
    const container = document.createElement('div');
    container.innerHTML = resumeContent.innerHTML;
    container.style.width = '8.5in';
    container.style.height = 'auto';
    container.style.padding = '0';
    container.style.backgroundColor = 'white';
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    
    // Apply styling to ensure proper rendering
    const resumeElement = container.firstElementChild as HTMLElement;
    if (resumeElement) {
      resumeElement.style.transform = 'none'; // Remove any scaling
      resumeElement.style.width = '100%';
      resumeElement.style.height = 'auto';
      resumeElement.style.margin = '0';
      resumeElement.style.padding = '0.5in';
      resumeElement.style.boxSizing = 'border-box';
      resumeElement.style.backgroundColor = 'white';
      resumeElement.style.overflow = 'visible';
    }
    
    document.body.appendChild(container);

    setTimeout(() => {
      html2pdf()
        .from(container)
        .set(options)
        .save()
        .then(() => {
          setIsGenerating(false);
          toast.success("Resume downloaded successfully!");
          // Remove the temporary container
          if (container.parentNode) {
            document.body.removeChild(container);
          }
        })
        .catch((error) => {
          console.error("Error generating PDF:", error);
          setIsGenerating(false);
          toast.error("Error generating PDF. Please try again.");
          // Remove the temporary container on error as well
          if (container.parentNode) {
            document.body.removeChild(container);
          }
        });
    }, 100);
  };

  return { isGenerating, generatePDF };
};
