import { Download, FileText, Printer, FileType } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

interface DocumentExportActionsProps {
  onSemanticExport: () => void;
  onImageExport: () => void;
  isImageGenerating?: boolean;
  onDocxExport?: () => void;
  onTxtExport?: () => void;
  isPremium?: boolean;
  className?: string;
}

/**
 * Keeps the export contract identical across document builders: semantic HTML
 * printing is the primary ATS-friendly path, while the rasterized PDF, DOCX,
 * and plain-text options remain available as secondary formats. onTxtExport
 * is optional since not every document type has a meaningful plain-text form.
 */
export function DocumentExportActions({
  onSemanticExport,
  onImageExport,
  isImageGenerating = false,
  onDocxExport,
  onTxtExport,
  isPremium = false,
  className,
}: DocumentExportActionsProps) {
  return (
    <div
      className={cn('flex flex-wrap items-center gap-2', className)}
      role="group"
      aria-label="Download options"
    >
      <Button
        type="button"
        size="sm"
        onClick={onSemanticExport}
        className="h-8 rounded-full px-4 text-xs font-semibold shadow-sm"
        title="Preserves selectable text and links for applicant tracking systems"
      >
        <Printer className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
        Download PDF (ATS-friendly)
      </Button>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onImageExport}
        disabled={isImageGenerating}
        className="h-8 rounded-full border-border/50 px-4 text-xs font-medium"
        title="Creates an image-based PDF with exact visual fidelity; text may not be ATS-readable"
      >
        {isImageGenerating ? (
          <Spinner size="xs" className="mr-1.5" />
        ) : (
          <Download className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
        )}
        {isImageGenerating ? 'Creating exact-look PDF…' : 'Exact-look PDF (image)'}
      </Button>

      {onDocxExport && (
        <Button type="button" variant="outline" size="sm" onClick={onDocxExport} className="h-8 rounded-full border-border/50 px-4 text-xs font-medium" title={isPremium ? 'Download an ATS-friendly Word document' : 'DOCX export is a Premium feature'}>
          <FileText className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
          {isPremium ? 'Download DOCX' : 'DOCX · Premium'}
        </Button>
      )}

      {onTxtExport && (
        <Button type="button" variant="outline" size="sm" onClick={onTxtExport} className="h-8 rounded-full border-border/50 px-4 text-xs font-medium" title="Download as plain text, ready to paste into an application form">
          <FileType className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
          TXT
        </Button>
      )}
    </div>
  );
}
