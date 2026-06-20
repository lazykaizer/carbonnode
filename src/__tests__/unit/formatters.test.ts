import { describe, it, expect } from 'vitest';
import {
  formatCo2Kg,
  formatCo2WithUnit,
  formatPercentage,
  formatXp,
  co2ToTrees,
  co2ToCarKm,
  percentOfIndianAverage,
  formatDate,
  formatRelativeTime,
  generateId,
  formatNumber,
  getBudgetColor,
} from '@/utils/formatters';

describe('formatters utility', () => {
  describe('formatCo2Kg', () => {
    it('formats very small amounts', () => {
      expect(formatCo2Kg(0.005)).toBe('< 0.01 kg');
    });

    it('formats fractional amounts with two decimals', () => {
      expect(formatCo2Kg(0.456)).toBe('0.46 kg');
    });

    it('formats single digit amounts with one decimal', () => {
      expect(formatCo2Kg(5.62)).toBe('5.6 kg');
    });

    it('rounds larger amounts', () => {
      expect(formatCo2Kg(12.7)).toBe('13 kg');
      expect(formatCo2Kg(125)).toBe('125 kg');
    });
  });

  describe('formatCo2WithUnit', () => {
    it('formats in kg if below 1000', () => {
      expect(formatCo2WithUnit(450)).toBe('450 kg');
    });

    it('formats in tons if 1000 or above', () => {
      expect(formatCo2WithUnit(1000)).toBe('1.0 tons');
      expect(formatCo2WithUnit(2500)).toBe('2.5 tons');
    });
  });

  describe('formatPercentage', () => {
    it('formats percentage', () => {
      expect(formatPercentage(55.2)).toBe('55%');
      expect(formatPercentage(120)).toBe('120%');
    });

    it('clamps negative values', () => {
      expect(formatPercentage(-5)).toBe('0%');
    });
  });

  describe('formatXp', () => {
    it('formats small XP as is', () => {
      expect(formatXp(450)).toBe('450 XP');
    });

    it('formats large XP in thousands (k)', () => {
      expect(formatXp(1200)).toBe('1.2k XP');
      expect(formatXp(25000)).toBe('25.0k XP');
    });
  });

  describe('co2ToTrees', () => {
    it('calculates correct trees needed for offset', () => {
      // 22kg CO2 per tree per year
      expect(co2ToTrees(22)).toBe(1);
      expect(co2ToTrees(44)).toBe(2);
      expect(co2ToTrees(10)).toBe(1); // ceil rounds up
    });
  });

  describe('co2ToCarKm', () => {
    it('converts CO2 kg to car km equivalent', () => {
      // 0.171 kg per km (CAR_PETROL_KG_PER_KM)
      expect(co2ToCarKm(2.1)).toBe(12);
      expect(co2ToCarKm(0.21)).toBe(1);
    });
  });

  describe('percentOfIndianAverage', () => {
    it('returns correct percentage relative to Indian average', () => {
      // Average annual is 1800 kg (INDIA_URBAN_ANNUAL_TONS * 1000)
      expect(percentOfIndianAverage(1800)).toBe(100);
      expect(percentOfIndianAverage(900)).toBe(50);
    });
  });

  describe('formatDate', () => {
    it('formats a date string correctly to Indian standard', () => {
      expect(formatDate('2026-06-12')).toContain('2026');
    });
  });

  describe('formatRelativeTime', () => {
    it('formats relative time correctly', () => {
      const now = new Date();
      expect(formatRelativeTime(now.toISOString())).toBe('just now');

      const tenMinsAgo = new Date(now.getTime() - 10 * 60000);
      expect(formatRelativeTime(tenMinsAgo.toISOString())).toBe('10m ago');

      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60000);
      expect(formatRelativeTime(twoHoursAgo.toISOString())).toBe('2h ago');
    });
  });

  describe('generateId', () => {
    it('generates a unique non-empty string ID', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).toBeTruthy();
      expect(id1).not.toBe(id2);
    });
  });

  describe('formatNumber', () => {
    it('formats number with commas', () => {
      expect(formatNumber(1250000)).toBe('12,50,000'); // Indian style commas
    });
  });

  describe('getBudgetColor', () => {
    it('returns correct color code depending on usage percentage', () => {
      expect(getBudgetColor(50)).toBe('#27ae60');
      expect(getBudgetColor(75)).toBe('#e67e22');
      expect(getBudgetColor(95)).toBe('#c0392b');
    });
  });
});
