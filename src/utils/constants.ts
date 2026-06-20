/** Application-wide named constants derived from emission factors and configuration. No raw numbers anywhere else in the app. */
import type { Badge, WorldVisualConfig } from '@/types';
import {
  INDIA_URBAN_ANNUAL_TONS,
  INDIA_URBAN_MONTHLY_KG,
  INDIA_URBAN_DAILY_KG,
  CAR_PETROL_KG_PER_KM,
  CO2_PER_TREE_KG_PER_YEAR,
} from './emissionFactors';

/** ─── App Info ────────────────────────────────────────────── */

export const APP_NAME = 'Carbon Node';
export const APP_TAGLINE = 'Your life has a carbon score. Do you know yours?';
export const APP_DESCRIPTION =
  'Track, understand, and reduce your carbon footprint with AI-powered insights.';

/** ─── Carbon Constants ────────────────────────────────────── */

export const AVERAGE_INDIAN_ANNUAL_CO2_KG = INDIA_URBAN_ANNUAL_TONS * 1000;
export const AVERAGE_INDIAN_MONTHLY_CO2_KG = INDIA_URBAN_MONTHLY_KG;
export const AVERAGE_INDIAN_DAILY_CO2_KG = INDIA_URBAN_DAILY_KG;

export const DEFAULT_MONTHLY_BUDGET_KG = INDIA_URBAN_MONTHLY_KG;

export * from './categories';
export * from './levels';

export const DEFAULT_BADGES: Badge[] = [
  {
    id: 'first_scan',
    name: 'First Scan',
    description: 'Upload your first receipt',
    emoji: '📸',
    unlocked: false,
    unlockedAt: null,
  },
  {
    id: 'metro_week',
    name: 'Metro Week',
    description: 'Log public transport 5 days',
    emoji: '🚇',
    unlocked: false,
    unlockedAt: null,
  },
  {
    id: 'budget_hero',
    name: 'Budget Hero',
    description: 'Stay under budget for a full month',
    emoji: '🏆',
    unlocked: false,
    unlockedAt: null,
  },
  {
    id: 'ripple_maker',
    name: 'Ripple Maker',
    description: 'Share your ripple card 3 times',
    emoji: '🌊',
    unlocked: false,
    unlockedAt: null,
  },
  {
    id: 'story_collector',
    name: 'Story Collector',
    description: 'Generate 4 weekly carbon stories',
    emoji: '📖',
    unlocked: false,
    unlockedAt: null,
  },
];

/** ─── World Visual ────────────────────────────────────────── */

export const WORLD_STATES: Record<string, WorldVisualConfig> = {
  pristine: {
    skyGradient: ['#87CEEB', '#E0F7FA'],
    treeCount: 6,
    showSmog: false,
    sunOpacity: 1,
  },
  good: {
    skyGradient: ['#89B4C8', '#C8E6C9'],
    treeCount: 4,
    showSmog: false,
    sunOpacity: 0.85,
  },
  warning: {
    skyGradient: ['#9E9E9E', '#BDBDBD'],
    treeCount: 2,
    showSmog: false,
    sunOpacity: 0.5,
  },
  danger: {
    skyGradient: ['#616161', '#757575'],
    treeCount: 0,
    showSmog: true,
    sunOpacity: 0.2,
  },
};

/** ─── Ripple Effect ───────────────────────────────────────── */

export const DEFAULT_COMMUNITY_SIZE = 1000;
export const CO2_PER_CAR_KM = CAR_PETROL_KG_PER_KM;
export { CO2_PER_TREE_KG_PER_YEAR };

/** ─── API & Validation ────────────────────────────────────── */

export const GEMINI_RATE_LIMIT_PER_MINUTE = 15;
export const API_DEBOUNCE_MS = 300;
export const API_MAX_RETRIES = 3;
export const API_RETRY_BASE_DELAY_MS = 1000;

export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const ALLOWED_FILE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

export const MIN_INPUT_LENGTH = 3;
export const MAX_INPUT_LENGTH = 1000;
export const MAX_URL_LENGTH = 2048;

/** ─── UI Constants ────────────────────────────────────────── */

export const TRANSITION_DURATION_MS = 250;
export const MIN_TOUCH_TARGET_PX = 44;
export const MIN_BODY_FONT_SIZE_PX = 16;
export const MIN_CONTRAST_RATIO = 4.5;

/** ─── Landing Page ────────────────────────────────────────── */

export const HOW_IT_WORKS_STEPS = [
  {
    title: 'Describe',
    description: 'Tell us about your day in plain language. Our AI understands.',
    icon: '💬',
  },
  {
    title: 'Track',
    description: 'Watch your carbon footprint build up across categories.',
    icon: '📊',
  },
  {
    title: 'Reduce',
    description: 'Get personalized suggestions and see your impact grow.',
    icon: '🌱',
  },
];

export const FEATURE_PREVIEWS = [
  {
    title: 'Carbon Mirror',
    description: 'Describe your day. AI calculates the carbon cost instantly.',
    icon: '🪞',
    color: '#1a7a4a',
  },
  {
    title: 'Receipt Scanner',
    description: 'Upload a Swiggy or grocery receipt. See the hidden carbon price.',
    icon: '📱',
    color: '#2980b9',
  },
  {
    title: 'Carbon Budget',
    description: 'Set monthly limits per category. Like a money budget, but for the planet.',
    icon: '💰',
    color: '#e67e22',
  },
  {
    title: 'Ripple Effect',
    description: 'Your small action × 1000 people = massive impact. See it live.',
    icon: '🌊',
    color: '#8e44ad',
  },
  {
    title: 'Carbon Subtitles',
    description: 'Paste any URL. Get the carbon cost of that product or choice.',
    icon: '📺',
    color: '#c0392b',
  },
];
