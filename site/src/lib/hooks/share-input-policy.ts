/**
 * Browsers keep these field types for internal/sensitive values. Never put their
 * contents into a URL, including an auto-generated result-sharing URL.
 */
const EXCLUDED_TYPES = new Set([
  "file", "button", "submit", "reset", "image", "password", "hidden",
]);

export function isShareableInputType(type: string): boolean {
  return !EXCLUDED_TYPES.has(type.toLowerCase());
}

export function isSharePayloadWithinLimit(encoded: string, limit: number): boolean {
  return limit > 0 && encoded.length <= limit;
}
