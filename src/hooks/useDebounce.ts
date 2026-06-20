/** Module containing logic for useDebounce. */
import { useState, useEffect } from 'react';

/**
 * Debounces a value by the specified delay.
 * Returns the debounced value that only updates after
 * the delay has passed without changes.
 */
export function useDebounce<T>(value: T, delayMs: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delayMs]);

  return debouncedValue;
}
