import { z } from 'zod';
import {
  CarbonCategorySchema,
  CarbonEntrySchema,
  BudgetLimitsSchema,
  CarbonMirrorActivitySchema,
  CarbonMirrorRequestSchema,
  CarbonMirrorResponseSchema,
  ReceiptItemSchema,
  ReceiptScannerRequestSchema,
  ReceiptScannerResponseSchema,
  CarbonSubtitlesRequestSchema,
  CarbonSubtitlesResponseSchema,
  CarbonStoryRequestSchema,
  CarbonStoryResponseSchema,
} from '../schemas';

/* ─── Carbon Entry ────────────────────────────────────────── */

export type CarbonCategory = z.infer<typeof CarbonCategorySchema>;
export type CarbonEntry = z.infer<typeof CarbonEntrySchema>;
export type CarbonActivity = z.infer<typeof CarbonMirrorActivitySchema>;

/* ─── Receipt Scanner ─────────────────────────────────────── */

export type ReceiptItem = z.infer<typeof ReceiptItemSchema>;

export interface ReceiptScanResult {
  items: ReceiptItem[];
  totalCo2Kg: number;
  storeName: string;
}

/* ─── Carbon Budget ───────────────────────────────────────── */

export type BudgetLimits = z.infer<typeof BudgetLimitsSchema>;

export interface CategoryBudget {
  category: CarbonCategory;
  limitKg: number;
  usedKg: number;
}

/* ─── Carbon Subtitles ────────────────────────────────────── */

export type SubtitleResult = z.infer<typeof CarbonSubtitlesResponseSchema>;

/* ─── Ripple Effect ───────────────────────────────────────── */

export interface RippleData {
  individualSavingsKg: number;
  communitySize: number;
  collectiveSavingsKg: number;
  equivalentTrees: number;
  equivalentCarKm: number;
}

/* ─── Gamification ────────────────────────────────────────── */

export interface UserLevel {
  name: string;
  emoji: string;
  minXp: number;
  maxXp: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  unlocked: boolean;
  unlockedAt: string | null;
}

export type XpAction =
  | 'daily_log'
  | 'receipt_scan'
  | 'under_budget'
  | 'streak_7day'
  | 'story_collector';

/* ─── UI State ────────────────────────────────────────────── */

export interface LoadingState {
  carbonMirror: boolean;
  receiptScanner: boolean;
  carbonSubtitles: boolean;
}

export interface ErrorState {
  carbonMirror: string | null;
  receiptScanner: string | null;
  carbonSubtitles: string | null;
  carbonBudget: string | null;
}

/* ─── Gemini API ──────────────────────────────────────────── */

export type GeminiMirrorResponse = z.infer<typeof CarbonMirrorResponseSchema>;
export type GeminiMirrorRequest = z.infer<typeof CarbonMirrorRequestSchema>;
export type GeminiReceiptResponse = z.infer<typeof ReceiptScannerResponseSchema>;
export type GeminiReceiptRequest = z.infer<typeof ReceiptScannerRequestSchema>;
export type GeminiSubtitleResponse = z.infer<typeof CarbonSubtitlesResponseSchema>;
export type GeminiSubtitleRequest = z.infer<typeof CarbonSubtitlesRequestSchema>;

/* ─── World Visual ────────────────────────────────────────── */

export type WorldState = 'pristine' | 'good' | 'warning' | 'danger';

export interface WorldVisualConfig {
  skyGradient: [string, string];
  treeCount: number;
  showSmog: boolean;
  sunOpacity: number;
}

/* ─── Carbon Story ────────────────────────────────────────── */

export type GeminiStoryResponse = z.infer<typeof CarbonStoryResponseSchema>;
export type GeminiStoryRequest = z.infer<typeof CarbonStoryRequestSchema>;

export interface CarbonStoryData {
  id: string;
  weekNumber: number;
  story: string;
  highlightStat: string;
  weekRating: 'excellent' | 'good' | 'average' | 'poor';
  nextWeekTip: string;
  createdAt: string;
}
