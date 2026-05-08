"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

function projectFinalValue(initial: number, monthlyContribution: number, annualRate: number, expenseRatio: number, years: number): number {
  // Compound monthly. Net rate per month = (return - expense) / 12.
  const months = Math.round(years * 12);
  const netAnnual = annualRate - expenseRatio;
  const monthlyRate = netAnnual / 100 / 12;
  let balance = initial;
  for (let i = 0; i < months; i++) {
    balance = balance * (1 + monthlyRate) + monthlyContribution;
  }
  return balance;
}

export default function InvestmentFeeImpactCalculator() {
  const t = useTranslations("tools.investment-fee-impact-calculator");
  const locale = useLocale();

  const [initial, setInitial] = useState("10000");
  const [monthlyContribution, setMonthlyContribution] = useState("500");
  const [years, setYears] = useState("30");
  const [annualReturn, setAnnualReturn] = useState("7");
  const [expenseRatio, setExpenseRatio] = useState("1.0");

  const result = useMemo(() => {
    const i = parseFloat(initial);
    const m = parseFloat(monthlyContribution);
    const y = parseFloat(years);
    const r = parseFloat(annualReturn);
    const e = parseFloat(expenseRatio);

    if (![i, m, y, r, e].every((v) => Number.isFinite(v) && v >= 0)) return null;
    if (y <= 0) return null;

    const noFee = projectFinalValue(i, m, r, 0, y);
    const withFee = projectFinalValue(i, m, r, e, y);
    const lowFee = projectFinalValue(i, m, r, 0.05, y); // typical low-cost index fund

    const totalContributed = i + m * 12 * y;
    const feesLost = noFee - withFee;
    const lowFeeAlt = noFee - lowFee;
    const grossGains = noFee - totalContributed;
    const feesAsPctOfGains = grossGains > 0 ? (feesLost / grossGains) * 100 : 0;

    return {
      noFee,
      withFee,
      lowFee,
      feesLost,
      lowFeeAlt,
      totalContributed,
      grossGains,
      feesAsPctOfGains,
    };
  }, [initial, monthlyContribution, years, annualReturn, expenseRatio]);

  const currency = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: locale === "ja" ? "JPY" : locale === "ko" ? "KRW" : locale === "zh-CN" || locale === "zh-TW" ? "CNY" : "USD",
    maximumFractionDigits: 0,
  });

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">{t("input.initial")}</span>
          <input type="number" inputMode="decimal" value={initial} onChange={(e) => setInitial(e.target.value)} className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.monthly")}</span>
          <input type="number" inputMode="decimal" value={monthlyContribution} onChange={(e) => setMonthlyContribution(e.target.value)} className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.years")}</span>
          <input type="number" inputMode="decimal" step="0.5" value={years} onChange={(e) => setYears(e.target.value)} className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.annualReturn")}</span>
          <input type="number" inputMode="decimal" step="0.1" value={annualReturn} onChange={(e) => setAnnualReturn(e.target.value)} className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block md:col-span-2">
          <span className="text-sm font-medium">{t("input.expenseRatio")}</span>
          <input type="number" inputMode="decimal" step="0.01" value={expenseRatio} onChange={(e) => setExpenseRatio(e.target.value)} className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
          <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">{t("input.expenseRatioHint")}</span>
        </label>
      </div>

      {result === null ? (
        <p className="rounded bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-900/20 dark:text-amber-200">{t("empty")}</p>
      ) : (
        <div className="space-y-3">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded border border-slate-200 p-3 dark:border-slate-800">
              <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">{t("result.noFee")}</div>
              <div className="mt-1 font-mono text-lg">{currency.format(result.noFee)}</div>
            </div>
            <div className="rounded border border-slate-200 p-3 dark:border-slate-800">
              <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">{t("result.lowFeeIndex")}</div>
              <div className="mt-1 font-mono text-lg">{currency.format(result.lowFee)}</div>
              <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">@ 0.05% ER</div>
            </div>
            <div className="rounded border-2 border-rose-300 bg-rose-50 p-3 dark:border-rose-700 dark:bg-rose-900/20">
              <div className="text-xs uppercase tracking-wider text-rose-700 dark:text-rose-300">{t("result.withFee")}</div>
              <div className="mt-1 font-mono text-lg text-rose-900 dark:text-rose-100">{currency.format(result.withFee)}</div>
              <div className="mt-1 text-xs text-rose-700 dark:text-rose-300">@ {expenseRatio}% ER</div>
            </div>
          </div>

          <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800/50">
            <h3 className="text-sm font-semibold">{t("result.summaryHeading")}</h3>
            <dl className="mt-2 grid gap-2 text-sm md:grid-cols-2">
              <div className="flex justify-between gap-3">
                <dt className="text-slate-600 dark:text-slate-400">{t("result.totalContributed")}</dt>
                <dd className="font-mono">{currency.format(result.totalContributed)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-600 dark:text-slate-400">{t("result.grossGains")}</dt>
                <dd className="font-mono">{currency.format(result.grossGains)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="font-medium text-rose-700 dark:text-rose-300">{t("result.feesLost")}</dt>
                <dd className="font-mono font-semibold text-rose-700 dark:text-rose-300">{currency.format(result.feesLost)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="font-medium">{t("result.feesAsPct")}</dt>
                <dd className="font-mono font-semibold">{result.feesAsPctOfGains.toFixed(1)}%</dd>
              </div>
            </dl>
            <p className="mt-3 rounded bg-emerald-50 p-2 text-sm text-emerald-900 dark:bg-emerald-900/20 dark:text-emerald-100">
              {t("result.lowFeeSavings", { amount: currency.format(result.feesLost - result.lowFeeAlt) })}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
