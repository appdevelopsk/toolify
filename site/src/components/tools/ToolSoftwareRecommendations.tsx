"use client";

import { Link } from "@/lib/i18n/navigation";
import { trackSoftwareClick } from "@/lib/analytics/events";
import { AVAILABLE_SOFTWARE } from "@/lib/software/catalog";
import { softwareCopy } from "@/lib/software/copy";

/**
 * Intent-based recommendations only: never promote planned products as usable.
 * Product inventory is sourced from the live software catalog.
 */
export const SOFTWARE_RECOMMENDATIONS: Readonly<Record<string, readonly string[]>> = {
  "csv-json-converter": ["csv-cleaner-pro", "json-studio"],
  "json-formatter": ["json-studio"],
  "json-to-yaml-converter": ["json-studio"],
  "duplicate-line-remover": ["text-batch-studio"],
  "text-sorter": ["text-batch-studio"],
  "text-replace": ["text-batch-studio"],
  "word-counter": ["text-batch-studio"],
  "reverse-text-generator": ["text-batch-studio"],
};

export function ToolSoftwareRecommendations({ slug, locale }: { slug: string; locale: string }) {
  const recommended = SOFTWARE_RECOMMENDATIONS[slug] ?? [];
  const products = recommended
    .map((target) => AVAILABLE_SOFTWARE.find((p) => p.slug === target))
    .filter((product): product is (typeof AVAILABLE_SOFTWARE)[number] => Boolean(product));
  if (!products.length) return null;
  const copy = softwareCopy(locale);
  return (
    <section className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900" aria-label={copy.title}>
      <h2 className="font-semibold">{copy.title}</h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{copy.privacy}</p>
      <ul className="mt-3 flex flex-wrap gap-3">
        {products.map((product) => (
          <li key={product.slug}>
            <Link
              href={`/software/${product.slug}`}
              prefetch={false}
              onClick={() => trackSoftwareClick({ tool: slug, locale, destination: product.slug })}
              className="inline-flex min-h-11 items-center rounded-lg border border-brand-600 px-3 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-brand-300 dark:hover:bg-slate-800"
            >
              {copy.open}: {product.name}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
