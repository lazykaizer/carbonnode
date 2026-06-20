import { describe, it, expect } from 'vitest';
import {
  validateTextInput,
  validateUrl,
  validateCarbonAmount,
  validateBudgetLimit,
  validateFile,
} from '@/utils/validators';

describe('validators utility', () => {
  describe('validateTextInput', () => {
    it('rejects empty or whitespace-only input', () => {
      expect(validateTextInput('').isValid).toBe(false);
      expect(validateTextInput('   ').isValid).toBe(false);
    });

    it('rejects input that is too short', () => {
      expect(validateTextInput('ab').isValid).toBe(false);
    });

    it('accepts valid inputs', () => {
      const result = validateTextInput('drove 10km');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    it('rejects input that is too long', () => {
      const longText = 'a'.repeat(1001);
      expect(validateTextInput(longText).isValid).toBe(false);
    });
  });

  describe('validateUrl', () => {
    it('rejects empty URL', () => {
      expect(validateUrl('').isValid).toBe(false);
    });

    it('rejects invalid URL format', () => {
      expect(validateUrl('not-a-url').isValid).toBe(false);
    });

    it('rejects non-http/https protocol', () => {
      expect(validateUrl('ftp://example.com').isValid).toBe(false);
    });

    it('accepts valid URLs', () => {
      expect(validateUrl('http://example.com').isValid).toBe(true);
      expect(validateUrl('https://swiggy.com/some/path').isValid).toBe(true);
    });
  });

  describe('validateCarbonAmount', () => {
    it('rejects negative or NaN amounts', () => {
      expect(validateCarbonAmount(-5).isValid).toBe(false);
      expect(validateCarbonAmount(NaN).isValid).toBe(false);
    });

    it('rejects unreasonably large amounts', () => {
      expect(validateCarbonAmount(501).isValid).toBe(false);
    });

    it('accepts valid amounts', () => {
      expect(validateCarbonAmount(0.5).isValid).toBe(true);
      expect(validateCarbonAmount(150).isValid).toBe(true);
    });
  });

  describe('validateBudgetLimit', () => {
    it('rejects zero, negative or NaN limits', () => {
      expect(validateBudgetLimit(0).isValid).toBe(false);
      expect(validateBudgetLimit(-10).isValid).toBe(false);
      expect(validateBudgetLimit(NaN).isValid).toBe(false);
    });

    it('rejects unreasonably large limits', () => {
      expect(validateBudgetLimit(1001).isValid).toBe(false);
    });

    it('accepts valid limits', () => {
      expect(validateBudgetLimit(100).isValid).toBe(true);
      expect(validateBudgetLimit(500).isValid).toBe(true);
    });
  });

  describe('validateFile', () => {
    it('rejects missing file', () => {
      expect(validateFile(null as unknown as File).isValid).toBe(false);
    });

    it('rejects large files', () => {
      const file = { size: 6 * 1024 * 1024, type: 'image/jpeg' } as File;
      expect(validateFile(file).isValid).toBe(false);
    });

    it('rejects invalid file types', () => {
      const file = { size: 1 * 1024 * 1024, type: 'application/pdf' } as File;
      expect(validateFile(file).isValid).toBe(false);
    });

    it('accepts valid files', () => {
      const file = { size: 1 * 1024 * 1024, type: 'image/jpeg' } as File;
      expect(validateFile(file).isValid).toBe(true);
    });
  });
});
