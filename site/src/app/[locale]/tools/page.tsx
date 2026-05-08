import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { listTools } from "@/lib/tools/registry";
import { ToolCard } from "@/components/tools/ToolCard";
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

      {Array.from(byCategory.entries()).map(([cat, list]) => (
        <section key={cat} className="mt-10">
          <h2 className="text-xl font-bold capitalize">{cat}</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
      ))}
    </div>
  );
}
