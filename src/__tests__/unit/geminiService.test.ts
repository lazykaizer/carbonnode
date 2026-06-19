import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import {
  analyzeDailyActivity,
  analyzeReceipt,
  analyzeUrl,
  generateCarbonStory,
  checkRateLimit,
  recordRequest,
  getClientRequestCount,
  resetServiceState
} from '../../services/geminiService';

describe('geminiService', () => {
  const originalFetch = global.fetch;

  beforeAll(() => {
    vi.useFakeTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  beforeEach(() => {
    resetServiceState();
    global.fetch = vi.fn();
    vi.advanceTimersByTime(600000);
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('should handle rate limiting logic locally', () => {
    expect(checkRateLimit()).toBe(true);
    expect(getClientRequestCount()).toBe(0);
    recordRequest();
    expect(getClientRequestCount()).toBe(1);
    
    // Fill up the limit
    for (let i = 0; i < 15; i++) {
      recordRequest();
    }
    expect(checkRateLimit()).toBe(false);
    
    // Advance time by 61 seconds
    vi.advanceTimersByTime(61000);
    expect(checkRateLimit()).toBe(true);
  });

  it('should successfully make an API request with retries', async () => {
    const mockResponse = { activities: [], totalCo2Kg: 5, overallSuggestion: 'good' };
    const fetchMock = global.fetch as import('vitest').Mock;
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const result = await analyzeDailyActivity('test');
    expect(result).toEqual(mockResponse);
  });

  it('should throw FatalError on 429 response', async () => {
    const fetchMock = global.fetch as import('vitest').Mock;
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 429,
      json: async () => ({ error: 'Rate limit', retryAfter: 10 })
    });

    await expect(analyzeDailyActivity('test')).rejects.toThrow('Rate limit exceeded. Try again in 10s.');
  });

  it('should retry on 500 error and succeed', async () => {
    vi.useRealTimers();
    const fetchMock = global.fetch as import('vitest').Mock;
    // 1st fails with 500
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Internal Server Error' })
    });
    // 2nd succeeds
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ activities: [] })
    });

    const result = await analyzeDailyActivity('test');
    expect(result).toEqual({ activities: [] });
    vi.useFakeTimers();
  });

  it('should fail immediately on 400 error', async () => {
    const fetchMock = global.fetch as import('vitest').Mock;
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ error: 'Bad Request' })
    });

    await expect(analyzeDailyActivity('test')).rejects.toThrow('Bad Request');
  });



  it('should call analyzeReceipt with correct payload', async () => {
    const fetchMock = global.fetch as import('vitest').Mock;
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({})
    });
    await analyzeReceipt('base64', 'image/png');
    expect(global.fetch).toHaveBeenCalledWith('/api/receipt-scanner', expect.objectContaining({
      body: JSON.stringify({ image: 'base64', mimeType: 'image/png' })
    }));
  });

  it('should call analyzeUrl with correct payload', async () => {
    const fetchMock = global.fetch as import('vitest').Mock;
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({})
    });
    await analyzeUrl('http://test.com');
    expect(global.fetch).toHaveBeenCalledWith('/api/carbon-subtitles', expect.objectContaining({
      body: JSON.stringify({ videoUrl: 'http://test.com' })
    }));
  });

  it('should call generateCarbonStory with correct payload', async () => {
    const fetchMock = global.fetch as import('vitest').Mock;
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({})
    });
    const data = {
      totalCo2Kg: 10, vsIndianAverage: 'below' as const, percentageVsAverage: 10,
      bestCategory: 'a', worstCategory: 'b', streakDays: 1, actionsLogged: 1, topActivity: 'c', weekNumber: 1
    };
    await generateCarbonStory(data);
    expect(global.fetch).toHaveBeenCalledWith('/api/carbon-story', expect.objectContaining({
      body: JSON.stringify(data)
    }));
  });

  it('should fail client-side rate limit check', async () => {
    // Fill up local rate limit timestamps
    for (let i = 0; i < 16; i++) {
      recordRequest();
    }
    await expect(analyzeDailyActivity('test')).rejects.toThrow('Too many requests. Please wait a moment and try again.');
  });

  it('should cache identical requests and skip redundant network calls', async () => {
    const mockResponse = { activities: [], totalCo2Kg: 5, overallSuggestion: 'good' };
    const fetchMock = global.fetch as import('vitest').Mock;
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => mockResponse
    });

    const result1 = await analyzeDailyActivity('duplicate-input');
    const result2 = await analyzeDailyActivity('duplicate-input');

    expect(result1).toEqual(mockResponse);
    expect(result2).toEqual(mockResponse);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('should evict from cache on request failure', async () => {
    const fetchMock = global.fetch as import('vitest').Mock;
    
    // First call fails with 400 (FatalError, no retry)
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ error: 'Temp failure' })
    });
    
    // Second call succeeds
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ activities: [] })
    });

    await expect(analyzeDailyActivity('fail-input')).rejects.toThrow('Temp failure');
    
    const result = await analyzeDailyActivity('fail-input');
    expect(result).toEqual({ activities: [] });
    // Total 2 attempts (one for the first failed request, one for the second successful one)
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
