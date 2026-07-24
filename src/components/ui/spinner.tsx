import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const SPINNER_SIZES = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
} as const;

interface SpinnerProps {
  size?: keyof typeof SPINNER_SIZES;
  className?: string;
  /** Only needed when the spinner is the sole content of its element (no adjacent label). */
  label?: string;
}

/**
 * Single spinner primitive (U-2a) - this app previously mixed a bare
 * `<Loader2 className="animate-spin" />` in most places with an occasional
 * `<RefreshCw className="animate-spin" />` elsewhere, at inconsistent sizes.
 * Use this instead of reaching for either icon directly.
 */
export function Spinner({ size = 'sm', className, label }: SpinnerProps) {
  return (
    <Loader2
      className={cn('animate-spin', SPINNER_SIZES[size], className)}
      aria-hidden={label ? undefined : true}
      role={label ? 'status' : undefined}
      aria-label={label}
    />
  );
}
