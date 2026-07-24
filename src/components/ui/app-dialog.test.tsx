import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Dialog, DialogTitle } from './dialog';
import { AppDialogContent } from './app-dialog';

describe('AppDialogContent (U-2c)', () => {
  it('defaults to the md width tier and standard scroll behavior', () => {
    render(
      <Dialog open>
        <AppDialogContent aria-describedby={undefined}>
          <DialogTitle>Test dialog</DialogTitle>
        </AppDialogContent>
      </Dialog>
    );
    const content = screen.getByText('Test dialog').closest('[role="dialog"]');
    expect(content?.className).toContain('sm:max-w-lg');
    expect(content?.className).toContain('max-h-[85vh]');
    expect(content?.className).toContain('overflow-y-auto');
  });

  it('applies the requested size tier and preserves a custom className', () => {
    render(
      <Dialog open>
        <AppDialogContent size="xl" className="border-4" aria-describedby={undefined}>
          <DialogTitle>Wide dialog</DialogTitle>
        </AppDialogContent>
      </Dialog>
    );
    const content = screen.getByText('Wide dialog').closest('[role="dialog"]');
    expect(content?.className).toContain('sm:max-w-4xl');
    expect(content?.className).toContain('border-4');
  });
});
