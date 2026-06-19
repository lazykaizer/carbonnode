import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { checkRateLimit, recordRequest } from '@/services/geminiService';

describe('Client-Side Rate Limiter Tests', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should allow requests below the limit and block once the limit is reached', () => {
    // Advance time to clear previous test history
    vi.advanceTimersByTime(24 * 60 * 60 * 1000);

    // Initial state should allow
    expect(checkRateLimit()).toBe(true);

    // Record 14 requests
    for (let i = 0; i < 14; i++) {
      recordRequest();
      expect(checkRateLimit()).toBe(true);
    }

    // 15th request recorded
    recordRequest();

    // 16th check should block
    expect(checkRateLimit()).toBe(false);
  });

  it('should unlock the rate limit after a 60-second window passes', () => {
    vi.advanceTimersByTime(24 * 60 * 60 * 1000);

    for (let i = 0; i < 15; i++) {
      recordRequest();
    }
    expect(checkRateLimit()).toBe(false);

    // Advance time by 61 seconds
    vi.advanceTimersByTime(61000);

    // Rate limit should unlock
    expect(checkRateLimit()).toBe(true);
  });
});
