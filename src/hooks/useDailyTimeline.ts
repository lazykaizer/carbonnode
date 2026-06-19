import { useState, useMemo } from 'react';
import { useCarbonStore } from '@/stores/carbonStore';
import { INDIA_URBAN_DAILY_KG } from '@/utils/emissionFactors';
import type { CarbonEntry } from '@/types';

export interface DailyTimelineNode {
  date: Date;
  dayStr: string;
  formattedDate: string;
  totalCo2: number;
  entries: CarbonEntry[];
  milestones: { icon: string; label: string }[];
}

/**
 * Provides 30-day carbon timeline data and selected-day state.
 * Extracted from CarbonTimeline.tsx to keep that component under 150 lines.
 * @returns An object containing timeline data and state controls
 */
export function useDailyTimeline() {
  const entries = useCarbonStore((state) => state.entries);
  const [selectedDayStr, setSelectedDayStr] = useState<string | null>(null);

  const dailyData = useMemo<DailyTimelineNode[]>(() => {
    // Group all entries by calendar day string
    const groups: Record<string, CarbonEntry[]> = {};
    for (const e of entries) {
      const dayStr = new Date(e.date).toDateString();
      if (!groups[dayStr]) groups[dayStr] = [];
      groups[dayStr].push(e);
    }

    // Find chronological order to flag 'First Entry' milestone
    const sortedLoggedDays = Object.keys(groups).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
    );

    const result: DailyTimelineNode[] = [];
    const now = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayStr = date.toDateString();
      const dayEntries = groups[dayStr] || [];
      const totalCo2 = dayEntries.reduce((sum, e) => sum + e.co2Kg, 0);

      const milestones: { icon: string; label: string }[] = [];

      if (sortedLoggedDays[0] === dayStr && dayEntries.length > 0) {
        milestones.push({ icon: '🌱', label: 'First Entry' });
      }
      if (dayEntries.length > 0 && totalCo2 <= INDIA_URBAN_DAILY_KG) {
        milestones.push({ icon: '🏆', label: 'Budget Hero' });
      }

      result.push({
        date,
        dayStr,
        formattedDate: date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        totalCo2: parseFloat(totalCo2.toFixed(1)),
        entries: dayEntries,
        milestones,
      });
    }

    return result;
  }, [entries]);

  const selectedNode = useMemo(
    () => dailyData.find((d) => d.dayStr === selectedDayStr) ?? null,
    [dailyData, selectedDayStr]
  );

  const maxVal = useMemo(() => {
    const maxCo2 = Math.max(...dailyData.map((d) => d.totalCo2), 10);
    return Math.ceil(maxCo2 * 1.2);
  }, [dailyData]);

  const budgetLinePercentage = (INDIA_URBAN_DAILY_KG / maxVal) * 100;

  const toggleDay = (dayStr: string) => {
    setSelectedDayStr((prev) => (prev === dayStr ? null : dayStr));
  };

  return { dailyData, selectedNode, maxVal, budgetLinePercentage, toggleDay };
}
