import * as React from 'react';
import { DialogContent } from './dialog';
import { cn } from '@/lib/utils';

const APP_DIALOG_SIZES = {
  sm: 'sm:max-w-md',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
  xl: 'sm:max-w-4xl',
} as const;

interface AppDialogContentProps extends React.ComponentPropsWithoutRef<typeof DialogContent> {
  size?: keyof typeof APP_DIALOG_SIZES;
}

/**
 * Thin wrapper over the base DialogContent (U-2c) fixing width tiers and
 * scroll behavior consistently - dialogs previously each invented their own
 * ad hoc max-width/scroll combination (e.g. "sm:max-w-2xl max-h-[85vh]
 * overflow-y-auto" repeated slightly differently per call site). Focus trap
 * and the close button already come from the underlying
 * DialogContent/DialogPrimitive.Close - this wrapper only standardizes size
 * and scroll, and still accepts a className override for one-off needs.
 */
export const AppDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogContent>,
  AppDialogContentProps
>(({ size = 'md', className, ...props }, ref) => (
  <DialogContent
    ref={ref}
    className={cn(APP_DIALOG_SIZES[size], 'max-h-[85vh] overflow-y-auto', className)}
    {...props}
  />
));
AppDialogContent.displayName = 'AppDialogContent';

export { APP_DIALOG_SIZES };
