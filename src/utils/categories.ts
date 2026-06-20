/** Category labels, icons, and colour mappings for the 5 carbon categories. */
import type { CarbonCategory, CategoryBudget } from '@/types';

export const CATEGORY_LABELS: Record<CarbonCategory, string> = {
  transport: 'Transport',
  food: 'Food & Dining',
  energy: 'Energy',
  shopping: 'Shopping',
  other: 'Other',
};

export const CATEGORY_ICONS: Record<CarbonCategory, string> = {
  transport: '🚗',
  food: '🍽️',
  energy: '⚡',
  shopping: '🛍️',
  other: '📦',
};

export const CATEGORY_COLORS: Record<CarbonCategory, string> = {
  transport: '#3b82f6',
  food: '#f59e0b',
  energy: '#8b5cf6',
  shopping: '#ec4899',
  other: '#6b7280',
};

export const DEFAULT_CATEGORY_BUDGETS: CategoryBudget[] = [
  { category: 'transport', limitKg: 50, usedKg: 0 },
  { category: 'food', limitKg: 40, usedKg: 0 },
  { category: 'energy', limitKg: 30, usedKg: 0 },
  { category: 'shopping', limitKg: 20, usedKg: 0 },
  { category: 'other', limitKg: 10, usedKg: 0 },
];
