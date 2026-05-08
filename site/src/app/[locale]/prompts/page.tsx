import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { listPrompts } from "@/lib/prompts/registry";
import { PromptCard } from "@/components/prompts/PromptCard";
import { buildMetadata } from "@/lib/seo/metadata";
import { siteConfig } from "@/lib/config";
import type { Locale } from "@/lib/i18n/locales";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
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
  setRequestLocale(locale);
  const t = await getTranslations();
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

      {[...byCategory.entries()].map(([cat, list]) => (
        <section key={cat} className="mt-10">
          <h2 className="text-xl font-semibold capitalize">{cat}</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
      ))}
    </div>
  );
}
