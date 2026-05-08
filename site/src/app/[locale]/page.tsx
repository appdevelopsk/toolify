import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { Link } from "@/lib/i18n/navigation";
import { listTools } from "@/lib/tools/registry";
import { listPrompts } from "@/lib/prompts/registry";
import { ToolCard } from "@/components/tools/ToolCard";
import { AdBanner } from "@/components/ads/AdBanner";
import { buildMetadata } from "@/lib/seo/metadata";
import type { Locale } from "@/lib/i18n/locales";

const FEATURED_COUNT = 12;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "site" });
  return buildMetadata({
    locale: locale as Locale,
    title: `${t("name")} — ${t("tagline")}`,
    description: t("description"),
    path: "",
  });
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const allTools = listTools();
  const allPrompts = listPrompts();
  const featured = allTools.slice(0, FEATURED_COUNT);
  const remainingCount = allTools.length - featured.length;

  // Group all tools by category for the secondary navigation block
  const byCategory = new Map<string, number>();
  for (const m of allTools) {
    byCategory.set(m.category, (byCategory.get(m.category) ?? 0) + 1);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <section className="text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{t("home.heading")}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-slate-600 dark:text-slate-400">{t("home.subheading")}</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/tools"
            className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            {t("home.browseAll")} →
          </Link>
        </div>
      </section>

      <AdBanner className="mt-8" />

      <section className="mt-12">
        <div className="flex items-baseline justify-between">
          <h2 className="text-2xl font-bold">{t("home.popular")}</h2>
          <Link href="/tools" className="text-sm text-brand-600 hover:underline">
            {remainingCount > 0 ? t("home.morePlus", { n: remainingCount }) : t("home.browseAll")} →
          </Link>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((m) => (
            <ToolCard
              key={m.slug}
              meta={m}
              title={t(`tools.${m.slug}.title`)}
              description={t(`tools.${m.slug}.shortDescription`)}
            />
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold">{t("home.byCategory")}</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from(byCategory.entries())
            .sort((a, b) => b[1] - a[1])
            .map(([cat, count]) => (
              <Link
                key={cat}
                href="/tools"
                className="rounded-lg border border-slate-200 p-4 hover:border-brand-500 hover:bg-brand-50 dark:border-slate-800 dark:hover:bg-slate-800"
              >
                <div className="text-sm font-medium capitalize">{cat}</div>
                <div className="text-xs text-slate-500">{t("home.toolsCount", { n: count })}</div>
              </Link>
            ))}
        </div>
      </section>

      {/* AI prompts section — separate vertical, different SEO surface */}
      {allPrompts.length > 0 && (
        <section className="mt-12">
          <div className="flex items-baseline justify-between">
            <h2 className="text-2xl font-bold">{t("nav.prompts")}</h2>
            <Link href="/prompts" className="text-sm text-brand-600 hover:underline">
              {t("home.browseAll")} →
            </Link>
          </div>
          <ul className="mt-4 grid gap-x-4 gap-y-1 text-sm sm:grid-cols-2 lg:grid-cols-3">
            {allPrompts.map((m) => (
              <li key={m.slug}>
                <Link
                  href={`/prompts/${m.slug}`}
                  className="text-slate-700 hover:text-brand-600 hover:underline dark:text-slate-300"
                >
                  {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                  {t.raw(`prompts.${m.slug}.title`) as string}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Full A-Z catalog: every tool reachable in one click from home — accelerates Google crawl
          for newly-deployed pages because home is indexed before category pages are. */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold">{t("home.allTools")}</h2>
        <ul className="mt-4 grid gap-x-4 gap-y-1 text-sm sm:grid-cols-2 lg:grid-cols-3">
          {allTools
            .slice()
            .sort((a, b) => t(`tools.${a.slug}.title`).localeCompare(t(`tools.${b.slug}.title`), locale))
            .map((m) => (
              <li key={m.slug}>
                <Link
                  href={`/tools/${m.slug}`}
                  className="text-slate-700 hover:text-brand-600 hover:underline dark:text-slate-300"
                >
                  {t(`tools.${m.slug}.title`)}
                </Link>
              </li>
            ))}
        </ul>
      </section>
    </div>
  );
}
