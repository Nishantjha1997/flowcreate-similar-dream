import { useState } from 'react';
import { AlertTriangle, ScanEye } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AppDialogContent } from '@/components/ui/app-dialog';
import { extractAtsSemanticDocument, type AtsSemanticDocument } from '@/utils/atsSemanticDocument';

interface RecruiterViewProps {
  /** Returns the currently rendered document element, read fresh each time the dialog opens. */
  getElement: () => HTMLElement | null;
  triggerLabel?: string;
  className?: string;
}

/**
 * "See what an ATS sees" - runs the same DOM-order extraction the semantic
 * PDF export uses (extractAtsSemanticDocument) against the live preview, so
 * the linearized text and warnings shown here are guaranteed to match what
 * gets exported, not a separate approximation.
 */
export function RecruiterView({ getElement, triggerLabel = 'See what an ATS sees', className }: RecruiterViewProps) {
  const [result, setResult] = useState<AtsSemanticDocument | null>(null);
  const [notReady, setNotReady] = useState(false);

  const handleOpenChange = (open: boolean) => {
    if (!open) return;
    const element = getElement();
    if (!element) {
      setResult(null);
      setNotReady(true);
      return;
    }
    setNotReady(false);
    setResult(extractAtsSemanticDocument(element));
  };

  return (
    <Dialog onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={className ?? 'h-8 rounded-full border-border/50 px-4 text-xs font-medium'}
          title="Preview the linearized text an applicant tracking system would extract"
        >
          <ScanEye className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <AppDialogContent size="lg">
        <DialogHeader>
          <DialogTitle>What an ATS sees</DialogTitle>
          <DialogDescription>
            The same linearized reading order your semantic (ATS-friendly) PDF export produces -
            not how the document looks, but what an applicant tracking system actually reads from it.
          </DialogDescription>
        </DialogHeader>

        {notReady ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Could not read this document yet - open the preview and try again.
          </p>
        ) : result ? (
          <div className="space-y-4">
            {result.warnings.length > 0 && (
              <div className="space-y-2">
                {result.warnings.map((warning) => (
                  <div
                    key={`${warning.code}:${warning.message}`}
                    className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 p-2.5 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950/20 dark:text-amber-200"
                  >
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span>{warning.message}</span>
                  </div>
                ))}
              </div>
            )}
            <pre className="max-h-[50vh] overflow-y-auto whitespace-pre-wrap rounded-md border bg-muted/20 p-4 font-mono text-xs text-foreground">
              {result.text || 'No extractable text found.'}
            </pre>
          </div>
        ) : null}
      </AppDialogContent>
    </Dialog>
  );
}
