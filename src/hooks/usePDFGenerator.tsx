
import { useState } from 'react';
import { toast } from 'sonner';
import { A4_WIDTH_PX, A4_HEIGHT_PX, A4_WIDTH_MM, A4_HEIGHT_MM } from '@/constants/pdfDimensions';
import { captureError } from '@/lib/monitoring';

export const usePDFGenerator = (fileName: string = 'document') => {
  const [isGenerating, setIsGenerating] = useState(false);

  /**
   * Open the browser's native print dialog with the resume rendered as real
   * HTML text. Saving this dialog as PDF preserves selectable text and links,
   * which is materially more ATS-friendly than the image-based quick export.
   */
  const printResume = (element: HTMLElement | null) => {
    if (!element) {
      toast.error('Could not prepare the resume for printing.');
      return;
    }

    const resumeContent =
      element.querySelector<HTMLElement>('.resume-content')
      || element.querySelector<HTMLElement>('.resume-container')
      || element;
    const printWindow = window.open('', '_blank', 'popup,width=900,height=1000');

    if (!printWindow) {
      toast.error('Your browser blocked the print window. Allow pop-ups and try again.');
      return;
    }
    printWindow.opener = null;

    const printDocument = printWindow.document;
    printDocument.open();
    printDocument.write('<!doctype html><html><head></head><body></body></html>');
    printDocument.close();
    printDocument.title = fileName.replace(/\.pdf$/i, '') || 'resume';

    document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]').forEach((link) => {
      printDocument.head.appendChild(link.cloneNode(true));
    });

    const printStyles = printDocument.createElement('style');
    printStyles.textContent = `
      @page { size: A4; margin: 0; }
      html, body { margin: 0; padding: 0; background: #fff; }
      body { width: 210mm; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .resume-print-root { width: 210mm; margin: 0; padding: 0; background: #fff; }
      .resume-print-root > * { width: 210mm !important; max-width: none !important; margin: 0 !important; box-shadow: none !important; border-radius: 0 !important; }
      .resume-print-root a { color: inherit; text-decoration: none; }
      .resume-print-root [data-resume-item] { break-inside: avoid; page-break-inside: avoid; }
      @media print { .resume-print-root { display: block; } }
    `;
    printDocument.head.appendChild(printStyles);

    const printRoot = printDocument.createElement('div');
    printRoot.className = 'resume-print-root';
    printRoot.innerHTML = resumeContent.outerHTML;
    printDocument.body.appendChild(printRoot);

    const triggerPrint = async () => {
      try {
        await printDocument.fonts?.ready;
      } finally {
        printWindow.focus();
        printWindow.print();
      }
    };

    printWindow.onafterprint = () => printWindow.close();
    window.setTimeout(triggerPrint, 350);
    toast.info('Choose “Save as PDF” in the print dialog for an ATS-friendly file.');
  };

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
      `width:${A4_WIDTH_PX}px`,        // A4 width at 96dpi
      'height:auto',
      'padding:0',
      'margin:0',
      'background:white',
      'overflow:hidden',
    ].join(';');

    container.innerHTML = resumeContent.outerHTML;

    // Reset any live-preview transforms on the clone's root element.
    const cloneRoot = container.firstElementChild as HTMLElement | null;
    if (cloneRoot) {
      cloneRoot.style.transform = 'none';
      cloneRoot.style.width = `${A4_WIDTH_PX}px`;
      cloneRoot.style.maxWidth = '100%';
      cloneRoot.style.height = 'auto';
      cloneRoot.style.margin = '0';
      // Do NOT set padding here — full-bleed templates own their own padding.
      cloneRoot.style.boxSizing = 'border-box';
      cloneRoot.style.overflow = 'hidden';
    }

    document.body.appendChild(container);

    setTimeout(async () => {
      try {
        const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
          import('html2canvas'),
          import('jspdf'),
        ]);
        const canvas = await html2canvas(container, {
          scale: 3,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          windowWidth: A4_WIDTH_PX,
          width: A4_WIDTH_PX,
        });

        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();   // 210 mm
        const pdfHeight = pdf.internal.pageSize.getHeight(); // 297 mm

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
        captureError(error, { context: 'pdf_generation' });
        setIsGenerating(false);
        toast.error("Error generating PDF. Please try again.");
      } finally {
        if (container.parentNode) {
          document.body.removeChild(container);
        }
      }
    }, 300);
  };

  return { isGenerating, generatePDF, printResume };
};
