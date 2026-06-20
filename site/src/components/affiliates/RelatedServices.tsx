import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { getFeaturedOffers, getOffersFor, POLICY } from "@/lib/affiliates/catalog";
import type { OfferCategory } from "@/lib/affiliates/types";

interface Props {
  /** カテゴリ別オファー（ツール / プロンプト個別ページ用）。featured 指定時は無視。 */
  category?: OfferCategory;
  /** カテゴリ非依存の横断おすすめ（トップ / 一覧ページ用）。category より優先。 */
  featured?: boolean;
  /** Override visibility: `true` shows pending offers in disabled state for QA. */
  showPending?: boolean;
}

/**
 * カテゴリ別のアフィリエイトオファー一覧。
 * オファーがない場合は何も描画しない（HCU上の負担になるため）。
 *
 * 各カードに「PR」ラベル + フッターから /disclosure へのリンクを担保し、
 * 景表法ステマ規制・特商法・Google AdSense ポリシーに対応する。
 */
export function RelatedServices({ category, featured = false, showPending = false }: Props) {
  const t = useTranslations();
  const locale = useLocale();
  const offers = featured
    ? getFeaturedOffers(locale)
    : category
      ? getOffersFor(category, locale, { includePending: showPending })
      : [];

  if (offers.length === 0) return null;

  const disclosureLabel = POLICY.disclosureLabel[locale] ?? POLICY.disclosureLabel.en ?? "Sponsored";

  return (
    <section className="mt-10" aria-labelledby="related-services-heading">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 id="related-services-heading" className="text-2xl font-bold">
          {t("affiliate.heading")}
        </h2>
        <Link href="/disclosure" className="text-xs text-slate-600 underline-offset-2 hover:underline dark:text-slate-400">
          {t("affiliate.disclosureLink")}
        </Link>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {offers.map((o) => {
          const name = o.name[locale] ?? o.name.en ?? o.id;
          const desc = o.description[locale] ?? o.description.en ?? "";
          const cta = o.cta?.[locale] ?? o.cta?.en ?? t("affiliate.defaultCta");
          const href = o.url[locale] ?? o.url.default ?? "#";
          const isPending = Boolean(o.pending);

          return (
            <li key={o.id}>
              <article
                className={
                  "flex h-full flex-col rounded-lg border p-4 transition-colors " +
                  (isPending
                    ? "cursor-not-allowed border-dashed border-slate-300 bg-slate-50 opacity-70 dark:border-slate-700 dark:bg-slate-900/40"
                    : "border-slate-200 bg-white hover:border-brand-500 hover:bg-brand-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800")
                }
              >
                <header className="mb-2 flex items-start gap-2">
                  {o.badge && (
                    <span aria-hidden className="text-xl leading-none">
                      {o.badge}
                    </span>
                  )}
                  <h3 className="flex-1 text-base font-semibold">{name}</h3>
                  <span
                    className="rounded-sm bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-700 dark:bg-slate-700 dark:text-slate-200"
                    aria-label={disclosureLabel}
                  >
                    {disclosureLabel}
                  </span>
                </header>
                <p className="flex-1 text-sm text-slate-600 dark:text-slate-400">{desc}</p>
                {isPending ? (
                  <span className="mt-3 inline-block text-xs italic text-slate-600 dark:text-slate-400">
                    {t("affiliate.pending")}
                  </span>
                ) : (
                  <a
                    href={href}
                    target="_blank"
                    rel="sponsored noopener noreferrer"
                    className="mt-3 inline-flex w-fit items-center gap-1 text-sm font-medium text-brand-600 hover:underline"
                  >
                    {cta} →
                  </a>
                )}
              </article>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
