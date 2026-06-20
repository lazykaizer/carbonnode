import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import type { Request, Response } from 'express';
import { validateSchema, validateReceiptUpload } from '../../../server/shared/middleware/validate';
import { apiLimiter } from '../../../server/shared/middleware/rateLimit';
import { CarbonMirrorRequestSchema } from '../../../src/schemas';
import mirrorRouter from '../../../server/domain/mirror/handler';
import scannerRouter from '../../../server/domain/receipt/handler';
import subtitlesRouter from '../../../server/domain/subtitles/handler';
import storyRouter from '../../../server/domain/story/handler';
import { getGeminiModel } from '../../../server/shared/geminiClient';

// Mock the Gemini client module
vi.mock('../../../server/shared/geminiClient', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../server/shared/geminiClient')>();
  return {
    ...actual,
    getGeminiModel: vi.fn(),
  };
});

describe('Backend Unit, Middleware & Router Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('1. Zod Schema Validation Middleware (validateSchema)', () => {
    const testSchema = CarbonMirrorRequestSchema;

    it('returns 400 bad request and does not call next when input is invalid', async () => {
      // Proves that Zod validation middleware intercepts invalid inputs and returns a 400 JSON error
      const app = express();
      app.use(express.json());
      app.post('/test', validateSchema(testSchema), (_req, res) => {
        res.json({ success: true });
      });

      const response = await request(app).post('/test').send({ text: 123 }); // 'text' must be a string, min 3 chars
      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it('sanitizes HTML tags and calls next when input is valid', async () => {
      // Proves that valid input is successfully parsed, stripped of extra fields, and script tags are sanitized before proceeding
      const app = express();
      app.use(express.json());
      app.post('/test', validateSchema(testSchema), (req, res) => {
        res.json({ success: true, body: req.body });
      });

      const response = await request(app)
        .post('/test')
        .send({ text: '<script>alert("hacked")</script>Hello', extra: 'field' });

      expect(response.status).toBe(200);
      expect(response.body.body.text).toBe('alert(&quot;hacked&quot;)Hello');
      expect(response.body.body.extra).toBeUndefined(); // Extra fields must be stripped
    });
  });

  describe('2. Rate Limiter Middleware (apiLimiter)', () => {
    it('allows requests within threshold and returns 429 when threshold exceeded', async () => {
      // Proves that making 16 requests from the same IP returns a 429 status code on the 16th request
      const app = express();
      app.use(express.json());
      app.get('/test-limit', apiLimiter, (_req, res) => {
        res.json({ allowed: true });
      });

      const ip = '1.2.3.4';

      // Make 15 requests (the limit)
      for (let i = 0; i < 15; i++) {
        const res = await request(app).get('/test-limit').set('X-Forwarded-For', ip);
        expect(res.status).toBe(200);
      }

      // 16th request should fail with 429
      const limitRes = await request(app).get('/test-limit').set('X-Forwarded-For', ip);
      expect(limitRes.status).toBe(429);
      expect(limitRes.body.error).toBe('Rate limit exceeded');
    });

    it('isolates rate limits between separate IP addresses', async () => {
      // Proves that rate limits are tracked per IP, and a new client IP is allowed even if another IP is limited
      const app = express();
      app.use(express.json());
      app.get('/test-limit', apiLimiter, (_req, res) => {
        res.json({ allowed: true });
      });

      const ip1 = '5.6.7.8';
      const ip2 = '9.10.11.12';

      // Lock out ip1
      for (let i = 0; i < 16; i++) {
        await request(app).get('/test-limit').set('X-Forwarded-For', ip1);
      }

      // ip1 is limited
      const res1 = await request(app).get('/test-limit').set('X-Forwarded-For', ip1);
      expect(res1.status).toBe(429);

      // ip2 should still succeed
      const res2 = await request(app).get('/test-limit').set('X-Forwarded-For', ip2);
      expect(res2.status).toBe(200);
    });
  });

  describe('3. Receipt Upload Middleware (validateReceiptUpload)', () => {
    const validPngBase64 = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).toString(
      'base64',
    );

    it('allows valid image signatures and sanitizes filename path traversals', async () => {
      // Proves that upload middleware accepts genuine image magic bytes and strips folder navigation dots from filenames
      const app = express();
      app.use(express.json());
      app.post('/upload', validateReceiptUpload, (req, res) => {
        res.json({ success: true, mimeType: req.body.mimeType, filename: req.body.filename });
      });

      const response = await request(app).post('/upload').send({
        image: validPngBase64,
        mimeType: 'image/png',
        filename: '../../receipt.png',
      });

      expect(response.status).toBe(200);
      expect(response.body.filename).toBe('receipt.png');
      expect(response.body.mimeType).toBe('image/png');
    });

    it('returns 400 when file payload size exceeds 4MB limit', () => {
      // Proves that base64 strings larger than 4MB are rejected with size limit errors
      const largeBase64 = 'A'.repeat(5.8 * 1024 * 1024);
      const req = {
        body: {
          image: largeBase64,
          mimeType: 'image/png',
        },
      } as unknown as Request;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response;
      const next = vi.fn();

      validateReceiptUpload(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('Payload size exceeds limit'),
        }),
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('returns 400 when image signature does not match declared MIME type', async () => {
      // Proves that mismatching signatures (e.g. PNG bytes declared as JPEG) trigger security signature errors
      const app = express();
      app.use(express.json());
      app.post('/upload', validateReceiptUpload, (_req, res) => {
        res.json({ success: true });
      });

      const response = await request(app).post('/upload').send({
        image: validPngBase64,
        mimeType: 'image/jpeg',
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('MIME type does not match actual image signature');
    });

    it('returns 400 when magic bytes are invalid (wrong signature/executable)', async () => {
      // Proves that upload payloads with invalid file signatures (e.g., plain text or scripts) are rejected
      const app = express();
      app.use(express.json());
      app.post('/upload', validateReceiptUpload, (_req, res) => {
        res.json({ success: true });
      });

      const badBase64 = Buffer.from('not-an-image-file').toString('base64');
      const response = await request(app).post('/upload').send({
        image: badBase64,
        mimeType: 'image/png',
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('failed signature check');
    });
  });

  describe('4. Router API Routes Happy vs Error paths', () => {
    let mockModel: { generateContent: import('vitest').Mock };

    beforeEach(() => {
      mockModel = {
        generateContent: vi.fn(),
      };
    });

    describe('POST /api/carbon-mirror', () => {
      it('returns parsed Gemini JSON response on model success', async () => {
        // Proves that Carbon Mirror returns 200 with correctly parsed Gemini JSON content when the API is active and functional
        (getGeminiModel as import('vitest').Mock).mockReturnValue(mockModel);
        const mockResponse = {
          activities: [{ name: 'Test', co2Kg: 1.2, category: 'other', suggestion: 'Tip' }],
          totalCo2Kg: 1.2,
          overallSuggestion: 'Overall tip',
        };
        mockModel.generateContent.mockResolvedValueOnce({
          response: { text: () => JSON.stringify(mockResponse) },
        });

        const app = express();
        app.use(express.json());
        app.use('/api/carbon-mirror', mirrorRouter);

        const response = await request(app)
          .post('/api/carbon-mirror')
          .send({ text: 'I did some general test activity today.' });

        expect(response.status).toBe(200);
        expect(response.body.totalCo2Kg).toBe(1.2);
        expect(response.body.overallSuggestion).toBe('Overall tip');
      });

      it('falls back to rule-based mock response on model failure', async () => {
        // Proves that Carbon Mirror falls back gracefully to rule-based mock outputs on Gemini API error
        (getGeminiModel as import('vitest').Mock).mockReturnValue(mockModel);
        mockModel.generateContent.mockRejectedValueOnce(new Error('API quota exceeded'));

        const app = express();
        app.use(express.json());
        app.use('/api/carbon-mirror', mirrorRouter);

        const response = await request(app)
          .post('/api/carbon-mirror')
          .send({ text: 'I drove my car today' });

        expect(response.status).toBe(200);
        expect(response.body.source).toBe('fallback');
        expect(response.body.activities[0].category).toBe('transport');
        expect(response.body.activities[0].name).toContain('Car Ride');
      });
    });

    describe('POST /api/receipt-scanner', () => {
      it('returns parsed Gemini receipt analysis on model success', async () => {
        // Proves that Receipt Scanner returns 200 and parsed JSON from Gemini on model success
        (getGeminiModel as import('vitest').Mock).mockReturnValue(mockModel);
        const mockResponse = {
          items: [{ name: 'apples', quantity: 1, co2Kg: 0.2 }],
          totalCo2Kg: 0.2,
          storeName: 'Grocery Store',
        };
        mockModel.generateContent.mockResolvedValueOnce({
          response: { text: () => JSON.stringify(mockResponse) },
        });

        const app = express();
        app.use(express.json());
        app.use('/api/receipt-scanner', scannerRouter);

        const response = await request(app)
          .post('/api/receipt-scanner')
          .send({ image: 'base64string', mimeType: 'image/jpeg' }); // Bypasses magic bytes in test environment for dummy integration payloads

        expect(response.status).toBe(200);
        expect(response.body.storeName).toBe('Grocery Store');
        expect(response.body.totalCo2Kg).toBe(0.2);
      });
    });

    describe('POST /api/carbon-subtitles', () => {
      it('returns parsed subtitles analysis on model success', async () => {
        // Proves that Subtitles crawler returns 200 and parsed alternatives from Gemini on model success
        (getGeminiModel as import('vitest').Mock).mockReturnValue(mockModel);
        const mockResponse = {
          activity: 'Online purchase',
          co2Kg: 2.5,
          alternative: 'Local store',
          alternativeCo2Kg: 0.5,
          explanation: 'Logistics footprint is high.',
        };
        mockModel.generateContent.mockResolvedValueOnce({
          response: { text: () => JSON.stringify(mockResponse) },
        });

        const app = express();
        app.use(express.json());
        app.use('/api/carbon-subtitles', subtitlesRouter);

        const response = await request(app)
          .post('/api/carbon-subtitles')
          .send({ videoUrl: 'https://swiggy.com/order-meal' });

        expect(response.status).toBe(200);
        expect(response.body.activity).toBe('Online purchase');
        expect(response.body.alternative).toBe('Local store');
      });
    });

    describe('POST /api/carbon-story', () => {
      const validWeekData = {
        totalCo2Kg: 40,
        vsIndianAverage: 'below' as const,
        percentageVsAverage: 80,
        bestCategory: 'food',
        worstCategory: 'transport',
        streakDays: 5,
        actionsLogged: 12,
        topActivity: 'Metro ride',
        weekNumber: 1,
      };

      it('returns generated story on model success', async () => {
        // Proves that story router returns 200 and compiled text when Gemini model generates successfully
        (getGeminiModel as import('vitest').Mock).mockReturnValue(mockModel);
        const mockResponse = {
          story: 'Great week of green decisions.',
          highlightStat: '40kg logged',
          weekRating: 'good',
          nextWeekTip: 'Eat veggies',
        };
        mockModel.generateContent.mockResolvedValueOnce({
          response: { text: () => JSON.stringify(mockResponse) },
        });

        const app = express();
        app.use(express.json());
        app.use('/api/carbon-story', storyRouter);

        const response = await request(app).post('/api/carbon-story').send(validWeekData);

        expect(response.status).toBe(200);
        expect(response.body.story).toBe('Great week of green decisions.');
        expect(response.body.weekRating).toBe('good');
      });
    });
  });
});
