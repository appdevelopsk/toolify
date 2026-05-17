"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

const COMPOUND_OPTIONS = [
  { value: 1, key: "annual" },
  { value: 2, key: "semiannual" },
  { value: 4, key: "quarterly" },
  { value: 12, key: "monthly" },
  { value: 365, key: "daily" },
];

export default function CompoundInterestCalculator() {
  const t = useTranslations("tools.compound-interest-calculator");
  const locale = useLocale();
  const [principal, setPrincipal] = useState("10000");
  const [ratePct, setRatePct] = useState("5");
  const [years, setYears] = useState("10");
  const [compoundsPerYear, setCompoundsPerYear] = useState(12);
  const [monthlyContribution, setMonthlyContribution] = useState("0");

  const result = useMemo(() => {
    const p = parseFloat(principal);
    const r = parseFloat(ratePct) / 100;
    const t = parseFloat(years);
    const m = parseFloat(monthlyContribution);
    if (![p, r, t, m].every(isFinite) || p < 0 || t < 0 || m < 0) return null;
    const n = compoundsPerYear;
    const lumpFv = p * Math.pow(1 + r / n, n * t);
    let contribFv = 0;
    if (m > 0 && r > 0) {
      const monthlyRate = r / 12;
      const months = 12 * t;
      contribFv = m * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
    } else if (m > 0) {
      contribFv = m * 12 * t;
    }
    const finalBalance = lumpFv + contribFv;
    const totalContributed = p + m * 12 * t;
    const totalInterest = finalBalance - totalContributed;
    return { finalBalance, totalContributed, totalInterest };
  }, [principal, ratePct, years, compoundsPerYear, monthlyContribution]);

  const currency = useMemo(
    () => new Intl.NumberFormat(locale, { style: "currency", currency: locale === "ja" ? "JPY" : "USD", maximumFractionDigits: 0 }),
    [locale],
  );

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">{t("input.principal")}</span>
          <input
            inputMode="decimal"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.ratePct")}</span>
          <input
            inputMode="decimal"
            value={ratePct}
            onChange={(e) => setRatePct(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.years")}</span>
          <input
            inputMode="decimal"
            value={years}
            onChange={(e) => setYears(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.compoundsPerYear")}</span>
          <select
            value={compoundsPerYear}
            onChange={(e) => setCompoundsPerYear(parseInt(e.target.value, 10))}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          >
            {COMPOUND_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {t(`compound.${o.key}`)}
              </option>
            ))}
          </select>
        </label>
        <label className="block sm:col-span-2">
          <span className="text-sm font-medium">{t("input.monthlyContribution")}</span>
          <input
            inputMode="decimal"
            value={monthlyContribution}
            onChange={(e) => setMonthlyContribution(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          />
        </label>
      </div>

      <div
        aria-live="polite"
        className={`mt-6 rounded-lg border p-4 ${
          result ? "border-brand-200 bg-brand-50 dark:border-brand-900 dark:bg-brand-900/20" : "border-slate-200 dark:border-slate-800"
        }`}
      >
        {result ? (
          <dl className="grid gap-3 sm:grid-cols-3">
            <div>
              <dt className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">{t("result.finalBalance")}</dt>
              <dd className="mt-1 text-2xl font-bold tabular-nums">{currency.format(result.finalBalance)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">{t("result.totalContributed")}</dt>
              <dd className="mt-1 text-2xl font-bold tabular-nums">{currency.format(result.totalContributed)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">{t("result.totalInterest")}</dt>
              <dd className="mt-1 text-2xl font-bold tabular-nums text-emerald-600">
                {currency.format(result.totalInterest)}
              </dd>
            </div>
          </dl>
        ) : (
          <div className="text-sm text-slate-600 dark:text-slate-400">{t("empty")}</div>
        )}
      </div>
    </div>
  );
}
