import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useDebounce } from '../../hooks/useDebounce';
import { useTypewriter } from '../../hooks/useTypewriter';
import { useIsMobile, useIsTablet, useIsDesktop, usePrefersReducedMotion, useMediaQuery } from '../../hooks/useMediaQuery';
import { useInView } from '../../hooks/useInView';
import { useUiStore } from '../../stores/uiStore';

describe('Simple Hooks', () => {
  describe('useDebounce', () => {
    it('should debounce value', () => {
      vi.useFakeTimers();
      const { result, rerender } = renderHook(({ val }) => useDebounce(val, 500), {
        initialProps: { val: 'a' }
      });
      expect(result.current).toBe('a');
      rerender({ val: 'b' });
      expect(result.current).toBe('a');
      act(() => {
        vi.advanceTimersByTime(500);
      });
      expect(result.current).toBe('b');
      vi.useRealTimers();
    });
  });

  describe('useTypewriter', () => {
    it('should type and delete', () => {
      vi.useFakeTimers();
      const { result } = renderHook(() => useTypewriter(['Hi'], 10, 10, 10));
      expect(result.current).toBe('');
      act(() => { vi.advanceTimersByTime(10); });
      act(() => { vi.advanceTimersByTime(10); });
      expect(result.current).toBe('Hi');
      act(() => { vi.advanceTimersByTime(20); }); // trigger pause timeout
      act(() => { vi.advanceTimersByTime(10); }); // trigger delete first char
      act(() => { vi.advanceTimersByTime(10); }); // trigger delete second char
      expect(result.current).toBe('');
      vi.useRealTimers();
    });
  });

  describe('useMediaQuery', () => {
    it('should return matches based on window.matchMedia', () => {
      const matchMediaMock = vi.fn().mockImplementation(query => ({
        matches: query === '(min-width: 1024px)',
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));
      window.matchMedia = matchMediaMock;

      const { result: r1 } = renderHook(() => useIsMobile());
      expect(r1.current).toBe(true);

      const { result: r2 } = renderHook(() => useIsTablet());
      expect(r2.current).toBe(false);

      const { result: r3 } = renderHook(() => useIsDesktop());
      expect(r3.current).toBe(true);

      const { result: r4 } = renderHook(() => usePrefersReducedMotion());
      expect(r4.current).toBe(false);
    });

    it('should update matches when query prop changes', () => {
      const matchMediaMock = vi.fn().mockImplementation(query => ({
        matches: query === '(min-width: 1024px)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));
      window.matchMedia = matchMediaMock;

      const { result, rerender } = renderHook(({ q }) => useMediaQuery(q), {
        initialProps: { q: '(min-width: 1024px)' }
      });
      expect(result.current).toBe(true);

      rerender({ q: '(min-width: 768px)' });
      expect(result.current).toBe(false);
    });

    it('should update matches when media query change event is triggered', () => {
      let changeCallback: ((event: MediaQueryListEvent) => void) | null = null;
      const matchMediaMock = vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn().mockImplementation((event, cb) => {
          if (event === 'change') changeCallback = cb;
        }),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));
      window.matchMedia = matchMediaMock;

      const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
      expect(result.current).toBe(false);

      act(() => {
        if (changeCallback) {
          changeCallback({ matches: true } as MediaQueryListEvent);
        }
      });
      expect(result.current).toBe(true);
    });

    it('should return true for useIsTablet when width is between 768px and 1024px', () => {
      const matchMediaMock = vi.fn().mockImplementation(query => ({
        matches: query === '(min-width: 768px)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));
      window.matchMedia = matchMediaMock;

      const { result } = renderHook(() => useIsTablet());
      expect(result.current).toBe(true);
    });
  });

  describe('useInView', () => {
    it('should observe element and update state when intersecting', () => {
      let observerCallback: ((entries: Partial<IntersectionObserverEntry>[]) => void) | null = null;
      const unobserveMock = vi.fn();
      const observeMock = vi.fn();

      class MockIntersectionObserver {
        constructor(cb: (entries: Partial<IntersectionObserverEntry>[]) => void) {
          observerCallback = cb;
        }
        observe = observeMock;
        unobserve = unobserveMock;
        disconnect = vi.fn();
      }
      globalThis.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;

      const element = document.createElement('div');
      const ref = { current: element };

      const { result, rerender } = renderHook(({ once }) => useInView(ref, { once }), {
        initialProps: { once: false }
      });

      expect(result.current).toBe(false);
      expect(observeMock).toHaveBeenCalledWith(element);

      // Simulate intersecting = true
      act(() => {
        observerCallback!([{ isIntersecting: true }]);
      });
      expect(result.current).toBe(true);

      // Simulate intersecting = false
      act(() => {
        observerCallback!([{ isIntersecting: false }]);
      });
      expect(result.current).toBe(false);

      // Test with once = true
      rerender({ once: true });
      act(() => {
        observerCallback!([{ isIntersecting: true }]);
      });
      expect(result.current).toBe(true);
      expect(unobserveMock).toHaveBeenCalledWith(element);
    });

    it('should handle null ref gracefully', () => {
      const ref = { current: null };
      const { result } = renderHook(() => useInView(ref));
      expect(result.current).toBe(false);
    });
  });
});

describe('uiStore', () => {
  it('should manage UI state', () => {
    const store = useUiStore.getState();
    expect(store.sidebarOpen).toBe(true);
    
    useUiStore.getState().toggleSidebar();
    expect(useUiStore.getState().sidebarOpen).toBe(false);

    useUiStore.getState().setSidebarOpen(true);
    expect(useUiStore.getState().sidebarOpen).toBe(true);

    useUiStore.getState().setLoading('carbonMirror', true);
    expect(useUiStore.getState().loading.carbonMirror).toBe(true);

    useUiStore.getState().setError('carbonBudget', 'Error');
    expect(useUiStore.getState().errors.carbonBudget).toBe('Error');

    useUiStore.getState().clearErrors();
    expect(useUiStore.getState().errors.carbonBudget).toBeNull();

    useUiStore.getState().setActiveFeature('mirror');
    expect(useUiStore.getState().activeFeature).toBe('mirror');
  });
});
