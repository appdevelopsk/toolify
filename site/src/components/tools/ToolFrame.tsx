import { ReactNode } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { AdBanner, AdBelowResult, AdInArticle, AdSticky } from "@/components/ads/AdBanner";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { RelatedServices } from "@/components/affiliates/RelatedServices";
import { SisterSiteCta } from "@/components/cross/SisterSiteCta";
import { ShareBar } from "@/components/tools/ShareBar";
import { FavoriteButton } from "@/components/tools/FavoriteButton";
import { siteConfig } from "@/lib/config";
import type { ToolMeta } from "@/lib/tools/types";

interface Props {
  meta: ToolMeta;
  title: string;
  description: string;
  related: ToolMeta[];
  /** ツール本体（Server/Client いずれもOK） */
  children: ReactNode;
  /** ロングフォーム解説（Markdown相当のHTML/JSX） */
  article: ReactNode;
  /** FAQ */
  faq: { q: string; a: string }[];
}

export function ToolFrame({ meta, title, description, related, children, article, faq }: Props) {
  const t = useTranslations();
  const locale = useLocale();
  const pageUrl = `${siteConfig.url}/${locale}/tools/${meta.slug}`;
  const embedUrl = `${siteConfig.url}/embed/${locale}/${meta.slug}`;
  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="min-w-0">
        <Breadcrumbs
          items={[
            { name: t("nav.home"), href: "/" },
            { name: t("nav.tools"), href: "/tools" },
            { name: title },
          ]}
        />
        <div className="mt-3 flex items-start justify-between gap-3">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <FavoriteButton slug={meta.slug} title={title} />
        </div>
        <p className="mt-2 text-slate-600 dark:text-slate-400">{description}</p>

        <ShareBar url={pageUrl} embedUrl={embedUrl} title={title} />

        <AdBanner className="mt-4" />

        <section className="mt-6 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          {children}
        </section>

        <AdBelowResult />

        <section className="prose prose-slate mt-10 max-w-none dark:prose-invert">
          <h2>{t("tool.howItWorks")}</h2>
          {article}
        </section>

        <AdInArticle />

        {faq.length > 0 && (
          <section className="mt-10">
            <h2 className="text-2xl font-bold">{t("tool.faq")}</h2>
            <div className="mt-4 divide-y divide-slate-200 rounded-lg border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
              {faq.map((f, i) => (
                <details key={i} className="group p-4">
                  <summary className="cursor-pointer list-none font-medium marker:hidden">
                    <span className="mr-2 text-slate-500 group-open:rotate-90 inline-block transition-transform">›</span>
                    {f.q}
                  </summary>
                  <p className="mt-2 text-slate-600 dark:text-slate-400">{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        {meta.sources && meta.sources.length > 0 && (
          <section className="mt-10">
            <h2 className="text-2xl font-bold">{t("tool.sources")}</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-600 dark:text-slate-400">
              {meta.sources.map((s) => (
                <li key={s.url}>
                  <a
                    href={s.url}
                    rel="nofollow noopener"
                    target="_blank"
                    className="text-brand-600 hover:underline"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        <RelatedServices category={meta.category} />

        {meta.category === "finance" && <SisterSiteCta />}

        {related.length > 0 && (
          <section className="mt-10">
            <h2 className="text-2xl font-bold">{t("tool.related")}</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={`/tools/${r.slug}`}
                    className="block rounded-lg border border-slate-200 p-4 hover:border-brand-500 hover:bg-brand-50 dark:border-slate-800 dark:hover:bg-slate-800"
                  >
                    <span className="font-medium">{r.primaryKeyword[locale] ?? r.primaryKeyword.en ?? r.slug}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {(meta.category === "finance" || meta.category === "health") && (
          <p className="mt-8 rounded-md border-l-2 border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
            {t(meta.category === "finance" ? "tool.financeDisclaimer" : "tool.medicalDisclaimer")}
          </p>
        )}

      </div>
      <aside className="hidden lg:block">
        <AdSticky />
      </aside>
    </div>
  );
}
