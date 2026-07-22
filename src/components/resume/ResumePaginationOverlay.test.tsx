import { render } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ResumePaginationOverlay } from './ResumePaginationOverlay';

describe('ResumePaginationOverlay', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('disconnects its observer and resize listener when the preview unmounts', () => {
    const observe = vi.fn();
    const disconnect = vi.fn();
    const addEventListener = vi.spyOn(window, 'addEventListener');
    const removeEventListener = vi.spyOn(window, 'removeEventListener');

    class ResizeObserverMock {
      observe = observe;
      disconnect = disconnect;
    }

    vi.stubGlobal('ResizeObserver', ResizeObserverMock);

    const containerRef = createRef<HTMLDivElement>();
    const { unmount } = render(
      <div>
        <div ref={containerRef} />
        <ResumePaginationOverlay containerRef={containerRef} />
      </div>,
    );

    expect(observe).toHaveBeenCalledWith(containerRef.current);
    expect(addEventListener).toHaveBeenCalledWith('resize', expect.any(Function));

    unmount();

    expect(disconnect).toHaveBeenCalledTimes(1);
    expect(removeEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
  });
});
