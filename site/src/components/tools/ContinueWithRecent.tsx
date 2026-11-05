"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRecent } from "@/lib/recent";
import { useSearchIndex } from "@/lib/search/useSearchIndex";
import { RelatedToolLink } from "./RelatedToolLink";

/**
 * Offers a contextual return path after completing a tool.
 * This is intentionally shown only to returning visitors and does not store inputs.
 * Reuses the existing recent-slug store and lazily fetched localized search index.
 */
export function ContinueWithRecent({ currentSlug, category }: { currentSlug: string; category: string }) {
  const locale = useLocale();
  const t = useTranslations("tool");
  const recent = useRecent();
  const alternatives = recent.filter((slug) => slug !== currentSlug).slice(0, 3);
  const index = useSearchIndex(locale, alternatives.length > 0);

  if (!index || alternatives.length === 0) return null;
  const bySlug = new Map(index.map((item) => [item.slug, item]));
  const items = alternatives.map((slug) => bySlug.get(slug)).filter((item) => item !== undefined);
  if (items.length === 0) return null;

  return (
    <section className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60" aria-label={t("recent")}>
      <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">🕘 {t("recent")}</h2>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {items.map((item) => (
          <li key={item.slug}>
            <RelatedToolLink
              from={currentSlug}
              to={item.slug}
              locale={locale}
              category={category}
              className="flex min-h-11 items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-brand-700 hover:border-brand-400 hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-slate-700 dark:bg-slate-950 dark:text-brand-400 dark:hover:bg-slate-800"
            >
              {item.title}
              <span className="ml-auto pl-2" aria-hidden="true">→</span>
            </RelatedToolLink>
          </li>
        ))}
      </ul>
    </section>
  );
}
