import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { JobDescriptionGenerator } from './JobDescriptionGenerator';

const mocks = vi.hoisted(() => ({
  invoke: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
  toastInfo: vi.fn(),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { functions: { invoke: mocks.invoke } },
}));
vi.mock('sonner', () => ({
  toast: { success: mocks.toastSuccess, error: mocks.toastError, info: mocks.toastInfo },
}));
// The real JobDescriptionInput uploads files through its own edge function
// call - irrelevant to this component's own generate/restore logic, so it's
// swapped for a plain textarea.
vi.mock('@/components/JobDescriptionInput', () => ({
  JobDescriptionInput: ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <textarea aria-label="job description" value={value} onChange={(e) => onChange(e.target.value)} />
  ),
}));

describe('JobDescriptionGenerator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('requires a linked resume before generating', async () => {
    render(<JobDescriptionGenerator resumeId={null} currentContent="" onGenerated={vi.fn()} />);
    fireEvent.change(screen.getByLabelText('job description'), { target: { value: 'A'.repeat(50) } });
    fireEvent.click(screen.getByRole('button', { name: /generate cover letter/i }));

    expect(mocks.toastInfo).toHaveBeenCalled();
    expect(mocks.invoke).not.toHaveBeenCalled();
  });

  it('sends company/role/tone/length alongside the job description', async () => {
    mocks.invoke.mockResolvedValue({ data: { suggestion: 'Dear Hiring Manager...' }, error: null });
    render(<JobDescriptionGenerator resumeId="resume-1" currentContent="" onGenerated={vi.fn()} />);

    fireEvent.change(screen.getByPlaceholderText('e.g., Acme Corp'), { target: { value: 'Acme Corp' } });
    fireEvent.change(screen.getByPlaceholderText('e.g., Product Manager'), { target: { value: 'Product Manager' } });
    fireEvent.change(screen.getByLabelText('job description'), { target: { value: 'A'.repeat(50) } });
    fireEvent.click(screen.getByRole('button', { name: /generate cover letter/i }));

    await waitFor(() => expect(mocks.invoke).toHaveBeenCalledTimes(1));
    const [, options] = mocks.invoke.mock.calls[0];
    expect(options.body).toMatchObject({
      context: 'cover_letter_from_jd',
      resumeId: 'resume-1',
      company: 'Acme Corp',
      role: 'Product Manager',
      tone: 'professional',
      length: 'standard',
    });
  });

  it('offers an Undo action that restores the previous content when generating over existing text (F-2e)', async () => {
    mocks.invoke.mockResolvedValue({ data: { suggestion: 'NEW LETTER TEXT' }, error: null });
    const onGenerated = vi.fn();

    render(<JobDescriptionGenerator resumeId="resume-1" currentContent="OLD LETTER TEXT" onGenerated={onGenerated} />);
    fireEvent.change(screen.getByLabelText('job description'), { target: { value: 'A'.repeat(50) } });
    fireEvent.click(screen.getByRole('button', { name: /generate cover letter/i }));

    await waitFor(() => expect(onGenerated).toHaveBeenCalledWith('NEW LETTER TEXT'));
    expect(mocks.toastSuccess).toHaveBeenCalledTimes(1);

    const [, toastOptions] = mocks.toastSuccess.mock.calls[0];
    expect(toastOptions.action.label).toBe('Undo');

    toastOptions.action.onClick();
    expect(onGenerated).toHaveBeenCalledWith('OLD LETTER TEXT');
  });

  it('does not offer Undo when there was nothing to lose', async () => {
    mocks.invoke.mockResolvedValue({ data: { suggestion: 'FIRST DRAFT' }, error: null });
    const onGenerated = vi.fn();

    render(<JobDescriptionGenerator resumeId="resume-1" currentContent="" onGenerated={onGenerated} />);
    fireEvent.change(screen.getByLabelText('job description'), { target: { value: 'A'.repeat(50) } });
    fireEvent.click(screen.getByRole('button', { name: /generate cover letter/i }));

    await waitFor(() => expect(onGenerated).toHaveBeenCalledWith('FIRST DRAFT'));
    const [, toastOptions] = mocks.toastSuccess.mock.calls[0];
    expect(toastOptions).toBeUndefined();
  });
});
