import { parseCsv } from "./processors";

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

/** CSV rows are records, not physical newline-separated lines: quoted cells may contain newlines. */
export function isWithinSoftwareLimits(slug: FreeSoftwareSlug, input: string): boolean {
  const limits = FREE_SOFTWARE_LIMITS[slug];
  if (!isWithinBytes(input, limits.maxBytes)) return false;
  switch (slug) {
    case "csv-cleaner-pro": return parseCsv(input).length <= FREE_SOFTWARE_LIMITS["csv-cleaner-pro"].maxRows;
    case "text-batch-studio": return input.split(/\r\n|\n|\r/).length <= FREE_SOFTWARE_LIMITS["text-batch-studio"].maxLines;
    case "json-studio": return true;
  }
}
