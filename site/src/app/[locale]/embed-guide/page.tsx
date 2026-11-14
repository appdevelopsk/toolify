import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import { LOCALES, isIndexedLocale, type Locale } from "@/lib/i18n/locales";
import { buildMetadata } from "@/lib/seo/metadata";
import { buildPublisherEmbedSnippet, FEATURED_EMBED_SLUGS } from "@/lib/widgets/embed-guide";
import { embedGuideCopyFor } from "@/lib/widgets/embed-guide-copy";
import { CopyEmbedSnippet } from "@/components/tools/CopyEmbedSnippet";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const copy = embedGuideCopyFor(locale);
  return buildMetadata({
    locale: locale as Locale,
    title: copy.metaTitle,
    description: copy.metaDescription,
    path: "/embed-guide",
    // Publisher-intent content is distinct from individual calculator pages.
    // Index only mature en/ja locales; keep the 15 locale pruning policy intact.
    noindex: !isIndexedLocale(locale),
  });
}

export default async function EmbedGuidePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const copy = embedGuideCopyFor(locale);
  const t = await getTranslations({ locale });

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <nav className="text-sm text-brand-700 dark:text-brand-400">
        <Link href="/tools" className="underline">{t("nav.tools")}</Link>
      </nav>
      <h1 className="mt-5 text-3xl font-bold tracking-tight">{copy.heading}</h1>
      <p className="mt-4 text-slate-700 dark:text-slate-300">{copy.intro}</p>

      <section className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-xl font-semibold">{copy.installHeading}</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-6 text-sm leading-7">
          {copy.steps.map((step, index) => <li key={index}>{step}</li>)}
        </ol>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">{copy.iframeFallback}</p>
      </section>

      <section className="mt-10" aria-label={copy.featuredHeading}>
        <h2 className="text-xl font-semibold">{copy.featuredHeading}</h2>
        <div className="mt-4 space-y-6">
          {FEATURED_EMBED_SLUGS.map((slug) => {
            const title = t(`tools.${slug}.title`);
            // The iframe and full-tool link MUST both stay in the reader's locale.
            const snippet = buildPublisherEmbedSnippet(slug, title, locale);
            return (
              <article key={slug} className="rounded-xl border border-slate-200 p-5 dark:border-slate-800">
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{copy.referenceNote}</p>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                  <label htmlFor={`embed-${slug}`} className="block text-sm font-medium">{copy.copyCode}</label>
                  <CopyEmbedSnippet snippet={snippet} slug={slug} />
                </div>
                <textarea
                  id={`embed-${slug}`}
                  readOnly
                  dir="ltr"
                  defaultValue={snippet}
                  rows={4}
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 p-3 font-mono text-xs dark:border-slate-700 dark:bg-slate-950"
                />
                <div className="mt-3 flex flex-wrap gap-4 text-sm">
                  <Link href={`/tools/${slug}`} className="text-brand-700 underline dark:text-brand-400">
                    {copy.fullTool}
                  </Link>
                  <a href={`/embed/${locale}/${slug}`} className="text-brand-700 underline dark:text-brand-400" target="_blank" rel="noopener noreferrer">
                    {copy.previewWidget}
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-10 rounded-xl border border-slate-200 p-5 dark:border-slate-800">
        <h2 className="text-xl font-semibold">{copy.notesHeading}</h2>
        <p className="mt-3 text-sm leading-7">{copy.notesBody}</p>
      </section>
    </main>
  );
}
