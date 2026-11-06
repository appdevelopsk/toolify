"use client";

import { Link } from "@/lib/i18n/navigation";
import { trackSoftwareClick } from "@/lib/analytics/events";
import { availableRecommendations } from "@/lib/software/recommendations";
import { softwareCopy } from "@/lib/software/copy";

export function ToolSoftwareRecommendations({ slug, locale }: { slug: string; locale: string }) {
  const products = availableRecommendations(slug);
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
