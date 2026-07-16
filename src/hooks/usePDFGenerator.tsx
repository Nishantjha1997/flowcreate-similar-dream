
import { useState } from 'react';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// A4 dimensions in mm and points.
const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;

export const usePDFGenerator = (fileName: string = 'document') => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = (element: HTMLElement | null) => {
    if (!element) {
      toast.error("Could not generate PDF. Please try again.");
      return;
    }

    setIsGenerating(true);
    toast.info("Generating PDF...", { duration: 3000 });

    // Use the innermost resume element if available; otherwise use root.
    // We must NOT force padding on full-bleed/sidebar templates — they
    // handle their own spacing internally.
    const resumeContent =
      element.querySelector<HTMLElement>('.resume-content') ||
      element.querySelector<HTMLElement>('.resume-container') ||
      element;

    // Off-screen clone.
    const container = document.createElement('div');
    container.style.cssText = [
      'position:absolute',
      'left:-9999px',
      'top:-9999px',
      // Render at exactly 8.5in wide so pixel-to-mm ratio is correct.
      'width:816px',        // 8.5in × 96dpi
      'height:auto',
      'padding:0',
      'margin:0',
      'background:white',
    ].join(';');

    container.innerHTML = resumeContent.outerHTML;

    // Reset any live-preview transforms on the clone's root element.
    const cloneRoot = container.firstElementChild as HTMLElement | null;
    if (cloneRoot) {
      cloneRoot.style.transform = 'none';
      cloneRoot.style.width = '100%';
      cloneRoot.style.height = 'auto';
      cloneRoot.style.margin = '0';
      // Do NOT set padding here — full-bleed templates own their own padding.
      cloneRoot.style.boxSizing = 'border-box';
      cloneRoot.style.overflow = 'visible';
    }

    document.body.appendChild(container);

    setTimeout(async () => {
      try {
        const canvas = await html2canvas(container, {
          scale: 3,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
        });

        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();   // 210 mm
        const pdfHeight = pdf.internal.pageSize.getHeight(); // 297 mm

        // Canvas pixels per mm (canvas is rendered at 3× scale of 816px = 8.5in).
        const canvasMmWidth = (canvas.width / 3 / 96) * 25.4; // should be ~210 mm
        const scale = pdfWidth / canvas.width;                 // mm per canvas pixel

        // Height of one A4 page in canvas pixels.
        const pageHeightPx = pdfHeight / scale;

        const totalPages = Math.ceil(canvas.height / pageHeightPx);

        for (let page = 0; page < totalPages; page++) {
          if (page > 0) pdf.addPage();

          // Slice: create a temporary canvas for each page slice.
          const srcY = Math.round(page * pageHeightPx);
          const srcH = Math.min(Math.round(pageHeightPx), canvas.height - srcY);

          const sliceCanvas = document.createElement('canvas');
          sliceCanvas.width = canvas.width;
          sliceCanvas.height = Math.round(pageHeightPx);

          const ctx = sliceCanvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
            ctx.drawImage(canvas, 0, srcY, canvas.width, srcH, 0, 0, canvas.width, srcH);
          }

          const imgData = sliceCanvas.toDataURL('image/jpeg', 0.97);
          pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
        }

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
