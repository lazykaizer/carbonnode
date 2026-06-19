// ⚠️ CLIENT-SIDE ONLY — Do not import this file in server/ routes.
// DOMPurify requires a DOM environment (browser or JSDOM).
// For server-side input sanitization, use validateTextLength and validateBody
// middleware in server/middleware/validate.ts instead.
import DOMPurify from 'dompurify';

/**
 * Sanitizes user input to prevent XSS attacks.
 * Strips all HTML tags and dangerous content.
 */
export function sanitizeInput(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
}

/**
 * Sanitizes HTML content for safe rendering.
 * Allows basic formatting tags only.
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br', 'p', 'span'],
    ALLOWED_ATTR: [],
  });
}

/**
 * Escapes special characters to prevent injection.
 */
export function escapeForDisplay(text: string): string {
  const escapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
  };

  return text.replace(/[&<>"']/g, (char) => escapeMap[char]);
}
