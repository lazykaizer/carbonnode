import { Router } from 'express';
import type { Request, Response } from 'express';
import { getGeminiModel, parseJsonResponse } from '../../shared/geminiClient';
import { CarbonSubtitlesRequestSchema } from '../../../src/schemas';
import { validateSchema } from '../../shared/middleware/validate';

const router = Router();

/* ─── Constants ───────────────────────────────────────────── */

/** Timeout for fetching external page meta tags (ms). */
export const META_FETCH_TIMEOUT_MS = 3000;

/* ─── Prompt ──────────────────────────────────────────────── */

const SUBTITLES_PROMPT = `You are a carbon footprint analyst. The user has pasted a URL.
Based on the URL and the webpage metadata context provided, estimate the carbon cost of the product, service, or activity the URL represents.

Return ONLY a JSON response in this exact format:
{
  "activity": "What this URL represents",
  "co2Kg": 2.5,
  "alternative": "A lower-carbon alternative",
  "alternativeCo2Kg": 0.5,
  "explanation": "Brief explanation of the carbon cost"
}

Use realistic estimates. If you're uncertain, provide reasonable ranges.
Focus on Indian context where relevant.`;

/* ─── Mock Response ───────────────────────────────────────── */

const MOCK_FOOD_DELIVERY_CO2 = 2.1;
const MOCK_FOOD_DELIVERY_ALT_CO2 = 0.6;
const MOCK_STREAMING_CO2 = 0.35;
const MOCK_STREAMING_ALT_CO2 = 0.05;
const MOCK_CAB_RIDE_CO2 = 2.5;
const MOCK_CAB_RIDE_ALT_CO2 = 0.2;
const MOCK_ONLINE_PURCHASE_CO2 = 2.8;
const MOCK_ONLINE_PURCHASE_ALT_CO2 = 0.9;

function getMockResponse(url: string) {
  const lowerUrl = url.toLowerCase();

  if (lowerUrl.includes('swiggy') || lowerUrl.includes('zomato') || lowerUrl.includes('food')) {
    return {
      activity: 'Swiggy/Zomato Online Food Delivery Meal',
      co2Kg: MOCK_FOOD_DELIVERY_CO2,
      alternative: 'Home-cooked meal with local ingredients',
      alternativeCo2Kg: MOCK_FOOD_DELIVERY_ALT_CO2,
      explanation: 'Food delivery incurs emissions from restaurant cooking, single-use plastic packaging, and single-occupant motorcycle courier transport.'
    };
  } else if (lowerUrl.includes('netflix') || lowerUrl.includes('youtube') || lowerUrl.includes('video') || lowerUrl.includes('prime')) {
    return {
      activity: '4K Ultra-HD Movie Streaming (2h)',
      co2Kg: MOCK_STREAMING_CO2,
      alternative: 'Standard Definition (SD) Streaming',
      alternativeCo2Kg: MOCK_STREAMING_ALT_CO2,
      explanation: 'Data transmission across cell networks and cloud data center compute are highly energy-intensive. SD reduces network bandwidth by 85%.'
    };
  } else if (lowerUrl.includes('ola') || lowerUrl.includes('uber') || lowerUrl.includes('cab')) {
    return {
      activity: 'Private Petrol Cab Ride (12km)',
      co2Kg: MOCK_CAB_RIDE_CO2,
      alternative: 'Namma Metro Commute',
      alternativeCo2Kg: MOCK_CAB_RIDE_ALT_CO2,
      explanation: 'Single-passenger travel in petrol vehicles emits significant CO₂ per passenger-kilometer. Electric public transit distributes energy cost across hundreds of riders.'
    };
  } else {
    return {
      activity: 'Online Product/Service Purchase',
      co2Kg: MOCK_ONLINE_PURCHASE_CO2,
      alternative: 'Local store purchase / eco-branded alternative',
      alternativeCo2Kg: MOCK_ONLINE_PURCHASE_ALT_CO2,
      explanation: 'Pasting standard product links generally incurs manufacturing emissions and delivery courier logistics. Choosing locally or consolidated delivery options reduces footprint.'
    };
  }
}

/* ─── Meta Tag Fetcher ────────────────────────────────────── */

interface MetaTags {
  title: string;
  activityName: string;
  ogTitle: string;
}

/**
 * Fetches and sanitizes open-graph / meta tag content from an external URL.
 * Content is truncated and stripped of special characters to prevent prompt injection.
 */
async function fetchMetaTags(url: string): Promise<MetaTags> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), META_FETCH_TIMEOUT_MS);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CarbonNodeBot/1.0)'
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) return { title: '', activityName: '', ogTitle: '' };

    const html = await response.text();

    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const rawTitle = titleMatch ? titleMatch[1].trim() : '';

    const descMatch =
      html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([\s\S]*?)["'][^>]*>/i) ||
      html.match(/<meta[^>]*content=["']([\s\S]*?)["'][^>]*name=["']description["'][^>]*>/i);
    const rawDescription = descMatch ? descMatch[1].trim() : '';

    const ogTitleMatch =
      html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([\s\S]*?)["'][^>]*>/i) ||
      html.match(/<meta[^>]*content=["']([\s\S]*?)["'][^>]*property=["']og:title["'][^>]*>/i);
    const rawOgTitle = ogTitleMatch ? ogTitleMatch[1].trim() : '';

    return {
      title: sanitizeMetaContent(rawTitle, 100),
      activityName: sanitizeMetaContent(rawDescription, 200),
      ogTitle: sanitizeMetaContent(rawOgTitle, 100),
    };
  } catch {
    return { title: '', activityName: '', ogTitle: '' };
  }
}

/**
 * Strips characters that could be used for prompt injection and truncates the string.
 */
function sanitizeMetaContent(input: string, maxLength: number): string {
  return input
    .replace(/[\n\r"`\\]/g, ' ')  // Remove newlines, backticks, quotes, backslashes
    .replace(/\s+/g, ' ')         // Collapse whitespace
    .trim()
    .slice(0, maxLength);
}

/* ─── Route ───────────────────────────────────────────────── */

router.post(
  '/',
  validateSchema(CarbonSubtitlesRequestSchema),
  async (req: Request, res: Response) => {
    const { videoUrl: url } = req.body;
    const model = getGeminiModel();

    if (!model) {
      res.json({ ...getMockResponse(url), source: 'fallback' });
      return;
    }

    try {
      const meta = await fetchMetaTags(url);
      const prompt = `${SUBTITLES_PROMPT}

URL: ${url}
Fetched Page Title: ${meta.title}
Fetched Page Description: ${meta.activityName}
Fetched OpenGraph Title: ${meta.ogTitle}`;

      const result = await model.generateContent(prompt);
      const parsed = parseJsonResponse<unknown>(result.response.text());
      res.json(parsed);
    } catch {
      res.json({ ...getMockResponse(url), source: 'fallback' });
    }
  }
);

export default router;
