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
/** Field identifiers are developer-controlled hints, not a complete PII classifier. */
const SENSITIVE_IDENTIFIER = /(?:^|[-_])(?:password|passwd|secret|api[-_]?key|access[-_]?token|refresh[-_]?token|auth[-_]?token|private[-_]?key|credit[-_]?card|card[-_]?number|cvv|cvc|ssn|social[-_]?security|email|phone|telephone|address|postal[-_]?code)(?:$|[-_])/i;

export function isShareableField(
  type: string,
  autocomplete = "",
  privateField = false,
  identifier = "",
  explicitTextOptIn = false,
): boolean {
  // Free-form inputs are private by default. Opt-in belongs to reviewed tools.
  const freeTextType = ["text", "search", "url", "textarea"].includes(type.toLowerCase());
  if (freeTextType && !explicitTextOptIn) return false;
  const normalizedIdentifier = identifier.replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/\s+/g, "-");
  if (privateField || !isShareableInputType(type) || SENSITIVE_IDENTIFIER.test(normalizedIdentifier)) return false;
  const tokens = autocomplete.toLowerCase().trim().split(/\s+/);
  return !tokens.some((token) => SENSITIVE_AUTOCOMPLETE.test(token));
}

export function isSharePayloadWithinLimit(encoded: string, limit: number): boolean {
  return limit > 0 && encoded.length <= limit;
}

/**
 * URL state is untrusted. Do not coerce arbitrary JSON values into DOM controls.
 * The caller additionally verifies select/radio values against current options.
 */
export function isValidRestoredFieldValue(type: string, value: unknown): value is string | boolean {
  const normalizedType = type.toLowerCase();
  if (normalizedType === "checkbox") return typeof value === "boolean";
  if (normalizedType === "radio") return typeof value === "string" && value.length <= 1800;
  if (typeof value !== "string" || value.length > 1800) return false;
  if (normalizedType === "number" || normalizedType === "range") {
    return value === "" || (value.trim() !== "" && Number.isFinite(Number(value)));
  }
  return true;
}
