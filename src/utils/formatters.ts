/** Pure formatting utilities for displaying carbon values, dates, and percentages. No side effects. */
import {
  AVERAGE_INDIAN_ANNUAL_CO2_KG,
  CO2_PER_TREE_KG_PER_YEAR,
  CO2_PER_CAR_KM,
} from './constants';

/**
 * Formats a CO₂ value in kilograms to a human-readable string.
 * @param kg - The CO₂ value in kilograms
 * @returns A formatted string representation
 */
export function formatCo2Kg(kg: number): string {
  if (kg < 0.01) return '< 0.01 kg';
  if (kg < 1) return `${kg.toFixed(2)} kg`;
  if (kg < 10) return `${kg.toFixed(1)} kg`;
  return `${Math.round(kg)} kg`;
}

/**
 * Formats a large CO₂ value with proper unit (kg or tons).
 * @param kg - The CO₂ value in kilograms
 * @returns A formatted string with appropriate units
 */
export function formatCo2WithUnit(kg: number): string {
  if (kg >= 1000) {
    return `${(kg / 1000).toFixed(1)} tons`;
  }
  return formatCo2Kg(kg);
}

/**
 * Formats a percentage value with bounds.
 * @param value - The percentage value to format
 * @returns A clamped and formatted percentage string
 */
export function formatPercentage(value: number): string {
  const clamped = Math.max(0, Math.min(value, 999));
  return `${Math.round(clamped)}%`;
}

/**
 * Formats XP as a readable string.
 * @param xp - The experience points to format
 * @returns A formatted string representing the XP
 */
export function formatXp(xp: number): string {
  if (xp >= 1000) {
    return `${(xp / 1000).toFixed(1)}k XP`;
  }
  return `${xp} XP`;
}

/**
 * Converts CO₂ kg to equivalent number of trees needed for a year.
 * @param co2Kg - The CO₂ value in kilograms
 * @returns The number of trees required to offset
 */
export function co2ToTrees(co2Kg: number): number {
  return Math.ceil(co2Kg / CO2_PER_TREE_KG_PER_YEAR);
}

/**
 * Converts CO₂ kg to equivalent car kilometers.
 * @param co2Kg - The CO₂ value in kilograms
 * @returns The equivalent distance driven in a car in kilometers
 */
export function co2ToCarKm(co2Kg: number): number {
  return Math.round(co2Kg / CO2_PER_CAR_KM);
}

/**
 * Calculates the percentage of the Indian average annual CO₂.
 * @param annualCo2Kg - The annual CO₂ value in kilograms
 * @returns The percentage of the Indian average
 */
export function percentOfIndianAverage(annualCo2Kg: number): number {
  return (annualCo2Kg / AVERAGE_INDIAN_ANNUAL_CO2_KG) * 100;
}

/**
 * Formats a date to a short readable format (e.g., "12 Jun 2026").
 * @param dateString - The date string to format
 * @returns A locally formatted date string
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Formats a date to a relative time string (e.g., "2 hours ago").
 * @param dateString - The date string to evaluate
 * @returns A relative time representation
 */
export function formatRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateString);
}

/**
 * Generates a unique ID string.
 * @returns A unique identifier string
 */
export function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Formats a number with commas for readability.
 * @param num - The number to format
 * @returns A formatted number string
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('en-IN');
}

/**
 * Returns the budget usage color based on percentage used.
 * @param percentUsed - The percentage of budget used
 * @returns A hex color string
 */
export function getBudgetColor(percentUsed: number): string {
  if (percentUsed <= 60) return '#27ae60';
  if (percentUsed <= 85) return '#e67e22';
  return '#c0392b';
}
