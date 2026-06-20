import rateLimit from 'express-rate-limit';
import type { Request } from 'express';

interface RateLimitedRequest extends Request {
  rateLimit?: {
    resetTime?: Date;
  };
}

/**
 * Resolves the client's real IP address, handling proxy chains securely.
 *
 * WHY:
 * When deployed behind load balancers/proxies (like Google Cloud Run), the direct socket remote address
 * is the load balancer's IP. To avoid rate-limiting all users globally, we inspect 'X-Forwarded-For'
 * and extract the leftmost client IP.
 */
export function resolveClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    const parts = forwarded.split(',');
    const clientIp = parts[0].trim();
    if (clientIp) return clientIp;
  }
  return req.ip || req.socket.remoteAddress || 'unknown-client-ip';
}

/**
 * Configure rate limiter to prevent abuse and brute force.
 *
 * WHY:
 * Limits requests to 15 per minute per individual client IP.
 * Uses resolveClientIp to handle cloud proxy configurations.
 */
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 60 seconds
  max: 15, // limit each IP to 15 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,

  keyGenerator: resolveClientIp,

  validate: false,

  handler: (req, res) => {
    const rateReq = req as RateLimitedRequest;
    const resetTime = rateReq.rateLimit?.resetTime?.getTime();
    const retryAfter = resetTime ? Math.ceil((resetTime - Date.now()) / 1000) : 60;
    res.status(429).json({
      error: 'Rate limit exceeded',
      retryAfter,
    });
  },
});
