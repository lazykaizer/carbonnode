import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useDailyTimeline } from '../../../src/hooks/useDailyTimeline';
import { useWeeklyStats } from '../../../src/hooks/useWeeklyStats';
import { useCarbonStore } from '../../../src/stores/carbonStore';

describe('Custom Hooks', () => {
  beforeEach(() => {
    useCarbonStore.getState().clearAllEntries();
  });

  describe('useDailyTimeline', () => {
    it('handles empty state', () => {
      const { result } = renderHook(() => useDailyTimeline());
      expect(result.current.dailyData).toHaveLength(30);
      expect(result.current.dailyData[29].totalCo2).toBe(0);
      expect(result.current.selectedNode).toBe(null);
    });

    it('handles single entry', () => {
      useCarbonStore.getState().addEntry({
        category: 'transport',
        activityName: 'Test',
        co2Kg: 5,
        source: 'manual'
      });
      const { result } = renderHook(() => useDailyTimeline());
      expect(result.current.dailyData).toHaveLength(30);
      expect(result.current.dailyData[29].totalCo2).toBe(5);
    });

    it('handles multiple entries across days', () => {
      useCarbonStore.getState().addEntry({
        category: 'transport',
        activityName: 'Today',
        co2Kg: 5,
        source: 'manual'
      });

      // Add yesterday's entry directly to bypass addEntry's date creation
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      useCarbonStore.setState({
        entries: [
          ...useCarbonStore.getState().entries,
          {
            id: 'old-1',
            category: 'food',
            activityName: 'Yesterday',
            co2Kg: 10,
            date: yesterday.toISOString(),
            source: 'manual'
          }
        ]
      });

      const { result } = renderHook(() => useDailyTimeline());
      expect(result.current.dailyData).toHaveLength(30);
      expect(result.current.dailyData[29].totalCo2).toBe(5); // today
      expect(result.current.dailyData[28].totalCo2).toBe(10); // yesterday
    });

    it('handles single entry under daily budget', () => {
      useCarbonStore.getState().addEntry({
        category: 'transport',
        activityName: 'Test',
        co2Kg: 3,
        source: 'manual'
      });
      const { result } = renderHook(() => useDailyTimeline());
      expect(result.current.dailyData).toHaveLength(30);
      expect(result.current.dailyData[29].totalCo2).toBe(3);
      expect(result.current.dailyData[29].milestones).toContainEqual({ icon: '🏆', label: 'Budget Hero' });
    });

    it('toggles selected day string', () => {
      const { result } = renderHook(() => useDailyTimeline());
      const dayStr = new Date().toDateString();
      
      act(() => {
        result.current.toggleDay(dayStr);
      });
      expect(result.current.selectedNode?.dayStr).toBe(dayStr);
      
      act(() => {
        result.current.toggleDay(dayStr);
      });
      expect(result.current.selectedNode).toBeNull();
    });
  });

  describe('useWeeklyStats', () => {
    it('handles empty state', () => {
      const { result } = renderHook(() => useWeeklyStats());
      expect(result.current.weeklyStats.totalCo2Kg).toBe(0);
      expect(result.current.weeklyStats.topActivity).toBe('No activities');
    });

    it('handles multiple entries', () => {
      useCarbonStore.getState().addEntry({
        category: 'food',
        activityName: 'Burger',
        co2Kg: 15,
        source: 'manual'
      });
      useCarbonStore.getState().addEntry({
        category: 'transport',
        activityName: 'Flight',
        co2Kg: 50,
        source: 'manual'
      });

      const { result } = renderHook(() => useWeeklyStats());
      expect(result.current.weeklyStats.totalCo2Kg).toBe(65);
      expect(result.current.weeklyStats.actionsLogged).toBe(2);
      expect(result.current.weeklyStats.topActivity).toBe('Flight');
      expect(result.current.weeklyStats.worstCategory).toBe('transport');
    });
  });
});
