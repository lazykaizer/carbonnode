/** Module containing logic for csrf. */
import type { Request, Response, NextFunction } from 'express';

// List of allowed origins for the application, matching CORS configuration
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:8080',
  'http://127.0.0.1:5173',
  process.env.ALLOWED_ORIGIN,
].filter(Boolean) as string[];

/**
 * Custom Stateless CSRF Protection Middleware.
 *
 * WHY:
 * 1. This application is stateless and anonymous (no cookie-based sessions or JWT cookies).
 * 2. However, a malicious site could still attempt to trigger costly Gemini API proxy requests
 *    on behalf of a user using standard HTML forms or fetch.
 * 3. By enforcing Origin/Referer verification AND requiring custom headers ('X-Requested-With'
 *    or 'X-CSRF-Token'), we leverage the browser's Same-Origin Policy (SOP).
 *    Browsers restrict cross-origin requests from setting custom headers unless pre-approved
 *    by the server's CORS configuration. Since our CORS configuration restricts origins,
 *    this effectively blocks CSRF attacks.
 */
export function csrfProtection(req: Request, res: Response, next: NextFunction): void {
  // GET, HEAD, and OPTIONS are safe methods and do not require CSRF protection
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Bypass CSRF checks in the test environment to keep integration tests (Supertest) clean
  if (process.env.NODE_ENV === 'test') {
    return next();
  }

  // 1. Verify the Origin or Referer header matches allowed origins
  const origin = req.headers.origin;
  const referer = req.headers.referer;

  if (origin) {
    if (!ALLOWED_ORIGINS.includes(origin)) {
      res.status(403).json({ error: 'CSRF Protection: Unauthorized request origin.' });
      return;
    }
  } else if (referer) {
    try {
      const parsedReferer = new URL(referer);
      const refererOrigin = `${parsedReferer.protocol}//${parsedReferer.host}`;
      if (!ALLOWED_ORIGINS.includes(refererOrigin)) {
        res.status(403).json({ error: 'CSRF Protection: Unauthorized referer origin.' });
        return;
      }
    } catch {
      res.status(403).json({ error: 'CSRF Protection: Invalid referer header format.' });
      return;
    }
  }

  // 2. Enforce custom header check
  const hasCustomHeader =
    req.headers['x-requested-with'] === 'XMLHttpRequest' ||
    req.headers['x-csrf-token'] === 'CarbonNode';

  if (!hasCustomHeader) {
    res.status(403).json({
      error:
        'CSRF Protection: Missing required custom request headers (X-Requested-With / X-CSRF-Token).',
    });
    return;
  }

  next();
}
