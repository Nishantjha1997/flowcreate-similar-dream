import { cn } from '@/lib/utils';

interface BrandMarkProps {
  className?: string;
}

interface BrandWordmarkProps extends BrandMarkProps {
  textClassName?: string;
}

/** Uses the class-based app theme, not the operating system theme. */
export const BrandMark = ({ className }: BrandMarkProps) => (
  <span className={cn('relative inline-flex shrink-0', className)} aria-hidden="true">
    <img src="/logo.svg" alt="" className="h-full w-full dark:hidden" />
    <img src="/logo-dark.svg" alt="" className="hidden h-full w-full dark:block" />
  </span>
);

export const BrandWordmark = ({ className, textClassName }: BrandWordmarkProps) => (
  <span className={cn('inline-flex items-center gap-2', className)}>
    <BrandMark className="h-full aspect-square" />
    <span className={textClassName}>
      <span className="text-foreground">Flow</span>
      <span className="text-primary">Create</span>
    </span>
  </span>
);
