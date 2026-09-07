import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import type { ToolCategory, ToolMeta } from "@/lib/tools/types";

/**
 * 健康 / 金融ツール向けの信頼性ボックス(YMYL 対応)。
 *
 * 「このツールについて / 医療・金融助言ではない / 出典 / 最終レビュー日」を
 * 1つのカードにまとめて表示する。ToolFrame から category が health | finance の
 * ときだけ描画されるため、223 本の各ツールを触らずに一括適用できる。
 * 文言は messages/<locale>.json の tool.trust.* と既存の
 * tool.medicalDisclaimer / tool.financeDisclaimer を使う。
 */
export function TrustBox({
  category,
  sources,
  updatedAt,
}: {
  category: ToolCategory;
  sources?: ToolMeta["sources"];
  updatedAt: string;
}) {
  const t = useTranslations("tool");
  const locale = useLocale();
  const isFinance = category === "finance";
  const reviewed = new Date(updatedAt);
  const reviewedLabel = Number.isNaN(reviewed.getTime())
    ? updatedAt
    : new Intl.DateTimeFormat(locale, { year: "numeric", month: "long", day: "numeric" }).format(reviewed);

  return (
    <section
      aria-labelledby="trust-box-title"
      className="mt-8 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
    >
      <h2 id="trust-box-title" className="text-base font-semibold text-slate-800 dark:text-slate-200">
        {t("trust.title")}
      </h2>
      <p className="mt-2">{t(isFinance ? "trust.aboutFinance" : "trust.aboutHealth")}</p>
      <p className="mt-2 rounded-md border-l-2 border-amber-400 bg-amber-50 px-3 py-2 text-xs text-slate-700 dark:border-amber-500 dark:bg-amber-950/30 dark:text-slate-300">
        <strong className="font-semibold">{t("trust.notAdvice")}: </strong>
        {t(isFinance ? "financeDisclaimer" : "medicalDisclaimer")}
      </p>
      <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-[auto_1fr] sm:gap-x-4">
        <dt className="font-semibold text-slate-700 dark:text-slate-300">{t("trust.sources")}</dt>
        <dd>
          {sources && sources.length > 0 ? (
            <ul className="list-disc space-y-1 pl-4">
              {sources.map((s) => (
                <li key={s.url}>
                  <a href={s.url} rel="nofollow noopener" target="_blank" className="text-brand-600 hover:underline">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <span>{t("trust.noSources")}</span>
          )}
        </dd>
        <dt className="font-semibold text-slate-700 dark:text-slate-300">{t("trust.lastReviewed")}</dt>
        <dd>
          <time dateTime={updatedAt}>{reviewedLabel}</time>
        </dd>
      </dl>
      <p className="mt-3 text-xs">
        <Link href="/about" className="text-brand-600 hover:underline">
          {t("methodologyLink")}
        </Link>
      </p>
    </section>
  );
}
