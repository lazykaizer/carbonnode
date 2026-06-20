/** Initializes and exports the Gemini model singleton. Returns null when GEMINI_API_KEY is absent, enabling Demo Mode across all domain handlers. */
import { GoogleGenerativeAI, type GenerativeModel } from '@google/generative-ai';
import fs from 'fs';

/* ─── Constants ───────────────────────────────────────────── */

export const GEMINI_MODEL_NAME = 'gemini-2.5-flash';
const PLACEHOLDER_KEY = 'your_gemini_api_key_here';

/* ─── API Key Resolution ──────────────────────────────────── */

/**
 * Reads the Gemini API key securely.
 *
 * WHY:
 * 1. Storing secrets in plaintext in `.env` files can lead to accidental exposure in source control
 *    or local developer disks.
 * 2. In modern container/cloud deployments (like Google Cloud Run or Kubernetes), secrets should
 *    be mounted as files (e.g. from Google Secret Manager to a volume path `/secrets/gemini-api-key`)
 *    instead of environment variables. This limits environment variable dumping leakage.
 * 3. This resolver checks for the file-mounted secret path first, and only falls back to the environment
 *    variable for convenient local development.
 */
export function getApiKey(): string | null {
  if (process.env.NODE_ENV === 'test' || process.env.E2E_MOCK === 'true') {
    return null;
  }

  // 1. Check for file-mounted secret first (Cloud secrets manager mount path)
  const secretPath = process.env.GEMINI_API_KEY_PATH || '/secrets/gemini-api-key';
  try {
    if (fs.existsSync(secretPath)) {
      const keyFromFile = fs.readFileSync(secretPath, 'utf8').trim();
      if (keyFromFile && keyFromFile !== PLACEHOLDER_KEY) {
        return keyFromFile;
      }
    }
  } catch (err) {
    // Log warning in local/non-production; do not crash standard demo flows
    console.warn(`Secrets Resolver: Checked ${secretPath} but could not read it.`, err);
  }

  // 2. Fallback to env variable for local development
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === PLACEHOLDER_KEY) return null;
  return key;
}

/* ─── Model Factory ───────────────────────────────────────── */

/**
 * Creates and returns a configured Gemini generative model.
 * Returns null when no valid API key is present (Demo Mode).
 */
export function getGeminiModel(): GenerativeModel | null {
  const apiKey = getApiKey();
  if (!apiKey) return null;
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: GEMINI_MODEL_NAME });
}

/* ─── JSON Response Parser ────────────────────────────────── */

/**
 * Parses a Gemini text response that may be wrapped in ```json ... ``` code fences.
 * Throws SyntaxError if the extracted string is not valid JSON.
 */
export function parseJsonResponse<T>(text: string): T {
  const jsonMatch = text.match(/```json\s*([\s\S]*?)```/);
  const jsonString = jsonMatch ? jsonMatch[1].trim() : text.trim();
  return JSON.parse(jsonString) as T;
}
