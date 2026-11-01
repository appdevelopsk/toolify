/** Browser-only anonymous limits. Server-side paid entitlements must be verified
 * before any subscription, permanent license or cloud/AI feature is enabled. */
export const FREE_SOFTWARE_LIMITS = {
  "csv-cleaner-pro": { maxRows: 1000, maxBytes: 250_000 },
  "json-studio": { maxBytes: 100_000 },
  "text-batch-studio": { maxLines: 5000, maxBytes: 250_000 },
} as const;
export type FreeSoftwareSlug = keyof typeof FREE_SOFTWARE_LIMITS;
export function isWithinBytes(input: string, maxBytes: number): boolean {
  return new TextEncoder().encode(input).byteLength <= maxBytes;
}
