import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import app from '../../../server/index';
import type { Request, Response, NextFunction } from 'express';

// Mock rate limiter to easily hit limits
vi.mock('../../../server/shared/middleware/rateLimit', () => {
  let requestCount = 0;
  return {
    apiLimiter: (_req: Request, res: Response, next: NextFunction) => {
      requestCount++;
      if (requestCount > 5) {
        return res.status(429).json({ error: 'Too many requests' });
      }
      next();
    },
    resetRateLimit: () => {
      requestCount = 0;
    },
  };
});

describe('Server API Routes', () => {
  const originalEnv = process.env.GEMINI_API_KEY;

  beforeEach(async () => {
    // Reset rate limiter mock state
    const rateLimitMock = (await import('../../../server/shared/middleware/rateLimit')) as {
      resetRateLimit?: () => void;
    };
    if (rateLimitMock.resetRateLimit) {
      rateLimitMock.resetRateLimit();
    }
  });

  afterEach(() => {
    process.env.GEMINI_API_KEY = originalEnv;
    vi.restoreAllMocks();
  });

  describe('POST /api/carbon-mirror', () => {
    it('returns 400 when required body fields are missing', async () => {
      const response = await request(app).post('/api/carbon-mirror').send({});
      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it('returns 200 with source: "fallback" when GEMINI_API_KEY is not set', async () => {
      process.env.GEMINI_API_KEY = ''; // Trigger fallback
      const response = await request(app)
        .post('/api/carbon-mirror')
        .send({ text: 'I drove my car today.' });

      expect(response.status).toBe(200);
      expect(response.body.source).toBe('fallback');
      expect(response.body.activities).toBeDefined();
    });
  });

  describe('POST /api/receipt-scanner', () => {
    it('returns 400 when required body fields are missing', async () => {
      const response = await request(app).post('/api/receipt-scanner').send({
        // Missing mimeType
        image: 'base64string',
      });
      expect(response.status).toBe(400);
    });

    it('returns 200 with source: "fallback" when GEMINI_API_KEY is not set', async () => {
      process.env.GEMINI_API_KEY = '';
      const response = await request(app)
        .post('/api/receipt-scanner')
        .send({ image: 'base64string', mimeType: 'image/jpeg' });

      expect(response.status).toBe(200);
      expect(response.body.source).toBe('fallback');
      expect(response.body.items).toBeDefined();
    });
  });

  describe('POST /api/carbon-subtitles', () => {
    it('returns 400 when required body fields are missing', async () => {
      const response = await request(app).post('/api/carbon-subtitles').send({});
      expect(response.status).toBe(400);
    });

    it('returns 200 with source: "fallback" when GEMINI_API_KEY is not set', async () => {
      process.env.GEMINI_API_KEY = '';
      const response = await request(app)
        .post('/api/carbon-subtitles')
        .send({ videoUrl: 'https://swiggy.com/some-food' });

      expect(response.status).toBe(200);
      expect(response.body.source).toBe('fallback');
      expect(response.body.activity).toBeDefined();
    });
  });

  describe('POST /api/carbon-story', () => {
    const validWeekData = {
      totalCo2Kg: 50,
      vsIndianAverage: 'below',
      percentageVsAverage: 20,
      bestCategory: 'food',
      worstCategory: 'transport',
      streakDays: 5,
      actionsLogged: 10,
      topActivity: 'Metro',
      weekNumber: 1,
    };

    it('returns 400 when required body fields are missing', async () => {
      const response = await request(app).post('/api/carbon-story').send({});
      expect(response.status).toBe(400);
    });

    it('returns 200 with source: "fallback" when GEMINI_API_KEY is not set', async () => {
      process.env.GEMINI_API_KEY = '';
      const response = await request(app).post('/api/carbon-story').send(validWeekData);

      expect(response.status).toBe(200);
      expect(response.body.source).toBe('fallback');
      expect(response.body.story).toBeDefined();
    });
  });

  describe('Rate Limiter', () => {
    it('returns 429 when rate limit is hit', async () => {
      process.env.GEMINI_API_KEY = ''; // Trigger fast fallback for all requests
      // Make 6 requests, the 6th should fail with 429 based on our mock
      for (let i = 0; i < 5; i++) {
        await request(app).post('/api/carbon-mirror').send({ text: 'test' });
      }
      const response = await request(app).post('/api/carbon-mirror').send({ text: 'test' });
      expect(response.status).toBe(429);
      expect(response.body.error).toBe('Too many requests');
    });
  });
});
