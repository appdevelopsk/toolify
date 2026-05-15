import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { listPrompts, listPromptsByCategory } from "@/lib/prompts/registry";
import { CATEGORY_DESCRIPTIONS } from "@/lib/prompts/category-descriptions";
import { PromptCard } from "@/components/prompts/PromptCard";
import { buildMetadata } from "@/lib/seo/metadata";
import { siteConfig } from "@/lib/config";
import { PROMPT_LOCALES, isPromptLocale, type Locale } from "@/lib/i18n/locales";
import type { PromptCategory } from "@/lib/prompts/types";

const CATEGORIES = ["coding", "writing", "design", "research", "business", "marketing"] as const;

export function generateStaticParams() {
  // Only generate routes for categories that actually have prompts.
  // Empty-category pages are HCU-bait, so we 404 them instead.
  const populated = new Set(listPrompts().map((p) => p.category));
  return PROMPT_LOCALES.flatMap((locale) =>
    CATEGORIES.filter((c) => populated.has(c)).map((cat) => ({ locale, cat })),
  );
}

function getCopy(cat: string, locale: string) {
  const map = CATEGORY_DESCRIPTIONS[cat as PromptCategory];
  return map?.[locale] ?? map?.en;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; cat: string }>;
}): Promise<Metadata> {
  const { locale, cat } = await params;
  const t = await getTranslations({ locale });
  const copy = getCopy(cat, locale);
  return buildMetadata({
    locale: locale as Locale,
    title: copy?.headline ?? `${cat} — ${t("nav.prompts")}`,
    description: copy?.body ?? t("site.description"),
    path: `/prompts/category/${cat}`,
  });
}

export default async function PromptCategoryPage({
  params,
}: {
  params: Promise<{ locale: string; cat: string }>;
}) {
  const { locale, cat } = await params;
  if (!isPromptLocale(locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations();
  const prompts = listPromptsByCategory(cat);
  if (prompts.length === 0) notFound();
  const copy = getCopy(cat, locale);

  // ItemList JSON-LD: tells Google this is a curated catalog of N prompts in this category.
  // Categories that aren't in CATEGORY_DESCRIPTIONS still get a basic ItemList.
  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: copy?.headline ?? `${cat} prompts`,
    numberOfItems: prompts.length,
    itemListElement: prompts.map((m, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${siteConfig.url}/${locale}/prompts/${m.slug}`,
      name: t.raw(`prompts.${m.slug}.title`) as string,
    })),
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
      />
      <h1 className="text-3xl font-bold">{copy?.headline ?? `${cat} ${t("nav.prompts")}`}</h1>
      {copy && (
        <>
          <p className="mt-3 text-slate-700 dark:text-slate-300 max-w-3xl">{copy.body}</p>
          <aside className="mt-4 max-w-3xl rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-700/50 dark:bg-amber-950/30 dark:text-amber-200">
            <strong>Tip:</strong> {copy.tip}
          </aside>
        </>
      )}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {prompts.map((m) => (
          <PromptCard
            key={m.slug}
            meta={m}
            title={t.raw(`prompts.${m.slug}.title`) as string}
            description={t.raw(`prompts.${m.slug}.shortDescription`) as string}
          />
        ))}
      </div>
    </div>
  );
}
