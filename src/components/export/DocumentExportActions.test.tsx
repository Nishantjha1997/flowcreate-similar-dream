import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { DocumentExportActions } from './DocumentExportActions';

describe('DocumentExportActions', () => {
  it('routes the primary ATS-friendly action to semantic export', () => {
    const onSemanticExport = vi.fn();
    const onImageExport = vi.fn();

    render(
      <DocumentExportActions
        onSemanticExport={onSemanticExport}
        onImageExport={onImageExport}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Download PDF (ATS-friendly)' }));

    expect(onSemanticExport).toHaveBeenCalledTimes(1);
    expect(onImageExport).not.toHaveBeenCalled();
  });

  it('keeps the image PDF explicit and disables it while rasterizing', () => {
    const onSemanticExport = vi.fn();
    const onImageExport = vi.fn();
    const { rerender } = render(
      <DocumentExportActions
        onSemanticExport={onSemanticExport}
        onImageExport={onImageExport}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Exact-look PDF (image)' }));
    expect(onImageExport).toHaveBeenCalledTimes(1);

    rerender(
      <DocumentExportActions
        onSemanticExport={onSemanticExport}
        onImageExport={onImageExport}
        isImageGenerating
      />,
    );

    const generatingButton = screen.getByRole('button', { name: 'Creating exact-look PDF…' });
    expect((generatingButton as HTMLButtonElement).disabled).toBe(true);
  });

  it('shows DOCX export only as a premium action', () => {
    const onDocxExport = vi.fn();
    render(<DocumentExportActions onSemanticExport={vi.fn()} onImageExport={vi.fn()} onDocxExport={onDocxExport} isPremium />);
    fireEvent.click(screen.getByRole('button', { name: 'Download DOCX' }));
    expect(onDocxExport).toHaveBeenCalledTimes(1);
  });
});
