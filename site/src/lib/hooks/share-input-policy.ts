/**
 * Baseline exclusions for automatic share URLs. URL query values can appear in
 * browser history, copied links, server requests and referrer metadata.
 * This is defense in depth, not a guarantee that all remaining inputs are non-PII.
 */
const EXCLUDED_TYPES = new Set([
  "file", "button", "submit", "reset", "image", "password", "hidden",
  "email", "tel",
]);

const SENSITIVE_AUTOCOMPLETE = /^(?:name|honorific-prefix|given-name|additional-name|family-name|honorific-suffix|nickname|username|new-password|current-password|one-time-code|organization-title|organization|street-address|address-line[1-3]|address-level[1-4]|country|country-name|postal-code|cc-.+|transaction-.+|bday(?:-.+)?|sex|tel(?:-.+)?|email|impp|url|photo)$/;

export function isShareableInputType(type: string): boolean {
  return !EXCLUDED_TYPES.has(type.toLowerCase());
}

/** Exclude explicitly sensitive/autofilled fields and opt-out controls. */
export function isShareableField(
  type: string,
  autocomplete = "",
  privateField = false,
): boolean {
  if (privateField || !isShareableInputType(type)) return false;
  const tokens = autocomplete.toLowerCase().trim().split(/\s+/);
  return !tokens.some((token) => SENSITIVE_AUTOCOMPLETE.test(token));
}

export function isSharePayloadWithinLimit(encoded: string, limit: number): boolean {
  return limit > 0 && encoded.length <= limit;
}
