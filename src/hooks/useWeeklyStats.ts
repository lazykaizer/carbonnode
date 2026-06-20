/** Derives weekly carbon statistics and budget comparisons from the carbon store. Pure transformation, no side effects. */
import { useMemo } from 'react';
import { useCarbonStore } from '@/stores/carbonStore';
import { useGamificationStore } from '@/stores/gamificationStore';
import { INDIA_URBAN_DAILY_KG } from '@/utils/emissionFactors';

/** Average Indian CO₂ per week (daily average × 7 days). */
const AVERAGE_WEEKLY_CO2_KG = INDIA_URBAN_DAILY_KG * 7;

export interface WeeklyStats {
  totalCo2Kg: number;
  vsIndianAverage: 'below' | 'above' | 'equal';
  percentageVsAverage: number;
  bestCategory: string;
  worstCategory: string;
  streakDays: number;
  actionsLogged: number;
  topActivity: string;
  weekNumber: number;
}

/**
 * Computes weekly carbon statistics from stored entries and gamification state.
 * Encapsulates all business logic that was previously inline in CarbonStory.tsx.
 * @returns An object containing weekly statistics and unique log days
 */
export function useWeeklyStats(): { weeklyStats: WeeklyStats; uniqueLogDays: number } {
  const entries = useCarbonStore((state) => state.entries);
  const streak = useGamificationStore((state) => state.streak);
  const storiesLength = useGamificationStore((state) => state.stories.length);

  const uniqueLogDays = useMemo(() => {
    const days = new Set(entries.map((e) => new Date(e.date).toDateString()));
    return days.size;
  }, [entries]);

  const weeklyStats = useMemo<WeeklyStats>(() => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weeklyEntries = entries.filter((e) => new Date(e.date) >= sevenDaysAgo);

    const categoryTotals: Record<string, number> = {
      transport: 0,
      food: 0,
      energy: 0,
      shopping: 0,
      other: 0,
    };

    let totalCo2Kg = 0;
    let topActivityName = '';
    let topActivityCo2 = 0;

    for (const e of weeklyEntries) {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.co2Kg;
      totalCo2Kg += e.co2Kg;
      if (e.co2Kg > topActivityCo2) {
        topActivityCo2 = e.co2Kg;
        topActivityName = e.activityName;
      }
    }

    let worstCategory = 'energy';
    let worstVal = -1;
    let bestCategory = 'energy';
    let bestVal = Infinity;

    for (const [cat, val] of Object.entries(categoryTotals)) {
      if (val > worstVal) {
        worstVal = val;
        worstCategory = cat;
      }
      if (val < bestVal) {
        bestVal = val;
        bestCategory = cat;
      }
    }

    const vsIndianAverage =
      totalCo2Kg < AVERAGE_WEEKLY_CO2_KG
        ? 'below'
        : totalCo2Kg > AVERAGE_WEEKLY_CO2_KG
          ? 'above'
          : 'equal';

    const percentageVsAverage = Math.round((totalCo2Kg / AVERAGE_WEEKLY_CO2_KG) * 100);

    return {
      totalCo2Kg: parseFloat(totalCo2Kg.toFixed(1)),
      vsIndianAverage,
      percentageVsAverage,
      bestCategory,
      worstCategory,
      streakDays: streak || 1,
      actionsLogged: weeklyEntries.length,
      topActivity: topActivityName || 'No activities',
      weekNumber: storiesLength + 1,
    };
  }, [entries, streak, storiesLength]);

  return { weeklyStats, uniqueLogDays };
}
