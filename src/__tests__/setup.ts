import '@testing-library/jest-dom';
import { expect, vi } from 'vitest';
import * as axeMatchers from 'vitest-axe/matchers';

expect.extend(axeMatchers);

// Mock browser ResizeObserver on globalThis for browser environment compatibility
globalThis.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock window.matchMedia for JSDOM compatibility in React component tests defensively across namespaces
const mockMatchMedia = vi.fn().mockImplementation((query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

if (typeof window !== 'undefined') {
  window.matchMedia = window.matchMedia || mockMatchMedia;
}
if (typeof globalThis !== 'undefined') {
  (globalThis as unknown as Record<string, unknown>).matchMedia = (globalThis as unknown as Record<string, unknown>).matchMedia || mockMatchMedia;
}
if (typeof global !== 'undefined') {
  (global as unknown as Record<string, unknown>).matchMedia = (global as unknown as Record<string, unknown>).matchMedia || mockMatchMedia;
}


