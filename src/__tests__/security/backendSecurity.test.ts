import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express from 'express';
import type { Request } from 'express';
import { csrfProtection } from '../../../server/shared/middleware/csrf';
import {
  sanitizeString,
  sanitizeData,
  checkMagicBytes,
  sanitizeFilename,
  validateReceiptUpload
} from '../../../server/shared/middleware/validate';
import { resolveClientIp } from '../../../server/shared/middleware/rateLimit';

describe('Backend Security Audits', () => {
  describe('1. Input Sanitization & Escaping', () => {
    it('should strip HTML tags and escape dangerous characters', () => {
      const payload = '<script>alert("hacked")</script> <b>hello</b> & "world"';
      const sanitized = sanitizeString(payload);
      expect(sanitized).toBe('alert(&quot;hacked&quot;) hello &amp; &quot;world&quot;');
    });

    it('should recursively sanitize objects and arrays while skipping base64 images', () => {
      const data = {
        name: '<b>John</b>',
        hobbies: ['<script>evil()</script>', 'reading'],
        image: 'iVBORw0KGgoAAAANSzk...too_long_base64_string_representing_an_image',
      };

      const sanitized = sanitizeData(data);
      expect(sanitized.name).toBe('John');
      expect(sanitized.hobbies[0]).toBe('evil()');
      expect(sanitized.hobbies[1]).toBe('reading');
      expect(sanitized.image).toBe(data.image); // Should not be sanitized
    });
  });

  describe('2. Custom Stateless CSRF Protection', () => {
    it('should reject POST requests lacking custom security headers', async () => {
      const app = express();
      app.use(express.json());
      // Set NODE_ENV to something other than 'test' to force CSRF execution
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      app.post('/api/test', csrfProtection, (_req, res) => {
        res.json({ success: true });
      });

      const res = await request(app).post('/api/test').send({ data: 'test' });
      expect(res.status).toBe(403);
      expect(res.body.error).toContain('CSRF Protection: Missing required custom request headers');

      process.env.NODE_ENV = originalEnv;
    });

    it('should allow POST requests presenting X-Requested-With header', async () => {
      const app = express();
      app.use(express.json());
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      app.post('/api/test', csrfProtection, (_req, res) => {
        res.json({ success: true });
      });

      const res = await request(app)
        .post('/api/test')
        .set('X-Requested-With', 'XMLHttpRequest')
        .send({ data: 'test' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      process.env.NODE_ENV = originalEnv;
    });

    it('should reject requests from unauthorized origins', async () => {
      const app = express();
      app.use(express.json());
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      app.post('/api/test', csrfProtection, (_req, res) => {
        res.json({ success: true });
      });

      const res = await request(app)
        .post('/api/test')
        .set('X-Requested-With', 'XMLHttpRequest')
        .set('Origin', 'http://malicious-site.com')
        .send({ data: 'test' });

      expect(res.status).toBe(403);
      expect(res.body.error).toContain('CSRF Protection: Unauthorized request origin');

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('3. Rate Limiter IP Key Generator', () => {
    it('should parse client IP from X-Forwarded-For header correctly', () => {
      const mockReq = {
        headers: {
          'x-forwarded-for': '203.0.113.195, 70.41.3.18, 150.172.238.178',
        },
      } as unknown as Request;
      const key = resolveClientIp(mockReq);
      expect(key).toBe('203.0.113.195');
    });

    it('should fallback to req.ip when X-Forwarded-For is missing', () => {
      const mockReq = {
        headers: {},
        ip: '192.168.1.1',
      } as unknown as Request;
      const key = resolveClientIp(mockReq);
      expect(key).toBe('192.168.1.1');
    });
  });

  describe('4. File Magic Bytes & Filename Sanitization', () => {
    it('should correctly detect JPEG, PNG, and WebP magic bytes', () => {
      // PNG magic bytes
      const pngBuffer = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
      expect(checkMagicBytes(pngBuffer).mimeType).toBe('image/png');

      // JPEG magic bytes
      const jpegBuffer = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46]);
      expect(checkMagicBytes(jpegBuffer).mimeType).toBe('image/jpeg');

      // WebP magic bytes
      const webpBuffer = Buffer.from([
        0x52, 0x49, 0x46, 0x46, // RIFF
        0x00, 0x00, 0x00, 0x00, 
        0x57, 0x45, 0x42, 0x50  // WEBP
      ]);
      expect(checkMagicBytes(webpBuffer).mimeType).toBe('image/webp');

      // Invalid magic bytes
      const invalidBuffer = Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
      expect(checkMagicBytes(invalidBuffer).isValid).toBe(false);
    });

    it('should sanitize dangerous filenames to prevent path traversal', () => {
      expect(sanitizeFilename('../../etc/passwd')).toBe('passwd');
      expect(sanitizeFilename('my image!.png')).toBe('my_image_.png');
      expect(sanitizeFilename('..')).toBe('sanitized_receipt.png');
    });

    it('should validate receipt payloads correctly', async () => {
      const app = express();
      app.use(express.json());
      app.post('/api/upload', validateReceiptUpload, (req, res) => {
        res.json({ success: true, mimeType: req.body.mimeType, filename: req.body.filename });
      });

      // Valid PNG mock base64 (PNG magic bytes base64 is iVBORw0KGgo...)
      const pngBase64 = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]).toString('base64');
      const validRes = await request(app)
        .post('/api/upload')
        .send({
          image: pngBase64,
          mimeType: 'image/png',
          filename: 'receipt..png'
        });

      expect(validRes.status).toBe(200);
      expect(validRes.body.mimeType).toBe('image/png');
      expect(validRes.body.filename).toBe('receipt..png');

      // Invalid mimeType mismatch
      const mismatchRes = await request(app)
        .post('/api/upload')
        .send({
          image: pngBase64,
          mimeType: 'image/jpeg',
        });
      expect(mismatchRes.status).toBe(400);
      expect(mismatchRes.body.error).toContain('MIME type does not match actual image signature');
    });
  });
});
