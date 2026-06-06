import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { buildMetadata } from "@/lib/seo/metadata";
import { getTool } from "@/lib/tools/registry";
import { ToolCard } from "@/components/tools/ToolCard";
import { siteConfig } from "@/lib/config";
import type { Locale } from "@/lib/i18n/locales";
import type { ToolMeta } from "@/lib/tools/types";

// Pregnancy & fertility cluster, in journey order: trying to conceive → conception → tracking.
const CLUSTER = ["ovulation-calculator", "due-date-calculator", "pregnancy-week-calculator", "conception-date-calculator"] as const;
const STEP_KEY: Record<string, string> = {
  "ovulation-calculator": "ovulation",
  "due-date-calculator": "dueDate",
  "pregnancy-week-calculator": "pregnancyWeek",
  "conception-date-calculator": "conception",
};
const SOURCES = [
  { label: "ACOG — Calculating a Due Date", url: "https://www.acog.org/womens-health/faqs/calculating-a-due-date" },
  { label: "NICHD — Preconception Care", url: "https://www.nichd.nih.gov/health/topics/preconceptioncare" },
];

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return buildMetadata({
    locale: locale as Locale,
    title: t("pregnancy.title"),
    description: t("pregnancy.metaDescription"),
    path: "/pregnancy",
  });
}

export default async function PregnancyHub({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const tools = CLUSTER.map((slug) => getTool(slug)).filter(Boolean) as ToolMeta[];

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: t("pregnancy.title"),
    numberOfItems: tools.length,
    itemListElement: tools.map((m, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${siteConfig.url}/${locale}/tools/${m.slug}`,
      name: t(`tools.${m.slug}.title`),
    })),
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }} />

      <h1 className="text-3xl font-bold">{t("pregnancy.title")}</h1>
      <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-400">{t("pregnancy.intro")}</p>

      <h2 className="mt-10 text-xl font-bold">{t("pregnancy.journeyHeading")}</h2>
      <ol className="mt-4 space-y-6">
        {tools.map((m, i) => (
          <li key={m.slug} className="grid gap-3 sm:grid-cols-[2.5rem_1fr] sm:items-start">
            <span
              aria-hidden
              className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-100 text-sm font-bold text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
            >
              {i + 1}
            </span>
            <div>
              <p className="mb-2 text-sm text-slate-600 dark:text-slate-400">{t(`pregnancy.step.${STEP_KEY[m.slug]}`)}</p>
              <ToolCard
                meta={m}
                title={t(`tools.${m.slug}.title`)}
                description={t(`tools.${m.slug}.shortDescription`)}
              />
            </div>
          </li>
        ))}
      </ol>

      <h2 className="mt-12 text-xl font-bold">{t("pregnancy.aboutHeading")}</h2>
      <p className="mt-3 max-w-2xl text-slate-700 dark:text-slate-300">{t("pregnancy.about")}</p>

      <p className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-200">
        {t("pregnancy.disclaimer")}
      </p>

      <div className="mt-6 text-sm text-slate-500 dark:text-slate-400">
        <span className="font-medium">{t("tool.sources")}:</span>{" "}
        {SOURCES.map((s, i) => (
          <span key={s.url}>
            {i > 0 && " · "}
            <a className="underline hover:text-slate-700 dark:hover:text-slate-200" href={s.url} target="_blank" rel="noopener nofollow">
              {s.label}
            </a>
          </span>
        ))}
      </div>
    </div>
  );
}
