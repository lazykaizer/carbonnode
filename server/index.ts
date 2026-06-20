/** Module containing logic for index. */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import dotenv from 'dotenv';
import { apiLimiter } from './shared/middleware/rateLimit';
import { csrfProtection } from './shared/middleware/csrf';
import mirrorRouter from './domain/mirror/handler';
import scannerRouter from './domain/receipt/handler';
import subtitlesRouter from './domain/subtitles/handler';
import storyRouter from './domain/story/handler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Helmet Security Headers configuration
// WHY: Helmet secures the app by setting various HTTP headers (XSS protection, MIME sniffing, HSTS, frame options).
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'", 'https://*.googleapis.com', 'https://*.vertexai.com'],
        imgSrc: ["'self'", 'data:', 'blob:'],
        styleSrc: ["'self'", "'unsafe-inline'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    // Explicitly deny framing to prevent Clickjacking attacks
    xFrameOptions: { action: 'deny' },
    xContentTypeOptions: true,
    // Enforce zero referrer leak to third-party endpoints
    referrerPolicy: {
      policy: 'no-referrer',
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
    },
  }),
);

// Set Permissions-Policy header manually
// WHY: Restricts browser feature API access (camera, geolocation, etc.) to minimize potential abuse surface.
app.use((_req, res, next) => {
  res.setHeader(
    'Permissions-Policy',
    'camera=(self), microphone=(), geolocation=(), interest-cohort=()',
  );
  next();
});

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:8080',
  'http://127.0.0.1:5173',
  process.env.ALLOWED_ORIGIN, // set this to your Cloud Run URL in production
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // allow same-origin / curl
      if (ALLOWED_ORIGINS.includes(origin) || origin.endsWith('.run.app'))
        return callback(null, true);
      return callback(new Error(`CORS: origin '${origin}' not allowed`), false);
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: '5mb' }));

// Apply CSRF Protection middleware globally on all state-changing API endpoints
// WHY: Prevents cross-origin site request forgery from executing Gemini API operations
app.use('/api', csrfProtection);

// Health Check Endpoint (pre-limiter to avoid locking out monitors)
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Apply rate limiter to all API endpoints
app.use('/api', apiLimiter);

// API Endpoints
app.use('/api/carbon-mirror', mirrorRouter);
app.use('/api/receipt-scanner', scannerRouter);
app.use('/api/carbon-subtitles', subtitlesRouter);
app.use('/api/carbon-story', storyRouter);

// Serve static React build files in production
const clientBuildPath = path.resolve(process.cwd(), 'dist/client');
app.use(express.static(clientBuildPath));

// Fallback to React index.html for SPA client-side routing
app.get(/.*/, (req, res) => {
  // Only serve index.html for page loads, not APIs
  if (req.path.startsWith('/api')) {
    res.status(404).json({ error: 'Endpoint not found' });
    return;
  }
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

app.listen(PORT, () => {
  console.warn(`Server is running on port ${PORT}`);
});

export default app;
