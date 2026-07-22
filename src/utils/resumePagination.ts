import { A4_HEIGHT_PX } from '@/constants/pdfDimensions';

export interface ResumeItemBounds {
  top: number;
  bottom: number;
  label: string;
}

export interface ResumePageBreak {
  pageNumber: number;
  top: number;
}

export interface ResumePageCrossing {
  pageNumber: number;
  top: number;
  label: string;
}

export interface ResumePaginationAnalysis {
  breaks: ResumePageBreak[];
  crossings: ResumePageCrossing[];
}

const EDGE_TOLERANCE_PX = 1;

export function analyzeResumePagination(
  contentHeight: number,
  items: ResumeItemBounds[],
  pageHeight = A4_HEIGHT_PX,
): ResumePaginationAnalysis {
  if (!Number.isFinite(contentHeight) || contentHeight <= 0 || pageHeight <= 0) {
    return { breaks: [], crossings: [] };
  }

  const pageBreakCount = Math.floor(Math.max(0, contentHeight - EDGE_TOLERANCE_PX) / pageHeight);
  const breaks = Array.from({ length: pageBreakCount }, (_, index) => ({
    pageNumber: index + 2,
    top: (index + 1) * pageHeight,
  }));

  const crossings = items.flatMap((item) => {
    const top = Math.max(0, item.top);
    const bottom = Math.max(top, item.bottom);
    const firstPage = Math.floor((top + EDGE_TOLERANCE_PX) / pageHeight) + 1;
    const lastPage = Math.floor(Math.max(0, bottom - EDGE_TOLERANCE_PX) / pageHeight) + 1;

    if (firstPage === lastPage) return [];
    return [{
      pageNumber: firstPage + 1,
      top,
      label: item.label,
    }];
  });

  return { breaks, crossings };
}

const getItemLabel = (item: HTMLElement, index: number) => {
  const explicitLabel = item.dataset.atsLabel?.trim();
  if (explicitLabel) return explicitLabel;

  const text = (item.textContent ?? '').replace(/\s+/g, ' ').trim();
  if (!text) return `Resume entry ${index + 1}`;
  return text.length > 72 ? `${text.slice(0, 69)}…` : text;
};

export function measureResumePagination(root: HTMLElement): ResumePaginationAnalysis {
  const rootRect = root.getBoundingClientRect();
  const renderedScale = root.offsetWidth > 0 && rootRect.width > 0
    ? rootRect.width / root.offsetWidth
    : 1;

  const items = Array.from(root.querySelectorAll<HTMLElement>('[data-resume-item]')).map((item, index) => {
    const itemRect = item.getBoundingClientRect();
    return {
      top: (itemRect.top - rootRect.top) / renderedScale,
      bottom: (itemRect.bottom - rootRect.top) / renderedScale,
      label: getItemLabel(item, index),
    };
  });

  return analyzeResumePagination(root.scrollHeight, items);
}
