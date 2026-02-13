import React, { useCallback, useEffect, useRef, useState } from 'react';

interface UseStickyCollapseOptions {
  threshold?: number;
}

interface UseStickyCollapseReturn {
  isExpanded: boolean;
  setIsExpanded: (value: boolean) => void;
  toggle: () => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export function useStickyCollapse(options?: UseStickyCollapseOptions): UseStickyCollapseReturn {
  const { threshold = 300 } = options ?? {};
  const [isExpanded, setIsExpanded] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const stickyStartY = useRef<number | null>(null);
  const userToggled = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      const container = containerRef.current;
      if (!container) return;

      const scrollY = window.scrollY;
      const isSticky = container.getBoundingClientRect().top <= 0;

      // Not sticky - reset and expand if was sticky
      if (!isSticky) {
        if (stickyStartY.current !== null && !isExpanded) {
          setIsExpanded(true);
        }
        stickyStartY.current = null;
        userToggled.current = false;
        return;
      }

      // Just became sticky - record position
      if (stickyStartY.current === null) {
        stickyStartY.current = scrollY;
        return;
      }

      // User toggled - skip auto
      if (userToggled.current) return;

      // Auto-collapse after threshold
      if (scrollY - stickyStartY.current >= threshold && isExpanded) {
        setIsExpanded(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isExpanded, threshold]);

  const toggle = useCallback(() => {
    userToggled.current = true;
    setIsExpanded((prev) => !prev);
  }, []);

  return {
    isExpanded,
    setIsExpanded,
    toggle,
    containerRef,
  };
}
