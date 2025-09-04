"use client";

import { useState, useEffect, useRef } from 'react';

type ScrollDirection = 'up' | 'down' | 'idle';

interface UseScrollDirectionOptions {
  threshold?: number; // Minimum scroll distance to trigger direction change
  debounceMs?: number; // Debounce time in milliseconds
}

export function useScrollDirection(options: UseScrollDirectionOptions = {}) {
  const { threshold = 10, debounceMs = 50 } = options;
  
  const [scrollDirection, setScrollDirection] = useState<ScrollDirection>('idle');
  const [isAtTop, setIsAtTop] = useState(true);
  const [scrollY, setScrollY] = useState(0);
  
  const lastScrollY = useRef(0);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateScrollDirection = () => {
      const currentScrollY = window.scrollY;
      const difference = currentScrollY - lastScrollY.current;
      
      // Update scroll position
      setScrollY(currentScrollY);
      setIsAtTop(currentScrollY < 10);
      
      // Only update direction if we've scrolled enough
      if (Math.abs(difference) > threshold) {
        if (difference > 0) {
          setScrollDirection('down');
        } else {
          setScrollDirection('up');
        }
        lastScrollY.current = currentScrollY;
      } else if (currentScrollY < 10) {
        setScrollDirection('idle');
      }
    };

    const handleScroll = () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      
      debounceTimer.current = setTimeout(updateScrollDirection, debounceMs);
    };

    // Set initial values
    lastScrollY.current = window.scrollY;
    setScrollY(window.scrollY);
    setIsAtTop(window.scrollY < 10);

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [threshold, debounceMs]);

  return {
    scrollDirection,
    isAtTop,
    scrollY,
    isScrollingDown: scrollDirection === 'down',
    isScrollingUp: scrollDirection === 'up',
    isIdle: scrollDirection === 'idle',
  };
}