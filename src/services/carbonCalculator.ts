import type { CarbonEntry, CarbonCategory } from '@/types';
import { AVERAGE_INDIAN_DAILY_CO2_KG, AVERAGE_INDIAN_MONTHLY_CO2_KG } from '@/utils/constants';

/**
 * Calculates the total CO₂ from a list of entries.
 */
export function calculateTotalCo2(entries: CarbonEntry[]): number {
  return entries.reduce((sum, entry) => sum + entry.co2Kg, 0);
}

/**
 * Groups entries by category and sums their CO₂.
 */
export function calculateCategoryTotals(
  entries: CarbonEntry[]
): Record<CarbonCategory, number> {
  const totals: Record<CarbonCategory, number> = {
    transport: 0,
    food: 0,
    energy: 0,
    shopping: 0,
    other: 0,
  };

  for (const entry of entries) {
    totals[entry.category] += entry.co2Kg;
  }

  return totals;
}

/**
 * Calculates savings compared to the Indian daily average.
 * Positive = saved, Negative = over average.
 */
export function calculateDailySavings(dailyCo2Kg: number): number {
  return AVERAGE_INDIAN_DAILY_CO2_KG - dailyCo2Kg;
}

/**
 * Calculates savings compared to the Indian monthly average.
 */
export function calculateMonthlySavings(monthlyCo2Kg: number): number {
  return AVERAGE_INDIAN_MONTHLY_CO2_KG - monthlyCo2Kg;
}

/**
 * Scales individual savings to a community size.
 */
export function calculateRippleImpact(
  individualSavingsKg: number,
  communitySize: number
): number {
  return Math.max(0, individualSavingsKg * communitySize);
}

/**
 * Determines the world visual state based on budget percentage.
 */
export function getWorldStateFromBudget(budgetPercentage: number): string {
  if (budgetPercentage <= 30) return 'pristine';
  if (budgetPercentage <= 60) return 'good';
  if (budgetPercentage <= 85) return 'warning';
  return 'danger';
}

/**
 * Returns a contextual suggestion based on current carbon state.
 */
export function getActionableSuggestion(
  topCategory: CarbonCategory,
  budgetPercentage: number,
  seed: number
): string {
  const suggestions: Record<CarbonCategory, string[]> = {
    transport: [
      'Try carpooling or public transport for your next commute.',
      'Consider cycling for short distances under 5 km.',
      'Combine multiple errands into one trip to reduce driving.',
    ],
    food: [
      'Try a plant-based meal today — it can cut food emissions by 50%.',
      'Cook at home instead of ordering delivery to reduce packaging waste.',
      'Choose local and seasonal produce for lower transport emissions.',
    ],
    energy: [
      'Switch off appliances when not in use to save energy.',
      'Use natural light during the day instead of electric lighting.',
      'Set your AC to 24°C — each degree lower adds 6% more energy.',
    ],
    shopping: [
      'Ask yourself: "Do I need this, or do I just want it?"',
      'Choose products with minimal packaging.',
      'Buy second-hand when possible — it saves manufacturing emissions.',
    ],
    other: [
      'Every small action adds up — keep tracking!',
      'Share your progress with friends to multiply your impact.',
      'Set a weekly carbon goal and try to beat it.',
    ],
  };

  const categoryTips = suggestions[topCategory];
  const index = seed % categoryTips.length;

  if (budgetPercentage > 85) {
    return `⚠️ You're over 85% of your budget! ${categoryTips[index]}`;
  }

  return `💡 ${categoryTips[index]}`;
}
