import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { listPrompts, listPromptsByCategory } from "@/lib/prompts/registry";
import { PromptCard } from "@/components/prompts/PromptCard";
import { buildMetadata } from "@/lib/seo/metadata";
import { LOCALES, type Locale } from "@/lib/i18n/locales";

const CATEGORIES = ["coding", "writing", "design", "research", "business", "marketing"] as const;

export function generateStaticParams() {
  // Only generate routes for categories that actually have prompts.
  // Empty-category pages are HCU-bait, so we 404 them instead.
  const populated = new Set(listPrompts().map((p) => p.category));
  return LOCALES.flatMap((locale) =>
    CATEGORIES.filter((c) => populated.has(c)).map((cat) => ({ locale, cat })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; cat: string }>;
}): Promise<Metadata> {
  const { locale, cat } = await params;
  const t = await getTranslations({ locale });
  return buildMetadata({
    locale: locale as Locale,
    title: `${cat} — ${t("nav.prompts")}`,
    description: t("site.description"),
    path: `/prompts/category/${cat}`,
  });
}

export default async function PromptCategoryPage({
  params,
}: {
  params: Promise<{ locale: string; cat: string }>;
}) {
  const { locale, cat } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const prompts = listPromptsByCategory(cat);
  if (prompts.length === 0) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold capitalize">
        {cat} {t("nav.prompts")}
      </h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">{t("site.description")}</p>
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
