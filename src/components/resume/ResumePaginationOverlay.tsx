import { useEffect, useState, type RefObject } from 'react';

import {
  measureResumePagination,
  type ResumePaginationAnalysis,
} from '@/utils/resumePagination';

interface ResumePaginationOverlayProps {
  containerRef: RefObject<HTMLDivElement>;
}

const EMPTY_ANALYSIS: ResumePaginationAnalysis = { breaks: [], crossings: [] };

const hasSameAnalysis = (
  current: ResumePaginationAnalysis,
  next: ResumePaginationAnalysis,
) => JSON.stringify(current) === JSON.stringify(next);

export function ResumePaginationOverlay({ containerRef }: ResumePaginationOverlayProps) {
  const [analysis, setAnalysis] = useState<ResumePaginationAnalysis>(EMPTY_ANALYSIS);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return undefined;

    const measure = () => {
      const next = measureResumePagination(element);
      setAnalysis((current) => (hasSameAnalysis(current, next) ? current : next));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    window.addEventListener('resize', measure);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [containerRef]);

  if (analysis.breaks.length === 0 && analysis.crossings.length === 0) return null;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-10"
      role="status"
      aria-live="polite"
      aria-label={`${analysis.crossings.length} resume entries cross a page boundary`}
    >
      {analysis.breaks.map((pageBreak) => (
        <div
          key={pageBreak.pageNumber}
          className="absolute left-0 right-0 flex items-center"
          style={{ top: `${pageBreak.top}px`, transform: 'translateY(-50%)' }}
        >
          <div className="w-full border-t-2 border-dashed border-red-400/60" />
          <span className="absolute right-4 whitespace-nowrap rounded bg-red-600 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white shadow-sm">
            Page {pageBreak.pageNumber}
          </span>
        </div>
      ))}

      {analysis.crossings.map((crossing, index) => (
        <span
          key={`${crossing.pageNumber}-${crossing.label}-${index}`}
          className="absolute right-4 max-w-64 rounded bg-amber-500 px-2 py-1 text-[10px] font-semibold leading-tight text-amber-950 shadow"
          style={{ top: `${crossing.top}px` }}
        >
          Entry crosses page {crossing.pageNumber}: {crossing.label}
        </span>
      ))}
    </div>
  );
}
