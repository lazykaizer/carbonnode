/** Zod schemas for Zustand gamification store rehydration validation. */
import { z } from 'zod';

export const BadgeSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  emoji: z.string(),
  unlocked: z.boolean(),
  unlockedAt: z.string().nullable(),
});

export const CarbonStoryDataSchema = z.object({
  id: z.string(),
  weekNumber: z.number().int().positive(),
  story: z.string(),
  highlightStat: z.string(),
  weekRating: z.enum(['excellent', 'good', 'average', 'poor']),
  nextWeekTip: z.string(),
  createdAt: z.string(),
});

export const GamificationStateSchema = z.object({
  xp: z.number().nonnegative(),
  streak: z.number().nonnegative(),
  lastActiveDate: z.string().nullable(),
  badges: z.array(BadgeSchema),
  shareCount: z.number().nonnegative(),
  publicTransportDays: z.number().nonnegative(),
  stories: z.array(CarbonStoryDataSchema),
});
