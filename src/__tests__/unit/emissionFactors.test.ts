import { describe, it, expect } from 'vitest';
import {
  CAR_PETROL_KG_PER_KM,
  INDIA_URBAN_DAILY_KG,
  CO2_PER_TREE_KG_PER_YEAR,
  getCitedSource,
} from '@/utils/emissionFactors';

describe('Emission Factors and Citations Tests', () => {
  it('verifies standard carbon coefficients match exact cited figures', () => {
    expect(CAR_PETROL_KG_PER_KM).toBe(0.171);
    expect(INDIA_URBAN_DAILY_KG).toBe(4.8);
    expect(CO2_PER_TREE_KG_PER_YEAR).toBe(22);
  });

  it('maps factor keys to their correct cited source names', () => {
    expect(getCitedSource('car')).toBe('UK DEFRA 2023 Conversion Factors');
    expect(getCitedSource('train')).toBe('Indian Railways GHG Inventory 2022');
    expect(getCitedSource('beef')).toBe('Poore & Nemecek 2018 via OurWorldInData');
    expect(getCitedSource('energy')).toBe('CEA India Grid Emission Factor 2023');
    expect(getCitedSource('invalid')).toBe('IPCC 2023');
  });
});
