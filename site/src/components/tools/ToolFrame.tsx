import { ReactNode } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { AdBanner, AdBelowResult, AdInArticle, AdSticky } from "@/components/ads/AdBanner";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { RelatedServices } from "@/components/affiliates/RelatedServices";
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
  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_300px]">
      <main className="min-w-0">
        <Breadcrumbs
          items={[
            { name: t("nav.home"), href: "/" },
            { name: t("nav.tools"), href: "/tools" },
            { name: title },
          ]}
        />
        <h1 className="mt-3 text-3xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">{description}</p>

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
                    <span className="mr-2 text-slate-400 group-open:rotate-90 inline-block transition-transform">›</span>
                    {f.q}
                  </summary>
                  <p className="mt-2 text-slate-600 dark:text-slate-400">{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        <RelatedServices category={meta.category} />

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

        <p className="mt-10 text-xs text-slate-500 dark:text-slate-400">
          {t("tool.lastUpdated")}: <time dateTime={meta.updatedAt}>{meta.updatedAt}</time>
        </p>

        {/* Cross-link to /prompts — single line per page × 120 tools × 6 locales = ~720 inbound links into the prompts vertical. */}
        <p className="mt-2 text-sm">
          <Link href="/prompts" className="text-brand-600 hover:underline">
            {t("tool.tryPrompts")}
          </Link>
        </p>
      </main>
      <aside className="hidden lg:block">
        <AdSticky />
      </aside>
    </div>
  );
}
