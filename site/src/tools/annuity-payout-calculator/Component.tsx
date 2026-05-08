"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

export default function AnnuityPayoutCalculator() {
  const t = useTranslations("tools.annuity-payout-calculator");
  const locale = useLocale();
  const [principal, setPrincipal] = useState("500000");
  const [ratePct, setRatePct] = useState("4");
  const [years, setYears] = useState("25");
  const [frequency, setFrequency] = useState<"monthly" | "annual">("monthly");

  const result = useMemo(() => {
    const P = parseFloat(principal);
    const annualR = parseFloat(ratePct) / 100;
    const Y = parseFloat(years);
    if (!isFinite(P) || P <= 0 || !isFinite(annualR) || annualR < 0 || !isFinite(Y) || Y <= 0) return null;
    const periodsPerYear = frequency === "monthly" ? 12 : 1;
    const r = annualR / periodsPerYear;
    const n = Y * periodsPerYear;
    const payment = r === 0 ? P / n : (P * r) / (1 - Math.pow(1 + r, -n));
    const total = payment * n;
    const totalInterest = total - P;
    const annualPayout = payment * periodsPerYear;
    return { payment, total, totalInterest, annualPayout, n };
  }, [principal, ratePct, years, frequency]);

  const fmt = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }), [locale]);
  const fmt2 = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }), [locale]);

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">{t("input.principal")}</span>
          <input type="number" inputMode="decimal" value={principal} onChange={(e) => setPrincipal(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-mono tabular-nums dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.ratePct")}</span>
          <input type="number" inputMode="decimal" step="0.1" value={ratePct} onChange={(e) => setRatePct(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-mono tabular-nums dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.years")}</span>
          <input type="number" inputMode="decimal" value={years} onChange={(e) => setYears(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-mono tabular-nums dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.frequency")}</span>
          <select value={frequency} onChange={(e) => setFrequency(e.target.value as "monthly" | "annual")}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
            <option value="monthly">{t("freq.monthly")}</option>
            <option value="annual">{t("freq.annual")}</option>
          </select>
        </label>
      </div>

      <div aria-live="polite" className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
        {result ? (
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div className="flex justify-between border-b border-slate-200/60 py-1 sm:col-span-2">
              <dt className="font-medium">{frequency === "monthly" ? t("result.monthlyPayout") : t("result.annualPayout")}</dt>
              <dd className="tabular-nums text-2xl font-bold">{fmt2.format(result.payment)}</dd>
            </div>
            {frequency === "monthly" && (
              <div className="flex justify-between border-b border-slate-200/60 py-1 sm:col-span-2">
                <dt>{t("result.annualPayout")}</dt>
                <dd className="tabular-nums">{fmt.format(result.annualPayout)}</dd>
              </div>
            )}
            <div className="flex justify-between border-b border-slate-200/60 py-1">
              <dt>{t("result.totalPayout")}</dt>
              <dd className="tabular-nums">{fmt.format(result.total)}</dd>
            </div>
            <div className="flex justify-between border-b border-slate-200/60 py-1">
              <dt>{t("result.totalInterest")}</dt>
              <dd className="tabular-nums">{fmt.format(result.totalInterest)}</dd>
            </div>
            <div className="flex justify-between border-b border-slate-200/60 py-1 sm:col-span-2">
              <dt>{t("result.periods")}</dt>
              <dd className="tabular-nums">{result.n}</dd>
            </div>
          </dl>
        ) : <div className="text-sm text-slate-500">{t("empty")}</div>}
      </div>
    </div>
  );
}
