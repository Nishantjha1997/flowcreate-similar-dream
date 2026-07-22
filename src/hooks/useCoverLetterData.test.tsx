import type { PropsWithChildren } from 'react';
import { act, renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  from: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  updateEq: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 'user-1' } }),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { from: mocks.from },
}));

vi.mock('sonner', () => ({
  toast: { success: mocks.toastSuccess, error: mocks.toastError },
}));

import { useCoverLetterData } from './useCoverLetterData';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return function Wrapper({ children }: PropsWithChildren) {
    return (
      <MemoryRouter initialEntries={['/cover-letter-builder']}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </MemoryRouter>
    );
  };
}

describe('useCoverLetterData save identity', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    const resumeQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: [], error: null }),
    };

    mocks.insert.mockReturnValue({
      select: () => ({
        single: () => Promise.resolve({ data: { id: 'letter-1' }, error: null }),
      }),
    });

    const updateResult = Promise.resolve({ error: null });
    const updateQuery = {
      eq: mocks.updateEq,
      then: updateResult.then.bind(updateResult),
    };
    mocks.updateEq.mockReturnValue(updateQuery);
    mocks.update.mockReturnValue(updateQuery);

    mocks.from.mockImplementation((table: string) => {
      if (table === 'resumes') return resumeQuery;
      if (table === 'cover_letters') {
        return { insert: mocks.insert, update: mocks.update };
      }
      throw new Error(`Unexpected table: ${table}`);
    });
  });

  it('inserts once, then updates the returned row on the next save', async () => {
    const { result } = renderHook(() => useCoverLetterData(), { wrapper: createWrapper() });

    let firstId: string | null = null;
    await act(async () => {
      firstId = await result.current.saveLetter();
    });

    let secondId: string | null = null;
    await act(async () => {
      secondId = await result.current.saveLetter();
    });

    expect(firstId).toBe('letter-1');
    expect(secondId).toBe('letter-1');
    expect(mocks.insert).toHaveBeenCalledTimes(1);
    expect(mocks.update).toHaveBeenCalledTimes(1);
    expect(mocks.updateEq).toHaveBeenCalledWith('id', 'letter-1');
    expect(mocks.updateEq).toHaveBeenCalledWith('user_id', 'user-1');
    expect(mocks.toastError).not.toHaveBeenCalled();
  });
});
