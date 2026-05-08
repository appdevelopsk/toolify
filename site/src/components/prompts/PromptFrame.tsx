"use client";

import { ReactNode, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { AdBanner, AdBelowResult, AdInArticle, AdSticky } from "@/components/ads/AdBanner";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { RelatedServices } from "@/components/affiliates/RelatedServices";
import type { PromptMeta } from "@/lib/prompts/types";

interface Props {
  meta: PromptMeta;
  title: string;
  description: string;
  promptText: string;
  useCase?: { headline: string; items: string[] };
  modelTips?: Record<string, string>;
  exampleHeading?: string;
  exampleOutput?: string;
  article?: { sections: { heading: string; paragraphs: string[] }[] };
  faq: { q: string; a: string }[];
  related: PromptMeta[];
}

export function PromptFrame({
  meta,
  title,
  description,
  promptText,
  useCase,
  modelTips,
  exampleHeading,
  exampleOutput,
  article,
  faq,
  related,
}: Props) {
  const t = useTranslations();
  const locale = useLocale();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(promptText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard API unavailable — fail silently */
    }
  };

  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_300px]">
      <main className="min-w-0">
        <Breadcrumbs
          items={[
            { name: t("nav.home"), href: "/" },
            { name: t("nav.prompts"), href: "/prompts" },
            { name: title },
          ]}
        />
        <h1 className="mt-3 text-3xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">{description}</p>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
          <span>
            <strong className="text-slate-700 dark:text-slate-300">{t("prompt.category")}:</strong> {meta.category}
          </span>
          <span aria-hidden>·</span>
          <span>
            <strong className="text-slate-700 dark:text-slate-300">{t("prompt.recommendedFor")}:</strong>{" "}
            {meta.recommendedFor.join(" / ")}
          </span>
        </div>

        <AdBanner className="mt-4" />

        <section className="mt-6 rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2 dark:border-slate-800">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">prompt</span>
            <button
              type="button"
              onClick={handleCopy}
              className="rounded bg-brand-600 px-3 py-1 text-sm font-medium text-white hover:bg-brand-700 transition"
            >
              {copied ? t("prompt.copied") : t("prompt.copy")}
            </button>
          </div>
          <pre className="overflow-x-auto whitespace-pre-wrap p-4 font-mono text-sm leading-relaxed text-slate-800 dark:text-slate-200">
{promptText}
          </pre>
        </section>

        <AdBelowResult />

        {useCase && (
          <section className="mt-10">
            <h2 className="text-2xl font-bold">{useCase.headline}</h2>
            <ul className="mt-4 list-disc space-y-2 pl-6 text-slate-700 dark:text-slate-300">
              {useCase.items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </section>
        )}

        {modelTips && Object.keys(modelTips).length > 0 && (
          <section className="mt-10">
            <h2 className="text-2xl font-bold">{t("prompt.modelTips")}</h2>
            <dl className="mt-4 space-y-3">
              {Object.entries(modelTips).map(([model, tip]) => (
                <div key={model} className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                  <dt className="text-sm font-semibold uppercase tracking-wider text-brand-600">{model}</dt>
                  <dd className="mt-1 text-slate-700 dark:text-slate-300">{tip}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {exampleOutput && (
          <section className="mt-10">
            <h2 className="text-2xl font-bold">{exampleHeading ?? t("prompt.example")}</h2>
            <pre className="mt-4 overflow-x-auto whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 p-4 font-mono text-sm leading-relaxed text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
{exampleOutput}
            </pre>
          </section>
        )}

        <AdInArticle />

        {article && article.sections.length > 0 && (
          <section className="prose prose-slate mt-10 max-w-none dark:prose-invert">
            <h2>{t("prompt.article")}</h2>
            {article.sections.map((s, i) => (
              <div key={i}>
                <h3>{s.heading}</h3>
                {s.paragraphs.map((p, j) => (
                  <p key={j}>{p}</p>
                ))}
              </div>
            ))}
          </section>
        )}

        {faq.length > 0 && (
          <section className="mt-10">
            <h2 className="text-2xl font-bold">{t("prompt.faq")}</h2>
            <div className="mt-4 divide-y divide-slate-200 rounded-lg border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
              {faq.map((f, i) => (
                <details key={i} className="group p-4">
                  <summary className="cursor-pointer list-none font-medium marker:hidden">
                    <span className="mr-2 text-slate-400 group-open:rotate-90 inline-block transition-transform">›</span>
                    {f.q}
                  </summary>
                  <p className="mt-2 text-slate-600 dark:text-slate-400">{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        <RelatedServices category="finance" />

        {related.length > 0 && (
          <section className="mt-10">
            <h2 className="text-2xl font-bold">{t("prompt.related")}</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={`/prompts/${r.slug}`}
                    className="block rounded-lg border border-slate-200 p-4 hover:border-brand-500 hover:bg-brand-50 dark:border-slate-800 dark:hover:bg-slate-800"
                  >
                    <span className="font-medium">
                      {r.primaryKeyword[locale] ?? r.primaryKeyword.en ?? r.slug}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="mt-10 text-xs text-slate-500 dark:text-slate-400">
          {t("prompt.lastUpdated")}: <time dateTime={meta.updatedAt}>{meta.updatedAt}</time>
        </p>
      </main>
      <aside className="hidden lg:block">
        <AdSticky />
      </aside>
    </div>
  );
}
