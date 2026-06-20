/** User level definitions and XP reward values for the gamification system. */
import type { UserLevel } from '@/types';

export const XP_REWARDS = {
  daily_log: 10,
  receipt_scan: 15,
  under_budget: 25,
  streak_7day: 50,
  story_collector: 30,
} as const;

export const USER_LEVELS: UserLevel[] = [
  { name: 'Carbon Rookie', emoji: '🌱', minXp: 0, maxXp: 100 },
  { name: 'Eco Aware', emoji: '🌿', minXp: 101, maxXp: 300 },
  { name: 'Green Warrior', emoji: '🌳', minXp: 301, maxXp: 600 },
  { name: 'Planet Guardian', emoji: '🌍', minXp: 601, maxXp: 1000 },
  { name: 'Carbon Legend', emoji: '⚡', minXp: 1001, maxXp: Infinity },
];
