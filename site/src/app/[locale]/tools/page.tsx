import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { isIndexableIn, listIndexableByCategory, listTools } from "@/lib/tools/registry";
import { Link } from "@/lib/i18n/navigation";
import { ToolCard } from "@/components/tools/ToolCard";
import { FavoritesSection } from "@/components/tools/FavoritesSection";
import { RecentSection } from "@/components/tools/RecentSection";
import { ToolSearch } from "@/components/tools/ToolSearch";
import { buildMetadata } from "@/lib/seo/metadata";
import { siteConfig } from "@/lib/config";
import { CATEGORY_CONFIG, categoryLabel } from "@/lib/tools/categories";
import { isIndexedLocale, type Locale } from "@/lib/i18n/locales";
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
    // 2026-11-03: トップと同じ description・汎用 title「All tools」だったので一覧専用の文言にする。
    title: t("site.toolsTitle"),
    description: t("site.toolsDescription", { count: listTools().length }),
    path: "/tools",
  });
}

export default async function ToolsIndex({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const tools = listTools();
  // Keep the SEO ItemList in sync with noindex and sitemap policy. The visual
  // catalog still shows every tool for users in every language.
  const indexableTools = tools.filter((tool) => isIndexableIn(locale, tool.slug));
  const byCategory = new Map<string, typeof tools>();
  for (const m of tools) {
    const list = byCategory.get(m.category) ?? [];
    list.push(m);
    byCategory.set(m.category, list);
  }

  // 検索とお気に入りの両方が同じ「翻訳済みカード情報」を必要とするため一度だけ作る。
  // クライアントへ渡すので ToolMeta 全体ではなく slug/category だけに絞る。
  const items = tools.map((m) => ({
    slug: m.slug,
    category: m.category,
    title: t(`tools.${m.slug}.title`),
    description: t(`tools.${m.slug}.shortDescription`),
  }));

  // ItemList JSON-LD only recommends crawlable, index-eligible destinations.
  // Non-indexed language/tool combinations remain usable in the visible catalog.
  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: t("nav.tools"),
    numberOfItems: indexableTools.length,
    itemListElement: indexableTools.map((m, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${siteConfig.url}/${locale}/tools/${m.slug}`,
      name: t(`tools.${m.slug}.title`),
    })),
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {indexableTools.length > 0 && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }} />
      )}
      <h1 className="text-3xl font-bold">{t("nav.tools")}</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">{t("site.description")}</p>

      <ToolSearch items={items} />

      {/* Put high-intent destinations above the full catalog so visitors can start a task immediately.
          Use existing translated labels and respect the locale-specific indexing policy. */}
      {(() => {
        const quickSlugs = ["workdays-calculator", "date-calculator", "timezone-converter", "unit-price-calculator"];
        const quickTools = quickSlugs
          .filter((slug) => isIndexableIn(locale, slug))
          .map((slug) => items.find((item) => item.slug === slug))
          .filter((item): item is (typeof items)[number] => Boolean(item));
        return quickTools.length > 0 ? (
          <nav aria-label={t("site.toolsTitle")} className="mt-5 flex flex-wrap gap-2">
            {quickTools.map((item) => (
              <Link key={item.slug} href={`/tools/${item.slug}`}
                className="rounded-full border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:border-brand-500 hover:text-brand-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 dark:border-slate-700 dark:text-slate-200">
                {item.title}
              </Link>
            ))}
          </nav>
        ) : null;
      })()}

      <FavoritesSection items={items} />

      <RecentSection items={items} />

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
                <Link href={isIndexedLocale(locale) && listIndexableByCategory(cat).length > 0 ? `/tools/category/${cat}` : `/tools#${cat}`} className="hover:text-brand-600 hover:underline">
                  {categoryLabel(cat as ToolCategory, locale)}
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
