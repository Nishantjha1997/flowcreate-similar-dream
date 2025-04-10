
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
    
    const options = {
      margin: [10, 10, 10, 10],
      filename: fileName,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

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

  return { isGenerating, generatePDF };
};
