import { describe, it, expect, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: { success: mocks.success, error: mocks.error },
}));

import { toastActionFailed, toastActionDone } from './toastMessages';

describe('toastMessages (U-2b convention: what failed - why - next step)', () => {
  it('states only what failed when no reason or next step is given', () => {
    toastActionFailed('save the resume');
    expect(mocks.error).toHaveBeenCalledWith("Couldn't save the resume.", undefined);
  });

  it('appends the reason and next step when provided', () => {
    toastActionFailed('save the resume', 'Network timeout', 'Check your connection and try again.');
    expect(mocks.error).toHaveBeenCalledWith(
      "Couldn't save the resume. Network timeout. Check your connection and try again.",
      undefined
    );
  });

  it('does not double a trailing period on the reason', () => {
    toastActionFailed('save the resume', 'Network timeout.');
    expect(mocks.error).toHaveBeenCalledWith("Couldn't save the resume. Network timeout.", undefined);
  });

  it('passes through toast options (e.g. an action button) untouched', () => {
    const action = { label: 'Undo', onClick: vi.fn() };
    toastActionDone('Saved.', { action });
    expect(mocks.success).toHaveBeenCalledWith('Saved.', { action });
  });
});
