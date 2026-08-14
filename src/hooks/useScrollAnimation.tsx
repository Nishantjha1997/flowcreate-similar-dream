import { useEffect, useRef, useState, type CSSProperties } from 'react';

interface UseScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export function useScrollAnimation<T extends HTMLElement = HTMLDivElement>(
  options: UseScrollAnimationOptions = {}
) {
  const { threshold = 0.15, rootMargin = '0px 0px -60px 0px', triggerOnce = true } = options;
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) observer.unobserve(element);
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, rootMargin, triggerOnce]);

  return { ref, isVisible };
}

export function ScrollReveal({
  children,
  className = '',
  delay = 0,
  direction = 'up',
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
}) {
  const { ref, isVisible } = useScrollAnimation();

  const directionOffsets: Record<string, { x: string; y: string }> = {
    up: { x: '0px', y: '48px' },
    down: { x: '0px', y: '-48px' },
    left: { x: '48px', y: '0px' },
    right: { x: '-48px', y: '0px' },
    none: { x: '0px', y: '0px' },
  };
  const offset = directionOffsets[direction];
  const style = {
    '--reveal-x': offset.x,
    '--reveal-y': offset.y,
    '--reveal-delay': `${delay}ms`,
  } as CSSProperties;

    return (
      <div
        ref={ref}
      className={`flow-scroll-reveal ${isVisible ? 'is-visible' : ''} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}
