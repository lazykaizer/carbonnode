import { describe, it, expect } from 'vitest';
import {
  CarbonEntrySchema,
  BudgetLimitsSchema,
  CarbonMirrorRequestSchema,
  CarbonStoryRequestSchema,
  ReceiptScannerRequestSchema,
  CarbonSubtitlesRequestSchema,
  safeParseEntries,
  safeParseBudget,
} from '../../../src/schemas';

describe('Zod Schemas', () => {
  it('validates valid CarbonEntry', () => {
    const valid = {
      id: crypto.randomUUID(),
      category: 'transport',
      activityName: 'Drive',
      co2Kg: 5,
      date: new Date().toISOString(),
      source: 'manual',
    };
    expect(CarbonEntrySchema.safeParse(valid).success).toBe(true);
  });

  it('fails CarbonEntry with negative co2', () => {
    const invalid = {
      id: crypto.randomUUID(),
      category: 'transport',
      activityName: 'Drive',
      co2Kg: -5,
      date: new Date().toISOString(),
      source: 'manual',
    };
    expect(CarbonEntrySchema.safeParse(invalid).success).toBe(false);
  });

  it('fails CarbonEntry with long notes', () => {
    const invalid = {
      id: crypto.randomUUID(),
      category: 'transport',
      activityName: 'Drive',
      co2Kg: 5,
      date: new Date().toISOString(),
      source: 'manual',
      notes: 'a'.repeat(501),
    };
    expect(CarbonEntrySchema.safeParse(invalid).success).toBe(false);
  });

  it('fails CarbonEntry with wrong source', () => {
    const invalid = {
      id: crypto.randomUUID(),
      category: 'transport',
      activityName: 'Drive',
      co2Kg: 5,
      date: new Date().toISOString(),
      source: 'unsupported',
    };
    expect(CarbonEntrySchema.safeParse(invalid).success).toBe(false);
  });

  it('validates valid BudgetLimits', () => {
    const valid = { transport: 10, food: 10, energy: 10, shopping: 10, other: 10 };
    expect(BudgetLimitsSchema.safeParse(valid).success).toBe(true);
  });

  it('fails BudgetLimits with missing fields', () => {
    const invalid = { transport: 10 };
    expect(BudgetLimitsSchema.safeParse(invalid).success).toBe(false);
  });

  it('validates safeParseEntries default fallback', () => {
    const raw = [{ invalid: 'data' }];
    expect(safeParseEntries(raw)).toEqual([]);
  });

  it('validates safeParseBudget default fallback', () => {
    const raw = { invalid: 'data' };
    const def = safeParseBudget(raw);
    expect(def.transport).toBe(0);
    expect(def.food).toBe(0);
  });

  it('validates safeParseEntries success', () => {
    const valid = [
      {
        id: crypto.randomUUID(),
        category: 'transport',
        activityName: 'Drive',
        co2Kg: 5,
        date: new Date().toISOString(),
        source: 'manual',
      },
    ];
    expect(safeParseEntries(valid)).toEqual(valid);
  });

  it('validates safeParseBudget success', () => {
    const valid = { transport: 10, food: 10, energy: 10, shopping: 10, other: 10 };
    expect(safeParseBudget(valid)).toEqual(valid);
  });

  it('validates valid CarbonMirrorRequestSchema', () => {
    expect(CarbonMirrorRequestSchema.safeParse({ text: 'a' }).success).toBe(true);
    expect(CarbonMirrorRequestSchema.safeParse({ text: 'a'.repeat(501) }).success).toBe(false);
  });

  it('validates ReceiptScannerRequestSchema', () => {
    expect(
      ReceiptScannerRequestSchema.safeParse({ image: 'base64', mimeType: 'image/png' }).success,
    ).toBe(true);
  });

  it('validates CarbonSubtitlesRequestSchema', () => {
    expect(
      CarbonSubtitlesRequestSchema.safeParse({ videoUrl: 'https://youtube.com' }).success,
    ).toBe(true);
    expect(CarbonSubtitlesRequestSchema.safeParse({ videoUrl: 'not-a-url' }).success).toBe(false);
  });

  it('validates CarbonStoryRequestSchema', () => {
    expect(
      CarbonStoryRequestSchema.safeParse({
        totalCo2Kg: 50,
        vsIndianAverage: 'below',
        percentageVsAverage: 20,
        bestCategory: 'food',
        worstCategory: 'transport',
        streakDays: 5,
        actionsLogged: 10,
        topActivity: 'Metro',
        weekNumber: 1,
      }).success,
    ).toBe(true);
    expect(
      CarbonStoryRequestSchema.safeParse({
        totalCo2Kg: -50,
        vsIndianAverage: 'below',
        percentageVsAverage: 20,
        bestCategory: 'food',
        worstCategory: 'transport',
        streakDays: 5,
        actionsLogged: 10,
        topActivity: 'Metro',
        weekNumber: -1,
      }).success,
    ).toBe(false);
  });
});
