import { describe, it, expect } from 'vitest';
import {
  calculateTotalCo2,
  calculateCategoryTotals,
  calculateDailySavings,
  calculateMonthlySavings,
  calculateRippleImpact,
  getWorldStateFromBudget,
  getActionableSuggestion,
} from '@/services/carbonCalculator';
import type { CarbonEntry } from '@/types';

describe('carbonCalculator service', () => {
  const mockEntries: CarbonEntry[] = [
    { id: '1', category: 'transport', activityName: 'Car ride', co2Kg: 2.5, source: 'manual', date: '2026-06-12T12:00:00Z' },
    { id: '2', category: 'food', activityName: 'Chicken meal', co2Kg: 1.8, source: 'mirror', date: '2026-06-12T13:00:00Z' },
    { id: '3', category: 'energy', activityName: 'AC', co2Kg: 3.2, source: 'receipt', date: '2026-06-12T14:00:00Z' },
  ];

  describe('calculateTotalCo2', () => {
    it('should sum up CO2 values correctly', () => {
      expect(calculateTotalCo2(mockEntries)).toBe(7.5);
    });

    it('should return 0 for empty entries', () => {
      expect(calculateTotalCo2([])).toBe(0);
    });
  });

  describe('calculateCategoryTotals', () => {
    it('should group emissions by category correctly', () => {
      const totals = calculateCategoryTotals(mockEntries);
      expect(totals.transport).toBe(2.5);
      expect(totals.food).toBe(1.8);
      expect(totals.energy).toBe(3.2);
      expect(totals.shopping).toBe(0);
      expect(totals.other).toBe(0);
    });
  });

  describe('calculateDailySavings', () => {
    it('should compute daily savings relative to Indian average (4.8 kg)', () => {
      expect(calculateDailySavings(2.8)).toBe(2.0); // 4.8 - 2.8 = 2.0 kg saved
      expect(calculateDailySavings(5.8)).toBe(-1.0); // 4.8 - 5.8 = -1.0 kg over
    });
  });

  describe('calculateMonthlySavings', () => {
    it('should compute monthly savings relative to Indian average (150 kg)', () => {
      expect(calculateMonthlySavings(100)).toBe(50);
    });
  });

  describe('calculateRippleImpact', () => {
    it('should scale savings to community size', () => {
      expect(calculateRippleImpact(1.5, 1000)).toBe(1500);
    });

    it('should return 0 if there are no savings', () => {
      expect(calculateRippleImpact(-2, 1000)).toBe(0);
    });
  });

  describe('getWorldStateFromBudget', () => {
    it('should return correct visual state name based on budget used percentage', () => {
      expect(getWorldStateFromBudget(15)).toBe('pristine');
      expect(getWorldStateFromBudget(45)).toBe('good');
      expect(getWorldStateFromBudget(75)).toBe('warning');
      expect(getWorldStateFromBudget(95)).toBe('danger');
    });
  });

  describe('getActionableSuggestion', () => {
    it('returns a suggestion based on category', () => {
      const suggestion = getActionableSuggestion('transport', 50, 0);
      expect(suggestion).toContain('💡');
    });
    it('warns when budget is over 85%', () => {
      const overBudgetSuggestion = getActionableSuggestion('food', 90, 0);
      expect(overBudgetSuggestion).toContain('⚠️');
    });
    it('returns deterministic suggestions based on seed', () => {
      const seed = 42;
      const result1 = getActionableSuggestion('energy', 50, seed);
      const result2 = getActionableSuggestion('energy', 50, seed);
      expect(result1).toBe(result2);
    });
  });
});
