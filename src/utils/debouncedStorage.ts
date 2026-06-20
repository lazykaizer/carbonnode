import { createJSONStorage } from 'zustand/middleware';

// Keep track of pending timeout IDs for each storage key
const storageTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

/**
 * Custom debounced localStorage engine for Zustand.
 *
 * WHY:
 * 1. The default Zustand persist middleware writes to localStorage synchronously on every state change.
 * 2. Rapid actions (like budget limit slider updates or successive emissions additions) trigger
 *    frequent disk writes, blocking the main thread and degrading UI responsiveness.
 * 3. This custom storage engine debounces the setItem write operation by 300ms, consolidating
 *    rapid state modifications into a single write.
 */
export const debouncedStorage = createJSONStorage(() => ({
  getItem: (key: string): string | null => {
    return localStorage.getItem(key);
  },
  setItem: (key: string, value: string): void => {
    const existing = storageTimeouts.get(key);
    if (existing) {
      clearTimeout(existing);
    }
    const timeout = setTimeout(() => {
      localStorage.setItem(key, value);
      storageTimeouts.delete(key);
    }, 300);
    storageTimeouts.set(key, timeout);
  },
  removeItem: (key: string): void => {
    const existing = storageTimeouts.get(key);
    if (existing) {
      clearTimeout(existing);
      storageTimeouts.delete(key);
    }
    localStorage.removeItem(key);
  },
}));
