/** Input validation functions used by forms and API middleware. Returns structured result objects, never throws. */
import {
  MAX_FILE_SIZE_BYTES,
  ALLOWED_FILE_TYPES,
  MIN_INPUT_LENGTH,
  MAX_INPUT_LENGTH,
  MAX_URL_LENGTH,
} from './constants';

/** Maximum plausible CO₂ per single manual entry (kg). */
export const MAX_REASONABLE_DAILY_KG = 500;

/** Maximum allowed monthly budget limit (kg). */
export const MAX_MONTHLY_BUDGET_KG = 1000;

export interface ValidationResult {
  isValid: boolean;
  error: string | null;
}

/**
 * Validates text input for carbon mirror and similar features.
 * @param input - The text input string to validate
 * @returns A ValidationResult indicating validity and error message
 */
export function validateTextInput(input: string): ValidationResult {
  const trimmed = input.trim();

  if (trimmed.length === 0) {
    return { isValid: false, error: 'Please enter a description of your activity.' };
  }

  if (trimmed.length < MIN_INPUT_LENGTH) {
    return { isValid: false, error: `Input must be at least ${MIN_INPUT_LENGTH} characters.` };
  }

  if (trimmed.length > MAX_INPUT_LENGTH) {
    return { isValid: false, error: `Input must be under ${MAX_INPUT_LENGTH} characters.` };
  }

  return { isValid: true, error: null };
}

/**
 * Validates a URL string for the Carbon Subtitles feature.
 * @param url - The URL string to validate
 * @returns A ValidationResult indicating validity and error message
 */
export function validateUrl(url: string): ValidationResult {
  const trimmed = url.trim();

  if (trimmed.length === 0) {
    return { isValid: false, error: 'Please paste a URL.' };
  }

  if (trimmed.length > MAX_URL_LENGTH) {
    return { isValid: false, error: 'URL is too long.' };
  }

  try {
    const parsed = new URL(trimmed);
    const isValidProtocol = parsed.protocol === 'http:' || parsed.protocol === 'https:';

    if (!isValidProtocol) {
      return { isValid: false, error: 'URL must start with http:// or https://' };
    }

    return { isValid: true, error: null };
  } catch {
    return { isValid: false, error: 'Please enter a valid URL.' };
  }
}

/**
 * Validates an uploaded file for the Receipt Scanner.
 * Checks MIME type (not just extension) and file size.
 * @param file - The File object to validate
 * @returns A ValidationResult indicating validity and error message
 */
export function validateFile(file: File): ValidationResult {
  if (!file) {
    return { isValid: false, error: 'No file selected.' };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    const maxSizeMb = MAX_FILE_SIZE_BYTES / (1024 * 1024);
    return { isValid: false, error: `File must be under ${maxSizeMb}MB.` };
  }

  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return { isValid: false, error: 'Only JPG, PNG, and WebP files are allowed.' };
  }

  return { isValid: true, error: null };
}

/**
 * Validates a carbon amount value.
 * @param amount - The carbon amount to validate
 * @returns A ValidationResult indicating validity and error message
 */
export function validateCarbonAmount(amount: number): ValidationResult {
  if (isNaN(amount) || amount < 0) {
    return { isValid: false, error: 'Carbon amount must be a positive number.' };
  }

  if (amount > MAX_REASONABLE_DAILY_KG) {
    return {
      isValid: false,
      error: `Amount seems too high. Maximum ${MAX_REASONABLE_DAILY_KG} kg per entry.`,
    };
  }

  return { isValid: true, error: null };
}

/**
 * Validates a budget limit value.
 * @param limit - The budget limit to validate
 * @returns A ValidationResult indicating validity and error message
 */
export function validateBudgetLimit(limit: number): ValidationResult {
  if (isNaN(limit) || limit <= 0) {
    return { isValid: false, error: 'Budget limit must be greater than 0.' };
  }

  if (limit > MAX_MONTHLY_BUDGET_KG) {
    return { isValid: false, error: `Budget limit must be under ${MAX_MONTHLY_BUDGET_KG} kg.` };
  }

  return { isValid: true, error: null };
}
