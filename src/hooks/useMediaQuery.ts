/** Module containing logic for useMediaQuery. */
import { useState, useEffect } from 'react';

/**
 * Custom hook for responsive design breakpoints.
 * Returns true when the media query matches.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  const [prevQuery, setPrevQuery] = useState(query);

  if (query !== prevQuery) {
    setPrevQuery(query);
    setMatches(window.matchMedia(query).matches);
  }

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);

    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [query]);

  return matches;
}

/**
 * Convenience hook for common breakpoints.
 */
export function useIsMobile(): boolean {
  return !useMediaQuery('(min-width: 768px)');
}

export function useIsTablet(): boolean {
  const isMin768 = useMediaQuery('(min-width: 768px)');
  const isMin1024 = useMediaQuery('(min-width: 1024px)');
  return isMin768 && !isMin1024;
}

export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1024px)');
}

export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}
