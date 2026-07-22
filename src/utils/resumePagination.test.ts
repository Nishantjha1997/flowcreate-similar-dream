import { describe, expect, it } from 'vitest';

import { A4_HEIGHT_PX } from '@/constants/pdfDimensions';
import { analyzeResumePagination } from './resumePagination';

describe('analyzeResumePagination', () => {
  it('does not create a phantom page when content ends exactly at the boundary', () => {
    expect(analyzeResumePagination(A4_HEIGHT_PX, [])).toEqual({ breaks: [], crossings: [] });
    expect(analyzeResumePagination(A4_HEIGHT_PX + 1, []).breaks).toHaveLength(1);
  });

  it('uses the same A4 boundaries for one-, two-, and three-page content', () => {
    const result = analyzeResumePagination(A4_HEIGHT_PX * 3, []);

    expect(result.breaks).toEqual([
      { pageNumber: 2, top: A4_HEIGHT_PX },
      { pageNumber: 3, top: A4_HEIGHT_PX * 2 },
    ]);
  });

  it('identifies the exact entry crossing a page without flagging boundary-aligned entries', () => {
    const result = analyzeResumePagination(A4_HEIGHT_PX * 2, [
      { top: 1000, bottom: 1180, label: 'Senior Engineer at Northwind' },
      { top: 900, bottom: A4_HEIGHT_PX, label: 'Boundary aligned entry' },
      { top: A4_HEIGHT_PX, bottom: 1200, label: 'Starts on page two' },
    ]);

    expect(result.crossings).toEqual([
      {
        pageNumber: 2,
        top: 1000,
        label: 'Senior Engineer at Northwind',
      },
    ]);
  });
});
