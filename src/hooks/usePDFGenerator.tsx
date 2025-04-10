
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
    
    // Enhanced PDF options for higher quality
    const options = {
      margin: [10, 10, 10, 10],
      filename: fileName,
      image: { type: 'jpeg', quality: 0.99 },
      html2canvas: { 
        scale: 3, // Increase scale for higher resolution
        useCORS: true,
        logging: false,
        letterRendering: true,
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait',
        compress: false // Better quality with no compression
      }
    };

    // Clone the element to avoid manipulating the visible DOM
    const clonedElement = element.cloneNode(true) as HTMLElement;
    
    // Create a temporary container with proper styling
    const container = document.createElement('div');
    container.appendChild(clonedElement);
    container.style.width = '8.5in';
    container.style.padding = '0.5in';
    container.style.backgroundColor = 'white';
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
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
