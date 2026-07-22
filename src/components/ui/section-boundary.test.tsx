import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { captureError } from '@/lib/monitoring';
import { SectionBoundary } from './section-boundary';

vi.mock('@/lib/monitoring', () => ({
  captureError: vi.fn(),
}));

let shouldThrow = true;
const preventExpectedWindowError = (event: ErrorEvent) => event.preventDefault();

function UnstableSection() {
  if (shouldThrow) {
    throw new Error('Section render failed');
  }
  return <p>Section recovered</p>;
}

describe('SectionBoundary', () => {
  beforeEach(() => {
    shouldThrow = true;
    vi.mocked(captureError).mockClear();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    window.addEventListener('error', preventExpectedWindowError);
  });

  afterEach(() => {
    window.removeEventListener('error', preventExpectedWindowError);
    vi.restoreAllMocks();
  });

  it('contains a named section failure, reports context, and remounts on retry', () => {
    render(
      <SectionBoundary name="Resume editor">
        <UnstableSection />
      </SectionBoundary>,
    );

    expect(screen.getByRole('alert').textContent).toContain('This section hit an error');
    expect(screen.getByRole('alert').textContent).toContain('Resume editor could not load');
    expect(captureError).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Section render failed' }),
      expect.objectContaining({
        boundary: 'Resume editor',
        componentStack: expect.any(String),
      }),
    );

    shouldThrow = false;
    fireEvent.click(screen.getByRole('button', { name: 'Try this section again' }));

    expect(screen.getByText('Section recovered')).toBeTruthy();
    expect(screen.queryByRole('alert')).toBeNull();
  });
});
