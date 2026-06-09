import { useTranslations } from "next-intl";

/**
 * 姉妹サイト fxea365（無料MT5自動売買EA）への文脈内クロスプロモCTA。
 * finance カテゴリのツールに表示し、資産運用に関心のある訪問者を高LTVな fxea365 へ送客する。
 *
 * 注意: fxea365 は第三者アフィリではなく自社プロパティなので、`rel="sponsored"` を付けない
 * 通常の follow リンクにする（被リンクのSEO効果を活かすため）。PRラベルも不要。
 */
export function SisterSiteCta() {
  const t = useTranslations("crossPromo");
  return (
    <aside className="mt-10 rounded-xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-900/50 dark:bg-emerald-950/30">
      <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">
        {t("financeCta.title")}
      </p>
      <p className="mt-1 text-sm text-emerald-800/80 dark:text-emerald-300/80">{t("fxea")}</p>
      <a
        href="https://fxea365.com"
        rel="noopener"
        className="mt-3 inline-flex w-fit items-center gap-1 rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
      >
        {t("financeCta.cta")} →
      </a>
    </aside>
  );
}
