import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { listPrompts } from "@/lib/prompts/registry";
import { PromptCard } from "@/components/prompts/PromptCard";
import { buildMetadata } from "@/lib/seo/metadata";
import { siteConfig } from "@/lib/config";
import { PROMPT_CATEGORY_CONFIG } from "@/lib/prompts/categories";
import { isPromptLocale, PROMPT_LOCALES, type Locale } from "@/lib/i18n/locales";
import type { PromptCategory } from "@/lib/prompts/types";

export function generateStaticParams() {
  return PROMPT_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isPromptLocale(locale)) return {};
  const t = await getTranslations({ locale });
  return buildMetadata({
    locale: locale as Locale,
    title: t("nav.prompts"),
    description: t("site.description"),
    path: "/prompts",
  });
}

export default async function PromptsIndex({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isPromptLocale(locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale });
  const prompts = listPrompts();

  const byCategory = new Map<string, typeof prompts>();
  for (const m of prompts) {
    const list = byCategory.get(m.category) ?? [];
    list.push(m);
    byCategory.set(m.category, list);
  }

  // Use t.raw() for prompt titles/descriptions — they may contain ICU-like
  // {placeholders} that would otherwise fail next-intl's MessageFormat parser.
  const titleOf = (slug: string): string => t.raw(`prompts.${slug}.title`) as string;
  const descOf = (slug: string): string => t.raw(`prompts.${slug}.shortDescription`) as string;

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: t("nav.prompts"),
    numberOfItems: prompts.length,
    itemListElement: prompts.map((m, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${siteConfig.url}/${locale}/prompts/${m.slug}`,
      name: titleOf(m.slug),
    })),
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }} />
      <h1 className="text-3xl font-bold">{t("nav.prompts")}</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">{t("site.description")}</p>

      {[...byCategory.entries()].map(([cat, list]) => {
        const cfg = PROMPT_CATEGORY_CONFIG[cat as PromptCategory];
        return (
          <section key={cat} id={cat} className="mt-10 scroll-mt-20">
            <div className="flex items-center gap-3 border-b border-slate-200 pb-3 dark:border-slate-800">
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-lg text-lg ${cfg.iconBg}`}
                aria-hidden
              >
                {cfg.emoji}
              </span>
              <h2 className="text-xl font-bold">{cfg.label}</h2>
              <span className="ml-auto rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {list.length}
              </span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((m) => (
                <PromptCard
                  key={m.slug}
                  meta={m}
                  title={titleOf(m.slug)}
                  description={descOf(m.slug)}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
