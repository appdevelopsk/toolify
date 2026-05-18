"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

export default function PercentErrorCalculator() {
  const t = useTranslations("tools.percent-error-calculator");
  const locale = useLocale();
  const [experimental, setExperimental] = useState("");
  const [theoretical, setTheoretical] = useState("");
  const [absolute, setAbsolute] = useState(false);

  const result = useMemo(() => {
    const e = parseFloat(experimental);
    const th = parseFloat(theoretical);
    if (!isFinite(e) || !isFinite(th)) return null;
    if (th === 0) return { error: "zero" as const };
    const signed = ((e - th) / th) * 100;
    const abs = Math.abs(signed);
    const diff = e - th;
    return { signed, abs, diff, experimental: e, theoretical: th };
  }, [experimental, theoretical]);

  const fmt = useMemo(
    () => new Intl.NumberFormat(locale, { maximumFractionDigits: 6 }),
    [locale]
  );
  const fmtPct = useMemo(
    () => new Intl.NumberFormat(locale, { maximumFractionDigits: 4, signDisplay: "always" }),
    [locale]
  );

  const displayValue = result && result !== null && "signed" in result
    ? (absolute ? result.abs : result.signed)
    : null;

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">{t("input.experimental")}</span>
          <input
            type="number"
            value={experimental}
            onChange={(e) => setExperimental(e.target.value)}
            placeholder={t("input.experimentalPlaceholder")}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900"
          />
          <span className="text-xs text-slate-500">{t("input.experimentalHint")}</span>
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.theoretical")}</span>
          <input
            type="number"
            value={theoretical}
            onChange={(e) => setTheoretical(e.target.value)}
            placeholder={t("input.theoreticalPlaceholder")}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900"
          />
          <span className="text-xs text-slate-500">{t("input.theoreticalHint")}</span>
        </label>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <input
          type="checkbox"
          id="abs-toggle"
          checked={absolute}
          onChange={(e) => setAbsolute(e.target.checked)}
          className="rounded"
        />
        <label htmlFor="abs-toggle" className="text-sm">{t("input.absoluteLabel")}</label>
      </div>

      <div aria-live="polite" className="mt-6 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
        {!result ? (
          <p className="text-center text-slate-400">{t("empty")}</p>
        ) : result.error === "zero" ? (
          <p className="text-center text-red-500">{t("error.zeroTheoretical")}</p>
        ) : (
          <dl className="grid gap-3 text-sm">
            <div className="rounded-lg bg-brand-50 p-4 dark:bg-brand-900/20">
              <dt className="font-medium text-brand-800 dark:text-brand-200">
                {absolute ? t("result.absoluteError") : t("result.percentError")}
              </dt>
              <dd className={`mt-1 text-3xl font-bold tabular-nums ${(result.signed ?? 0) < 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                {displayValue !== null
                  ? (absolute
                      ? `${fmt.format(result.abs)}%`
                      : `${fmtPct.format(result.signed)}%`)
                  : "—"}
              </dd>
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              <div className="rounded border border-slate-200 px-3 py-2 dark:border-slate-700">
                <dt className="text-xs text-slate-500">{t("result.signedError")}</dt>
                <dd className="mt-0.5 font-semibold tabular-nums">{fmtPct.format(result.signed)}%</dd>
              </div>
              <div className="rounded border border-slate-200 px-3 py-2 dark:border-slate-700">
                <dt className="text-xs text-slate-500">{t("result.absoluteErrorVal")}</dt>
                <dd className="mt-0.5 font-semibold tabular-nums">{fmt.format(result.abs)}%</dd>
              </div>
              <div className="rounded border border-slate-200 px-3 py-2 dark:border-slate-700">
                <dt className="text-xs text-slate-500">{t("result.absoluteDiff")}</dt>
                <dd className="mt-0.5 font-semibold tabular-nums">{fmtPct.format(result.diff)}</dd>
              </div>
            </div>

            <div className="rounded bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-800/50 dark:text-slate-400">
              <p>{t("result.formula")}: ({fmt.format(result.experimental)} − {fmt.format(result.theoretical)}) / |{fmt.format(result.theoretical)}| × 100</p>
            </div>
          </dl>
        )}
      </div>
    </div>
  );
}
