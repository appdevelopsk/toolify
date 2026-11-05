/**
 * Tool-to-software recommendations are a pure mapping so the policy can be
 * checked without importing Next.js client components into a Node test runner.
 * Keep only products that are actually available in the software catalog.
 */
import { AVAILABLE_SOFTWARE } from "@/lib/software/catalog";

export const SOFTWARE_RECOMMENDATIONS: Readonly<Record<string, readonly string[]>> = {
  "csv-json-converter": ["csv-cleaner-pro", "json-studio"],
  "json-formatter": ["json-studio"],
  "json-to-yaml-converter": ["json-studio"],
  "duplicate-line-remover": ["text-batch-studio"],
  "text-sorter": ["text-batch-studio"],
  "text-replace": ["text-batch-studio"],
  "word-counter": ["text-batch-studio"],
  "character-frequency": ["text-batch-studio"],
  "reverse-text-generator": ["text-batch-studio"],
};

export function availableRecommendations(toolSlug: string) {
  const requested = SOFTWARE_RECOMMENDATIONS[toolSlug] ?? [];
  return requested
    .map((slug) => AVAILABLE_SOFTWARE.find((product) => product.slug === slug))
    .filter((product): product is (typeof AVAILABLE_SOFTWARE)[number] => Boolean(product));
}
