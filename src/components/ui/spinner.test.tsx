import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Spinner } from './spinner';

describe('Spinner', () => {
  it('always spins and defaults to the sm size', () => {
    const { container } = render(<Spinner />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('class')).toContain('animate-spin');
    expect(svg?.getAttribute('class')).toContain('h-4');
  });

  it('applies the requested size', () => {
    const { container } = render(<Spinner size="lg" />);
    expect(container.querySelector('svg')?.getAttribute('class')).toContain('h-6');
  });

  it('is decorative by default, but exposes a status role when given a label', () => {
    const { container, rerender } = render(<Spinner />);
    expect(container.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');

    rerender(<Spinner label="Saving" />);
    const labeled = container.querySelector('svg');
    expect(labeled?.getAttribute('role')).toBe('status');
    expect(labeled?.getAttribute('aria-label')).toBe('Saving');
  });
});
