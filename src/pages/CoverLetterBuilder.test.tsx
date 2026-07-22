import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  saveLetter: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => mocks.navigate };
});

vi.mock('@/hooks/useCoverLetterData', () => ({
  useCoverLetterData: () => ({
    formData: {
      title: 'Research Letter',
      content: 'Content',
      template_id: 'clean-slate',
      resume_id: null,
      customization: {},
    },
    setFormData: vi.fn(),
    isSaving: false,
    saveLetter: mocks.saveLetter,
    isLoading: false,
    editId: null,
    userResumes: [],
    userId: 'user-1',
  }),
}));

vi.mock('@/hooks/usePDFGenerator', () => ({
  usePDFGenerator: () => ({ isGenerating: false, generatePDF: vi.fn(), printResume: vi.fn() }),
}));
vi.mock('@/hooks/usePageMeta', () => ({ usePageMeta: vi.fn() }));
vi.mock('@/components/Header', () => ({ default: () => null }));
vi.mock('@/components/cover-letter/CoverLetterEditor', () => ({
  CoverLetterEditor: ({ onSave }: { onSave: () => void }) => <button onClick={onSave}>Save letter</button>,
}));
vi.mock('@/components/cover-letter/CoverLetterPreview', () => ({ CoverLetterPreview: () => null }));
vi.mock('@/components/export/DocumentExportActions', () => ({ DocumentExportActions: () => null }));
vi.mock('@/components/ui/section-boundary', () => ({
  SectionBoundary: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import CoverLetterBuilder from './CoverLetterBuilder';

describe('CoverLetterBuilder first save', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.saveLetter.mockResolvedValue('letter-1');
  });

  it('replaces the URL with the saved row id so later saves update it', async () => {
    render(<CoverLetterBuilder />);
    fireEvent.click(screen.getByRole('button', { name: 'Save letter' }));

    await waitFor(() => {
      expect(mocks.navigate).toHaveBeenCalledWith('/cover-letter-builder?edit=letter-1', { replace: true });
    });
  });
});
