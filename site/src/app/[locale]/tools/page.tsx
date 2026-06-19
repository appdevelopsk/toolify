import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { listTools } from "@/lib/tools/registry";
import { Link } from "@/lib/i18n/navigation";
import { ToolCard } from "@/components/tools/ToolCard";
import { FavoritesSection } from "@/components/tools/FavoritesSection";
import { RelatedServices } from "@/components/affiliates/RelatedServices";
import { buildMetadata } from "@/lib/seo/metadata";
import { siteConfig } from "@/lib/config";
import { CATEGORY_CONFIG } from "@/lib/tools/categories";
import type { Locale } from "@/lib/i18n/locales";
import type { ToolCategory } from "@/lib/tools/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return buildMetadata({
    locale: locale as Locale,
    title: t("nav.tools"),
    description: t("site.description"),
    path: "/tools",
  });
}

export default async function ToolsIndex({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const tools = listTools();
  const byCategory = new Map<string, typeof tools>();
  for (const m of tools) {
    const list = byCategory.get(m.category) ?? [];
    list.push(m);
    byCategory.set(m.category, list);
  }

  // ItemList JSON-LD: lets Google understand /tools as a structured catalog of 120 items.
  // Crawlers prioritize indexing pages whose containing list is also indexed.
  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: t("nav.tools"),
    numberOfItems: tools.length,
    itemListElement: tools.map((m, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${siteConfig.url}/${locale}/tools/${m.slug}`,
      name: t(`tools.${m.slug}.title`),
    })),
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }} />
      <h1 className="text-3xl font-bold">{t("nav.tools")}</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">{t("site.description")}</p>

      <FavoritesSection
        items={tools.map((m) => ({
          meta: m,
          title: t(`tools.${m.slug}.title`),
          description: t(`tools.${m.slug}.shortDescription`),
        }))}
      />

      <RelatedServices featured />

      {Array.from(byCategory.entries()).map(([cat, list]) => {
        const cfg = CATEGORY_CONFIG[cat as ToolCategory];
        return (
          <section key={cat} id={cat} className="mt-10 scroll-mt-20">
            <div className="flex items-center gap-3 border-b border-slate-200 pb-3 dark:border-slate-800">
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-lg text-lg ${cfg.iconBg}`}
                aria-hidden
              >
                {cfg.emoji}
              </span>
              <h2 className="text-xl font-bold">
                <Link href={`/tools/category/${cat}`} className="hover:text-brand-600 hover:underline">
                  {cfg.label}
                </Link>
              </h2>
              <span className="ml-auto rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {list.length}
              </span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((m) => (
                <ToolCard
                  key={m.slug}
                  meta={m}
                  title={t(`tools.${m.slug}.title`)}
                  description={t(`tools.${m.slug}.shortDescription`)}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
