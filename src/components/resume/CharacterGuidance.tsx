import { cn } from '@/lib/utils';

interface CharacterGuidanceProps {
  value: string;
  recommendedMax: number;
  guidance: string;
}

export function CharacterGuidance({
  value,
  recommendedMax,
  guidance,
}: CharacterGuidanceProps) {
  const characterCount = value.length;
  const isLong = characterCount > recommendedMax;

  return (
    <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1 text-xs">
      <span
        className={cn('text-muted-foreground', isLong && 'text-amber-700 dark:text-amber-400')}
        role={isLong ? 'status' : undefined}
      >
        {isLong ? 'Consider trimming this entry to reduce page-break risk.' : guidance}
      </span>
      <span
        className={cn(
          'shrink-0 tabular-nums text-muted-foreground',
          isLong && 'font-semibold text-amber-700 dark:text-amber-400',
        )}
      >
        {characterCount} / ~{recommendedMax} recommended
      </span>
    </div>
  );
}
