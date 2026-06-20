import { describe, it, expect } from 'vitest';
import { sanitizeInput, sanitizeHtml, escapeForDisplay } from '@/utils/sanitize';

describe('XSS Sanitization and Injection Protection Tests', () => {
  it('strips script tags and onload/onerror handlers completely from input text', () => {
    const dangerousInput = '<script>alert("XSS")</script>Hello World';
    expect(sanitizeInput(dangerousInput)).toBe('Hello World');

    const handlerInput = '<img src="x" onerror="alert(1)">Hello';
    expect(sanitizeInput(handlerInput)).toBe('Hello');
  });

  it('allows only safe formatting tags in HTML output and strip script tags', () => {
    const inputWithFormatting = '<strong>Bold Text</strong> and <script>alert("evil")</script>';
    const sanitized = sanitizeHtml(inputWithFormatting);
    expect(sanitized).toContain('<strong>Bold Text</strong>');
    expect(sanitized).not.toContain('<script>');
  });

  it('escapes special HTML entities correctly for display', () => {
    const textToEscape = 'Hello <script> & "world"';
    const escaped = escapeForDisplay(textToEscape);
    expect(escaped).toBe('Hello &lt;script&gt; &amp; &quot;world&quot;');
    expect(escapeForDisplay('abc')).toBe('abc');
  });
});
