import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import { listByCategory } from "@/lib/tools/registry";
import { CATEGORY_DESCRIPTIONS } from "@/lib/tools/category-descriptions";
import { CATEGORY_CONFIG } from "@/lib/tools/categories";
import { ToolCard } from "@/components/tools/ToolCard";
import { RelatedServices } from "@/components/affiliates/RelatedServices";
import { buildMetadata } from "@/lib/seo/metadata";
import { siteConfig } from "@/lib/config";
import { LOCALES, type Locale } from "@/lib/i18n/locales";
import type { ToolCategory } from "@/lib/tools/types";

const CATEGORIES = Object.keys(CATEGORY_CONFIG) as ToolCategory[];

export function generateStaticParams() {
  // Only generate hubs for categories that actually have tools (empty hubs are HCU-bait → 404).
  const populated = CATEGORIES.filter((c) => listByCategory(c).length > 0);
  return LOCALES.flatMap((locale) => populated.map((cat) => ({ locale, cat })));
}

function getCopy(cat: string, locale: string) {
  const map = CATEGORY_DESCRIPTIONS[cat as ToolCategory];
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
  const cfg = CATEGORY_CONFIG[cat as ToolCategory];
  return buildMetadata({
    locale: locale as Locale,
    title: copy?.headline ?? `${cfg?.label ?? cat} — ${t("nav.tools")}`,
    description: copy?.body ?? t("site.description"),
    path: `/tools/category/${cat}`,
  });
}

export default async function ToolCategoryPage({
  params,
}: {
  params: Promise<{ locale: string; cat: string }>;
}) {
  const { locale, cat } = await params;
  if (!LOCALES.includes(locale as Locale)) notFound();
  setRequestLocale(locale);
  const cfg = CATEGORY_CONFIG[cat as ToolCategory];
  if (!cfg) notFound();
  const tools = listByCategory(cat);
  if (tools.length === 0) notFound();
  const t = await getTranslations();
  const copy = getCopy(cat, locale);

  // ItemList JSON-LD: marks this hub as a curated catalog of N tools in the category.
  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: copy?.headline ?? `${cfg.label} tools`,
    numberOfItems: tools.length,
    itemListElement: tools.map((m, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${siteConfig.url}/${locale}/tools/${m.slug}`,
      name: t(`tools.${m.slug}.title`),
    })),
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: t("nav.tools"), item: `${siteConfig.url}/${locale}/tools` },
      { "@type": "ListItem", position: 2, name: cfg.label, item: `${siteConfig.url}/${locale}/tools/category/${cat}` },
    ],
  };

  const siblings = CATEGORIES.filter((c) => c !== cat && listByCategory(c).length > 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <nav className="text-sm text-slate-500 dark:text-slate-400">
        <Link href="/tools" className="hover:text-brand-600 hover:underline">
          {t("nav.tools")}
        </Link>
        <span className="mx-2" aria-hidden>
          ›
        </span>
        <span className="text-slate-700 dark:text-slate-300">{cfg.label}</span>
      </nav>

      <div className="mt-4 flex items-center gap-3">
        <span
          className={`flex h-11 w-11 items-center justify-center rounded-xl text-2xl ${cfg.iconBg}`}
          aria-hidden
        >
          {cfg.emoji}
        </span>
        <h1 className="text-3xl font-bold">{copy?.headline ?? `${cfg.label}`}</h1>
      </div>

      {copy && (
        <>
          <p className="mt-4 max-w-3xl text-slate-700 dark:text-slate-300">{copy.body}</p>
          <aside className="mt-4 max-w-3xl rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-700/50 dark:bg-amber-950/30 dark:text-amber-200">
            <strong>Tip:</strong> {copy.tip}
          </aside>
        </>
      )}

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((m) => (
          <ToolCard
            key={m.slug}
            meta={m}
            title={t(`tools.${m.slug}.title`)}
            description={t(`tools.${m.slug}.shortDescription`)}
          />
        ))}
      </div>

      <RelatedServices />

      <section className="mt-12 border-t border-slate-200 pt-6 dark:border-slate-800">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {t("nav.tools")}
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {siblings.map((c) => {
            const sc = CATEGORY_CONFIG[c];
            return (
              <Link
                key={c}
                href={`/tools/category/${c}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-sm transition-colors hover:border-brand-500 hover:bg-brand-50 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                <span aria-hidden>{sc.emoji}</span>
                {sc.label}
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
