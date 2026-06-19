import { describe, it, expect, beforeEach } from 'vitest';
import { useCarbonStore } from '@/stores/carbonStore';
import { useGamificationStore } from '@/stores/gamificationStore';

interface ZustandPersistStore {
  persist: {
    getOptions: () => {
      merge: (persistedState: unknown, currentState: unknown) => unknown;
    };
  };
}

describe('Zustand Stores Unit Tests', () => {
  beforeEach(() => {
    // Reset stores before each test
    useCarbonStore.getState().clearAllEntries();
    useGamificationStore.getState().resetGamification();
  });

  describe('CarbonStore', () => {
    it('should increase totalCo2 correctly when adding entries', () => {
      const store = useCarbonStore.getState();
      expect(store.getTotalMonthlyUsage()).toBe(0);

      // Add a manual entry of 15.5 kg CO₂
      store.addEntry({
        category: 'transport',
        activityName: 'Drove petrol car',
        co2Kg: 15.5,
        source: 'manual',
      });

      // Add another entry of 4.2 kg CO₂
      store.addEntry({
        category: 'food',
        activityName: 'Chicken meal',
        co2Kg: 4.2,
        source: 'manual',
      });

      const updatedStore = useCarbonStore.getState();
      expect(updatedStore.getTotalMonthlyUsage()).toBe(19.7);
    });

    it('should calculate budget percentage correctly including edge cases', () => {
      const store = useCarbonStore.getState();
      
      // Initially 0%
      expect(store.getBudgetPercentage()).toBe(0);

      // Add exactly 150 kg (assuming DEFAULT_CATEGORY_BUDGETS sum is 150)
      store.addEntry({
        category: 'transport',
        activityName: 'Flight',
        co2Kg: 150.0,
        source: 'manual',
      });

      expect(useCarbonStore.getState().getBudgetPercentage()).toBe(100);
    });

    it('should handle removing non-existent entry gracefully', () => {
      const store = useCarbonStore.getState();
      store.addEntry({ category: 'food', activityName: 'Meal', co2Kg: 10, source: 'manual' });
      const entryId = useCarbonStore.getState().entries[0].id;
      
      store.removeEntry('invalid-id'); // Should not throw and not remove
      expect(useCarbonStore.getState().entries.length).toBe(1);

      store.removeEntry(entryId); // Should remove
      expect(useCarbonStore.getState().entries.length).toBe(0);
    });

    it('should handle getTodayEntries, getWeekEntries, getCategoryTotal', () => {
      const store = useCarbonStore.getState();
      store.addEntry({ category: 'energy', activityName: 'AC', co2Kg: 10, source: 'manual' });
      
      expect(useCarbonStore.getState().getTodayEntries().length).toBe(1);
      expect(useCarbonStore.getState().getWeekEntries().length).toBe(1);
      expect(useCarbonStore.getState().getCategoryTotal('energy')).toBe(10);
      expect(useCarbonStore.getState().getCategoryTotal('food')).toBe(0);
    });

    it('should update budget limit', () => {
      const store = useCarbonStore.getState();
      store.updateBudgetLimit('food', 999);
      const foodBudget = useCarbonStore.getState().categoryBudgets.find(b => b.category === 'food');
      expect(foodBudget?.limitKg).toBe(999);
    });

    it('should handle getBudgetPercentage when totalLimit is 0', () => {
      const store = useCarbonStore.getState();
      store.updateBudgetLimit('transport', 0);
      store.updateBudgetLimit('food', 0);
      store.updateBudgetLimit('energy', 0);
      store.updateBudgetLimit('shopping', 0);
      store.updateBudgetLimit('other', 0);
      expect(store.getBudgetPercentage()).toBe(0);
    });

    it('should merge persisted state correctly', () => {
      const storeOptions = (useCarbonStore as unknown as ZustandPersistStore).persist.getOptions();
      const currentState = useCarbonStore.getState();
      const validEntry = {
        id: crypto.randomUUID(),
        category: 'food' as const,
        activityName: 'Test',
        co2Kg: 5,
        date: new Date().toISOString(),
        source: 'manual' as const
      };
      const merged = storeOptions.merge({ entries: [validEntry] }, currentState) as { entries: unknown[] };
      expect(merged.entries).toEqual([validEntry]);
    });
  });

  describe('GamificationStore', () => {
    it('should increment streak on consecutive days', () => {
      const store = useGamificationStore.getState();
      
      // Initialize first day streak
      store.updateStreak();
      expect(useGamificationStore.getState().streak).toBe(1);

      // Manually mock lastActiveDate to yesterday (24 hours ago)
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      useGamificationStore.setState({ lastActiveDate: yesterday });

      // Update streak again
      useGamificationStore.getState().updateStreak();
      expect(useGamificationStore.getState().streak).toBe(2);
    });

    it('should reset streak to 1 if day is skipped', () => {
      // Set initial streak to 5
      useGamificationStore.setState({ streak: 5 });

      // Mock lastActiveDate to 2 days ago (48 hours ago)
      const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
      useGamificationStore.setState({ lastActiveDate: twoDaysAgo });

      // Update streak
      useGamificationStore.getState().updateStreak();
      expect(useGamificationStore.getState().streak).toBe(1);
    });

    it('should return correct user level based on XP thresholds', () => {
      const store = useGamificationStore.getState();
      
      // 0 XP -> Carbon Rookie
      expect(store.getCurrentLevel().name).toBe('Carbon Rookie');

      // 150 XP -> Eco Aware
      useGamificationStore.setState({ xp: 150 });
      expect(useGamificationStore.getState().getCurrentLevel().name).toBe('Eco Aware');

      // 500 XP -> Green Warrior
      useGamificationStore.setState({ xp: 500 });
      expect(useGamificationStore.getState().getCurrentLevel().name).toBe('Green Warrior');

      // 800 XP -> Planet Guardian
      useGamificationStore.setState({ xp: 800 });
      expect(useGamificationStore.getState().getCurrentLevel().name).toBe('Planet Guardian');

      // 1200 XP -> Carbon Legend
      useGamificationStore.setState({ xp: 1200 });
      expect(useGamificationStore.getState().getCurrentLevel().name).toBe('Carbon Legend');
    });

    it('should unlock badge at correct triggers (e.g. sharing ripple card)', () => {
      const store = useGamificationStore.getState();
      const rippleBadge = store.badges.find(b => b.id === 'ripple_maker');
      expect(rippleBadge?.unlocked).toBe(false);

      // Increment share count 3 times
      store.incrementShareCount();
      store.incrementShareCount();
      store.incrementShareCount();

      const updatedStore = useGamificationStore.getState();
      const unlockedBadge = updatedStore.badges.find(b => b.id === 'ripple_maker');
      expect(unlockedBadge?.unlocked).toBe(true);
    });

    it('should handle transport days and story additions', () => {
      const store = useGamificationStore.getState();
      
      store.incrementTransportDays();
      expect(useGamificationStore.getState().publicTransportDays).toBe(1);
      // increment to 5 to trigger metro_week badge
      store.incrementTransportDays();
      store.incrementTransportDays();
      store.incrementTransportDays();
      store.incrementTransportDays();
      expect(useGamificationStore.getState().badges.find(b => b.id === 'metro_week')?.unlocked).toBe(true);

      // add a story
      store.addStory({ weekNumber: 1, story: 'Test', highlightStat: '10kg', weekRating: 'good', nextWeekTip: 'Tip' });
      expect(useGamificationStore.getState().stories.length).toBe(1);
    });

    it('should return correct progress', () => {
      useGamificationStore.setState({ xp: 50 });
      const progress = useGamificationStore.getState().getXpProgress();
      expect(progress.current).toBe(50);
      expect(progress.percentage).toBe(50);
    });

    it('should award XP on a 7-day streak', () => {
      useGamificationStore.setState({ streak: 6 });

      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      useGamificationStore.setState({ lastActiveDate: yesterday });

      useGamificationStore.getState().updateStreak();
      expect(useGamificationStore.getState().streak).toBe(7);
      expect(useGamificationStore.getState().xp).toBe(50); // XP_REWARDS.streak_7day
    });

    it('should unlock story_collector badge after 4 stories', () => {
      const store = useGamificationStore.getState();
      const storyData = { weekNumber: 1, story: 'Test', highlightStat: '10kg', weekRating: 'good' as const, nextWeekTip: 'Tip' };
      
      store.addStory(storyData);
      store.addStory(storyData);
      store.addStory(storyData);
      store.addStory(storyData);

      expect(useGamificationStore.getState().badges.find(b => b.id === 'story_collector')?.unlocked).toBe(true);
    });

    it('should merge persisted state correctly', () => {
      const storeOptions = (useGamificationStore as unknown as ZustandPersistStore).persist.getOptions();
      const currentState = useGamificationStore.getState();
      const validPersisted = {
        xp: 100,
        streak: 5,
        lastActiveDate: new Date().toISOString(),
        badges: [],
        shareCount: 2,
        publicTransportDays: 3,
        stories: [],
      };
      const merged = storeOptions.merge(validPersisted, currentState) as { xp: number; streak: number };
      expect(merged.xp).toBe(100);
      expect(merged.streak).toBe(5);
    });
  });
});
