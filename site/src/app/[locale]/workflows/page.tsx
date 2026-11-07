import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import { buildMetadata } from "@/lib/seo/metadata";
import { getTool } from "@/lib/tools/registry";
import { WORKFLOWS, workflowCopy } from "@/lib/workflows/catalog";
import type { Locale } from "@/lib/i18n/locales";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const copy = workflowCopy(locale);
  // Existing index policy: only en/ja are indexable; all other locales still work.
  return buildMetadata({
    locale: locale as Locale,
    title: copy.heading,
    description: copy.description,
    path: "/workflows",
  });
}

export default async function WorkflowIndex({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const copy = workflowCopy(locale);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <nav className="text-sm text-slate-600 dark:text-slate-400" aria-label={copy.nav}>
        <Link href="/tools" className="hover:underline">{t("nav.tools")}</Link>
        <span aria-hidden className="mx-2">/</span>
        <span aria-current="page">{copy.nav}</span>
      </nav>
      <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">{copy.heading}</h1>
      <p className="mt-4 max-w-3xl text-slate-600 dark:text-slate-300">{copy.description}</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {WORKFLOWS.map((flow) => (
          <a key={flow.id} href={`#${flow.id}`}
            className="rounded-xl border border-slate-200 bg-white p-4 hover:border-brand-300 hover:shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <span aria-hidden className="text-2xl">{flow.emoji}</span>
            <span className="ml-3 font-semibold">{copy.title(flow.id)}</span>
          </a>
        ))}
      </div>

      <div className="mt-10 space-y-10">
        {WORKFLOWS.map((flow) => (
          <section key={flow.id} id={flow.id} className="scroll-mt-24 rounded-2xl border border-slate-200 p-5 dark:border-slate-800 sm:p-7" aria-labelledby={`heading-${flow.id}`}>
            <div className="flex items-center gap-3">
              <span aria-hidden className="text-3xl">{flow.emoji}</span>
              <h2 id={`heading-${flow.id}`} className="text-xl font-bold">{copy.title(flow.id)}</h2>
            </div>
            <ol className="mt-6 grid gap-3 lg:grid-cols-3">
              {flow.tools.map((slug, index) => {
                const tool = getTool(slug);
                if (!tool) return null;
                return (
                  <li key={slug} className="flex flex-col rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
                    <p className="text-xs font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-400">{copy.step} {index + 1} / {flow.tools.length}</p>
                    <h3 className="mt-2 text-base font-bold">{t(`tools.${slug}.title`)}</h3>
                    <p className="mt-2 flex-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{t(`tools.${slug}.shortDescription`)}</p>
                    <Link href={`/tools/${slug}`} prefetch={false} className="mt-4 inline-flex min-h-11 items-center justify-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                      {copy.open} →
                    </Link>
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
      </div>
      <p className="mt-8 rounded-lg bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-300">{copy.privacy}</p>
    </div>
  );
}
