import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { z } from 'zod';
import type { Badge, XpAction, CarbonStoryData } from '@/types';
import { XP_REWARDS, USER_LEVELS, DEFAULT_BADGES } from '@/utils/constants';
import { debouncedStorage } from '@/utils/debouncedStorage';

const GamificationStateSchema = z.object({
  xp: z.number().nonnegative(),
  streak: z.number().nonnegative(),
  lastActiveDate: z.string().nullable(),
  badges: z.array(z.any()), // Assuming we accept any array structure for badges here, or define it
  shareCount: z.number().nonnegative(),
  publicTransportDays: z.number().nonnegative(),
  stories: z.array(z.any()),
});

interface GamificationState {
  xp: number;
  streak: number;
  lastActiveDate: string | null;
  badges: Badge[];
  shareCount: number;
  publicTransportDays: number;
  stories: CarbonStoryData[];
  awardXp: (action: XpAction) => void;
  updateStreak: () => void;
  unlockBadge: (badgeId: string) => void;
  incrementShareCount: () => void;
  incrementTransportDays: () => void;
  addStory: (story: Omit<CarbonStoryData, 'id' | 'createdAt'>) => void;
  getCurrentLevel: () => typeof USER_LEVELS[number];
  getXpProgress: () => { current: number; min: number; max: number; percentage: number };
  resetGamification: () => void;
}

function isSameDay(dateStr1: string, dateStr2: string): boolean {
  return new Date(dateStr1).toDateString() === new Date(dateStr2).toDateString();
}

function isYesterday(dateString: string): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return new Date(dateString).toDateString() === yesterday.toDateString();
}

export const useGamificationStore = create<GamificationState>()(
  persist(
    (set, get) => ({
      xp: 0,
      streak: 0,
      lastActiveDate: null,
      badges: [...DEFAULT_BADGES],
      shareCount: 0,
      publicTransportDays: 0,
      stories: [],

      awardXp: (action) => {
        const reward = XP_REWARDS[action];
        set((state) => ({ xp: state.xp + reward }));
      },

      updateStreak: () => {
        const { lastActiveDate } = get();
        const todayStr = new Date().toISOString();

        if (!lastActiveDate) {
          set({ streak: 1, lastActiveDate: todayStr });
          return;
        }

        if (isSameDay(lastActiveDate, todayStr)) {
          return;
        }

        if (isYesterday(lastActiveDate)) {
          set((state) => ({
            streak: state.streak + 1,
            lastActiveDate: todayStr,
          }));

          const newStreak = get().streak;
          if (newStreak > 0 && newStreak % 7 === 0) {
            get().awardXp('streak_7day');
          }
        } else {
          set({ streak: 1, lastActiveDate: todayStr });
        }
      },

      unlockBadge: (badgeId) => {
        set((state) => ({
          badges: state.badges.map((badge) =>
            badge.id === badgeId && !badge.unlocked
              ? { ...badge, unlocked: true, unlockedAt: new Date().toISOString() }
              : badge
          ),
        }));
      },

      incrementShareCount: () => {
        set((state) => {
          const newCount = state.shareCount + 1;
          return { shareCount: newCount };
        });

        if (get().shareCount >= 3) {
          get().unlockBadge('ripple_maker');
        }
      },

      incrementTransportDays: () => {
        set((state) => {
          const newDays = state.publicTransportDays + 1;
          return { publicTransportDays: newDays };
        });

        if (get().publicTransportDays >= 5) {
          get().unlockBadge('metro_week');
        }
      },

      addStory: (story) => {
        const newStory: CarbonStoryData = {
          ...story,
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          stories: [...state.stories, newStory],
        }));

        const currentStoriesCount = get().stories.length;
        if (currentStoriesCount >= 4) {
          const isUnlocked = get().badges.find((b) => b.id === 'story_collector')?.unlocked;
          if (!isUnlocked) {
            get().unlockBadge('story_collector');
            get().awardXp('story_collector');
          }
        }
      },

      getCurrentLevel: () => {
        const { xp } = get();
        const level = USER_LEVELS.find(
          (lvl) => xp >= lvl.minXp && xp <= lvl.maxXp
        );
        return level || USER_LEVELS[0];
      },

      getXpProgress: () => {
        const { xp } = get();
        const currentLevel = get().getCurrentLevel();
        const levelRange = currentLevel.maxXp === Infinity
          ? 500
          : currentLevel.maxXp - currentLevel.minXp;
        const progress = xp - currentLevel.minXp;
        const percentage = Math.min((progress / levelRange) * 100, 100);

        return {
          current: xp,
          min: currentLevel.minXp,
          max: currentLevel.maxXp === Infinity ? currentLevel.minXp + 500 : currentLevel.maxXp,
          percentage,
        };
      },

      resetGamification: () => {
        set({
          xp: 0,
          streak: 0,
          lastActiveDate: null,
          badges: [...DEFAULT_BADGES],
          shareCount: 0,
          publicTransportDays: 0,
          stories: [],
        });
      },
    }),
    {
      name: 'carbon-node-gamification-store',
      version: 1,
      storage: debouncedStorage,
      merge: (persistedState: unknown, currentState) => {
        const result = GamificationStateSchema.safeParse(persistedState);
        if (result.success) {
          return {
            ...currentState,
            ...result.data,
          };
        }
        console.warn('Failed to parse gamification state', result.error);
        return currentState;
      },
    }
  )
);
