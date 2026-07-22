import { Download, Loader2, Printer } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DocumentExportActionsProps {
  onSemanticExport: () => void;
  onImageExport: () => void;
  isImageGenerating?: boolean;
  className?: string;
}

/**
 * Keeps the export contract identical across document builders: semantic HTML
 * printing is the primary ATS-friendly path, while the rasterized PDF remains
 * available for users who prioritize exact visual fidelity.
 */
export function DocumentExportActions({
  onSemanticExport,
  onImageExport,
  isImageGenerating = false,
  className,
}: DocumentExportActionsProps) {
  return (
    <div
      className={cn('flex flex-wrap items-center gap-2', className)}
      role="group"
      aria-label="PDF download options"
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
          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" aria-hidden="true" />
        ) : (
          <Download className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
        )}
        {isImageGenerating ? 'Creating exact-look PDF…' : 'Exact-look PDF (image)'}
      </Button>
    </div>
  );
}
