import { useCallback, useMemo, useRef } from 'react';
import { debounce } from 'lodash-es';

// Hook for debounced form updates
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  return useMemo(
    () => debounce((...args: Parameters<T>) => callbackRef.current(...args), delay) as T,
    [delay]
  );
}

// Hook for memoized calculations
export function useMemoizedCalculation<T>(
  calculation: () => T,
  dependencies: React.DependencyList
): T {
  return useMemo(calculation, dependencies);
}

// Hook for optimized event handlers
export function useOptimizedHandlers<T extends Record<string, (...args: any[]) => any>>(
  handlers: T,
  dependencies: React.DependencyList
): T {
  return useMemo(() => {
    const optimizedHandlers = {} as T;
    
    for (const [key, handler] of Object.entries(handlers)) {
      optimizedHandlers[key as keyof T] = useCallback(handler, dependencies) as T[keyof T];
    }
    
    return optimizedHandlers;
  }, dependencies);
}

// Hook for performance monitoring
export function usePerformanceMonitor(componentName: string) {
  const renderCountRef = useRef(0);
  const lastRenderTime = useRef(Date.now());
  
  renderCountRef.current += 1;
  
  const currentTime = Date.now();
  const timeSinceLastRender = currentTime - lastRenderTime.current;
  lastRenderTime.current = currentTime;
  
  if (process.env.NODE_ENV === 'development') {
    console.log(
      `[Performance] ${componentName} - Render #${renderCountRef.current}, Time since last render: ${timeSinceLastRender}ms`
    );
  }
  
  return {
    renderCount: renderCountRef.current,
    timeSinceLastRender
  };
}