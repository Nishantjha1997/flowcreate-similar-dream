
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
    toast.info("Generating PDF...", { duration: 3000 });
    
    // Ultra high quality PDF options
    const options = {
      margin: [10, 10, 10, 10],
      filename: fileName,
      image: { type: 'jpeg', quality: 1.0 },
      html2canvas: { 
        scale: 5, // Higher scale for maximum resolution
        useCORS: true,
        logging: false,
        letterRendering: true,
        dpi: 600, // Higher DPI for print quality
        removeContainer: false
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait',
        compress: false, // Better quality with no compression
        precision: 32 // Higher precision for better text rendering
      }
    };

    // Create a clone of the resume content for PDF generation
    const container = document.createElement('div');
    
    // Find the proper resume content
    const resumeContent = element.querySelector('.resume-content') || 
                          element.querySelector('.resume-container') || 
                          element;
    
    // Make sure we're getting the actual content
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

    // Add a slight delay to ensure container is rendered
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
    }, 300);
  };

  return { isGenerating, generatePDF };
};
