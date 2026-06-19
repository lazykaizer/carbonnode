import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyzeDailyActivity } from '@/services/geminiService';

describe('API Proxy Integration Tests', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  it('should call /api/carbon-mirror with correct headers and payload', async () => {
    const mockResponse = {
      activities: [{ name: 'Test', co2Kg: 1, category: 'other', suggestion: 'Tip' }],
      totalCo2Kg: 1,
      overallSuggestion: 'Overall tip'
    };

    vi.mocked(globalThis.fetch).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const result = await analyzeDailyActivity('My daily log');

    expect(globalThis.fetch).toHaveBeenCalledWith('/api/carbon-mirror', expect.objectContaining({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-CSRF-Token': 'CarbonNode',
      },
      body: JSON.stringify({ text: 'My daily log' })
    }));
    expect(result).toEqual(mockResponse);
  });

  it('should throw an error with message returned by the server on 400 response', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: 'Field is required' }),
    } as Response);

    await expect(analyzeDailyActivity('')).rejects.toThrow('Field is required');
  });

  it('should parse retry-after and throw custom error on 429 rate limit', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue({
      ok: false,
      status: 429,
      json: async () => ({ error: 'Rate limit exceeded', retryAfter: 30 }),
    } as Response);

    await expect(analyzeDailyActivity('commute')).rejects.toThrow(/Rate limit exceeded.*30s/);
  });
});
