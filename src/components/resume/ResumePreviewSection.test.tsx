import { fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { TooltipProvider } from '@/components/ui/tooltip';
import { ResumePreviewSection } from './ResumePreviewSection';

vi.mock('@/components/resume/ResumeVisualPreview', () => ({
  ResumeVisualPreview: () => <div>Rendered resume</div>,
}));
vi.mock('@/components/resume/ResumePaginationOverlay', () => ({
  ResumePaginationOverlay: () => null,
}));
vi.mock('@/hooks/useDesignMode', () => ({
  useDesignMode: () => ({ isNeoBrutalism: false }),
}));
vi.mock('@/components/ui/slider', () => ({
  Slider: () => <div data-testid="zoom-slider" />,
}));

describe('ResumePreviewSection', () => {
  it('opens fullscreen and closes it with Escape', () => {
    render(
      <TooltipProvider>
        <ResumePreviewSection
          resume={{ personal: { name: '', email: '', phone: '', address: '', linkedin: '', website: '', summary: '' }, experience: [], education: [], skills: [], projects: [], customization: {} } as any}
          templateId="clean-slate"
          templateNames={{ 'clean-slate': 'Clean Slate' }}
          resumeRef={createRef<HTMLDivElement>()}
          sectionOrder={[]}
          hiddenSections={[]}
        />
      </TooltipProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Fullscreen preview' }));
    expect(screen.getAllByRole('button', { name: 'Exit fullscreen preview' })).toHaveLength(2);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.getByRole('button', { name: 'Fullscreen preview' })).toBeTruthy();
  });
});
