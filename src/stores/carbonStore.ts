/** Zustand store for carbon entries and budget limits. Persists to localStorage with Zod rehydration — corrupt or tampered data is silently discarded. */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CarbonEntry, CarbonCategory, CategoryBudget } from '@/types';
import { safeParseEntries } from '@/schemas';
import { DEFAULT_CATEGORY_BUDGETS } from '@/utils/constants';
import { generateId } from '@/utils/formatters';
import { debouncedStorage } from '@/utils/debouncedStorage';

interface CarbonState {
  entries: CarbonEntry[];
  categoryBudgets: CategoryBudget[];
  addEntry: (entry: Omit<CarbonEntry, 'id' | 'date'>) => void;
  removeEntry: (entryId: string) => void;
  updateBudgetLimit: (category: CarbonCategory, limitKg: number) => void;
  getTodayEntries: () => CarbonEntry[];
  getWeekEntries: () => CarbonEntry[];
  getMonthEntries: () => CarbonEntry[];
  getCategoryTotal: (category: CarbonCategory) => number;
  getTotalMonthlyUsage: () => number;
  getBudgetPercentage: () => number;
  clearAllEntries: () => void;
}

function isToday(dateString: string): boolean {
  const entryDate = new Date(dateString);
  const today = new Date();
  return entryDate.toDateString() === today.toDateString();
}

function isThisWeek(dateString: string): boolean {
  const entryDate = new Date(dateString);
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);
  return entryDate >= weekStart;
}

function isThisMonth(dateString: string): boolean {
  const entryDate = new Date(dateString);
  const now = new Date();
  return entryDate.getMonth() === now.getMonth() && entryDate.getFullYear() === now.getFullYear();
}

export const useCarbonStore = create<CarbonState>()(
  persist(
    (set, get) => ({
      entries: [],
      categoryBudgets: [...DEFAULT_CATEGORY_BUDGETS],

      addEntry: (entryData) => {
        const newEntry: CarbonEntry = {
          ...entryData,
          id: generateId(),
          date: new Date().toISOString(),
        };
        set((state) => ({
          entries: [newEntry, ...state.entries],
        }));
      },

      removeEntry: (entryId) => {
        set((state) => ({
          entries: state.entries.filter((entry) => entry.id !== entryId),
        }));
      },

      updateBudgetLimit: (category, limitKg) => {
        set((state) => ({
          categoryBudgets: state.categoryBudgets.map((budget) =>
            budget.category === category ? { ...budget, limitKg } : budget,
          ),
        }));
      },

      getTodayEntries: () => {
        return get().entries.filter((entry) => isToday(entry.date));
      },

      getWeekEntries: () => {
        return get().entries.filter((entry) => isThisWeek(entry.date));
      },

      getMonthEntries: () => {
        return get().entries.filter((entry) => isThisMonth(entry.date));
      },

      getCategoryTotal: (category) => {
        const monthEntries = get().getMonthEntries();
        return monthEntries
          .filter((entry) => entry.category === category)
          .reduce((sum, entry) => sum + entry.co2Kg, 0);
      },

      getTotalMonthlyUsage: () => {
        const monthEntries = get().getMonthEntries();
        return monthEntries.reduce((sum, entry) => sum + entry.co2Kg, 0);
      },

      getBudgetPercentage: () => {
        const totalLimit = get().categoryBudgets.reduce((sum, budget) => sum + budget.limitKg, 0);
        if (totalLimit === 0) return 0;
        const totalUsed = get().getTotalMonthlyUsage();
        return (totalUsed / totalLimit) * 100;
      },

      clearAllEntries: () => {
        set({ entries: [] });
      },
    }),
    {
      name: 'carbon-node-carbon-store',
      version: 1,
      storage: debouncedStorage,
      merge: (persistedState: unknown, currentState) => {
        const state = persistedState as Record<string, unknown>;
        return {
          ...currentState,
          ...state,
          entries: safeParseEntries(state?.entries),
        };
      },
    },
  ),
);
