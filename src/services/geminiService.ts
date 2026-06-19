import type { GeminiMirrorResponse, GeminiReceiptResponse, GeminiSubtitleResponse, GeminiStoryResponse } from '@/types';
import { GEMINI_RATE_LIMIT_PER_MINUTE, API_MAX_RETRIES, API_RETRY_BASE_DELAY_MS } from '@/utils/constants';

/* ─── Rate Limiter ────────────────────────────────────────── */

const requestTimestamps: number[] = [];

export function checkRateLimit(): boolean {
  const now = Date.now();
  const oneMinuteAgo = now - 60000;

  while (requestTimestamps.length > 0 && requestTimestamps[0] < oneMinuteAgo) {
    requestTimestamps.shift();
  }

  return requestTimestamps.length < GEMINI_RATE_LIMIT_PER_MINUTE;
}

export function recordRequest(): void {
  requestTimestamps.push(Date.now());
}

export function getClientRequestCount(): number {
  return requestTimestamps.length;
}

/* ─── Retry Logic ─────────────────────────────────────────── */

class FatalError extends Error {
  fatal = true;
  constructor(message: string) {
    super(message);
    this.name = 'FatalError';
  }
}

async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = API_MAX_RETRIES
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (lastError instanceof FatalError) {
        throw lastError;
      }

      if (attempt < maxRetries) {
        const delay = API_RETRY_BASE_DELAY_MS * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Operation failed after retries.');
}

/* ─── API Request Helper ──────────────────────────────────── */

// Client-side session request cache
// WHY: Caching identical in-flight and completed API requests avoids redundant network overhead,
// improves responsiveness, and saves Gemini API quotas for identical re-requests.
const requestCache = new Map<string, Promise<unknown>>();

export function resetServiceState(): void {
  requestTimestamps.length = 0;
  requestCache.clear();
}

async function jsonRequest<T>(url: string, body: Record<string, unknown>): Promise<T> {
  const cacheKey = `${url}:${JSON.stringify(body)}`;

  // If we have a cached promise (either pending or completed), return it
  if (requestCache.has(cacheKey)) {
    return requestCache.get(cacheKey) as Promise<T>;
  }

  if (!checkRateLimit()) {
    throw new Error('Too many requests. Please wait a moment and try again.');
  }

  const promise = withRetry(async () => {
    recordRequest();
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest', // For CSRF defense on backend
        'X-CSRF-Token': 'CarbonNode',         // Dual validation token
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      const errMsg = errBody.error || `HTTP error ${response.status}`;
      if (response.status === 429) {
        const retryAfter = errBody.retryAfter || 60;
        throw new FatalError(`Rate limit exceeded. Try again in ${retryAfter}s.`);
      }
      if (response.status < 500) {
        throw new FatalError(errMsg);
      }
      throw new Error(errMsg);
    }

    return response.json() as Promise<T>;
  });

  // Store the promise in the cache
  requestCache.set(cacheKey, promise);

  // Evict on failure so subsequent requests can try again
  promise.catch(() => {
    requestCache.delete(cacheKey);
  });

  return promise as Promise<T>;
}

/* ─── Carbon Mirror API ───────────────────────────────────── */

export async function analyzeDailyActivity(
  userInput: string
): Promise<GeminiMirrorResponse> {
  return jsonRequest<GeminiMirrorResponse>('/api/carbon-mirror', { text: userInput });
}

/* ─── Receipt Scanner API ─────────────────────────────────── */

export async function analyzeReceipt(
  imageBase64: string,
  mimeType: string,
  filename?: string
): Promise<GeminiReceiptResponse> {
  return jsonRequest<GeminiReceiptResponse>('/api/receipt-scanner', {
    image: imageBase64,
    mimeType,
    filename,
  });
}

/* ─── Carbon Subtitles API ────────────────────────────────── */

export async function analyzeUrl(
  url: string
): Promise<GeminiSubtitleResponse> {
  return jsonRequest<GeminiSubtitleResponse>('/api/carbon-subtitles', { videoUrl: url });
}

/* ─── Carbon Story API ────────────────────────────────────── */

export async function generateCarbonStory(
  weekData: {
    totalCo2Kg: number;
    vsIndianAverage: 'below' | 'above' | 'equal';
    percentageVsAverage: number;
    bestCategory: string;
    worstCategory: string;
    streakDays: number;
    actionsLogged: number;
    topActivity: string;
    weekNumber: number;
  }
): Promise<GeminiStoryResponse> {
  return jsonRequest<GeminiStoryResponse>('/api/carbon-story', weekData);
}
