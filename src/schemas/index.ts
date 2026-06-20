/** Zod schemas as the single source of truth for all data shapes. TypeScript types are derived via z.infer<> — never written separately. */
import { z } from 'zod';

export const CarbonCategorySchema = z.enum(['transport', 'food', 'energy', 'shopping', 'other']);

export const CarbonEntrySchema = z.object({
  id: z.string().uuid(),
  category: CarbonCategorySchema,
  activityName: z.string(),
  co2Kg: z.number().nonnegative(),
  date: z.string().datetime(),
  source: z.enum(['manual', 'mirror', 'receipt', 'subtitles']),
  notes: z.string().max(500).optional(),
});

export const BudgetLimitsSchema = z.object({
  transport: z.number().nonnegative(),
  food: z.number().nonnegative(),
  energy: z.number().nonnegative(),
  shopping: z.number().nonnegative(),
  other: z.number().nonnegative(),
});

export const CarbonMirrorActivitySchema = z.object({
  name: z.string(),
  co2Kg: z.number().nonnegative(),
  category: CarbonCategorySchema,
  suggestion: z.string(),
});

export const CarbonMirrorRequestSchema = z.object({
  text: z.string().max(500),
});

export const CarbonMirrorResponseSchema = z.object({
  activities: z.array(CarbonMirrorActivitySchema),
  totalCo2Kg: z.number().nonnegative(),
  overallSuggestion: z.string(),
});

export const ReceiptItemSchema = z.object({
  name: z.string(),
  quantity: z.number().positive(),
  co2Kg: z.number().nonnegative(),
});

export const ReceiptScannerRequestSchema = z.object({
  image: z.string(),
  mimeType: z.string(),
  filename: z.string().max(255).optional(),
});

export const ReceiptScannerResponseSchema = z.object({
  items: z.array(ReceiptItemSchema),
  totalCo2Kg: z.number().nonnegative(),
  storeName: z.string(),
});

export const CarbonSubtitlesRequestSchema = z.object({
  videoUrl: z.string().url(),
});

export const CarbonSubtitlesResponseSchema = z.object({
  activity: z.string(),
  co2Kg: z.number().nonnegative(),
  alternative: z.string(),
  alternativeCo2Kg: z.number().nonnegative(),
  explanation: z.string(),
});

export const CarbonStoryRequestSchema = z.object({
  totalCo2Kg: z.number().nonnegative(),
  vsIndianAverage: z.enum(['below', 'above', 'equal']),
  percentageVsAverage: z.number().nonnegative(),
  bestCategory: z.string(),
  worstCategory: z.string(),
  streakDays: z.number().nonnegative(),
  actionsLogged: z.number().nonnegative(),
  topActivity: z.string(),
  weekNumber: z.number().int().positive(),
});

export const CarbonStoryResponseSchema = z.object({
  story: z.string(),
  highlightStat: z.string(),
  weekRating: z.enum(['excellent', 'good', 'average', 'poor']),
  nextWeekTip: z.string(),
});

// Helper functions
export function safeParseEntries(raw: unknown): z.infer<typeof CarbonEntrySchema>[] {
  const result = z.array(CarbonEntrySchema).safeParse(raw);
  if (result.success) {
    return result.data;
  }
  if (raw !== undefined && raw !== null) {
    console.warn('Failed to parse carbon entries', result.error);
  }
  return [];
}

export function safeParseBudget(raw: unknown): z.infer<typeof BudgetLimitsSchema> {
  const result = BudgetLimitsSchema.safeParse(raw);
  if (result.success) {
    return result.data;
  }
  if (raw !== undefined && raw !== null) {
    console.warn('Failed to parse budget limits', result.error);
  }
  return {
    transport: 0,
    food: 0,
    energy: 0,
    shopping: 0,
    other: 0,
  };
}
