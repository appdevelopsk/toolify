"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

export default function SavingsGoalCalculator() {
  const t = useTranslations("tools.savings-goal-calculator");
  const locale = useLocale();
  const [goal, setGoal] = useState("100000");
  const [start, setStart] = useState("0");
  const [monthly, setMonthly] = useState("500");
  const [ratePct, setRatePct] = useState("4");

  const result = useMemo(() => {
    const G = parseFloat(goal);
    const P = parseFloat(start);
    const M = parseFloat(monthly);
    const r = parseFloat(ratePct) / 100 / 12;
    if (![G, P, M, r].every(isFinite) || G <= 0 || M < 0 || P < 0) return null;
    if (P >= G) return { months: 0, years: 0, monthsRem: 0, totalContrib: P, interestEarned: 0 };
    if (M === 0 && r === 0) return null;
    let months: number;
    if (r === 0) {
      months = Math.ceil((G - P) / Math.max(M, 0.01));
    } else {
      // FV = P*(1+r)^n + M*((1+r)^n - 1)/r ;  solve for n
      const num = G * r + M;
      const den = P * r + M;
      if (num <= 0 || den <= 0) return null;
      months = Math.ceil(Math.log(num / den) / Math.log(1 + r));
      if (!isFinite(months) || months < 0) return null;
    }
    const totalContrib = P + M * months;
    const interestEarned = G - totalContrib;
    return {
      months,
      years: Math.floor(months / 12),
      monthsRem: months % 12,
      totalContrib,
      interestEarned: Math.max(0, interestEarned),
    };
  }, [goal, start, monthly, ratePct]);

  const currency = useMemo(
    () => new Intl.NumberFormat(locale, { style: "currency", currency: locale === "ja" ? "JPY" : "USD", maximumFractionDigits: 0 }),
    [locale],
  );

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">{t("input.goal")}</span>
          <input inputMode="decimal" value={goal} onChange={(e) => setGoal(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.start")}</span>
          <input inputMode="decimal" value={start} onChange={(e) => setStart(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.monthly")}</span>
          <input inputMode="decimal" value={monthly} onChange={(e) => setMonthly(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.ratePct")}</span>
          <input inputMode="decimal" value={ratePct} onChange={(e) => setRatePct(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
        </label>
      </div>

      <div aria-live="polite" className={`mt-6 rounded-lg border p-4 ${result ? "border-brand-200 bg-brand-50 dark:border-brand-900 dark:bg-brand-900/20" : "border-slate-200 dark:border-slate-800"}`}>
        {result ? (
          <>
            <div className="text-xs uppercase tracking-wider text-slate-500">{t("result.timeToGoal")}</div>
            <div className="mt-1 text-4xl font-bold tabular-nums">
              {result.years > 0 && <>{result.years} <span className="text-base font-normal text-slate-500">{t("result.years")}</span> </>}
              {result.monthsRem > 0 && <>{result.monthsRem} <span className="text-base font-normal text-slate-500">{t("result.months")}</span></>}
              {result.years === 0 && result.monthsRem === 0 && <>0 <span className="text-base font-normal text-slate-500">{t("result.months")}</span></>}
            </div>
            <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800"><dt>{t("result.totalMonths")}</dt><dd className="tabular-nums">{result.months}</dd></div>
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800"><dt>{t("result.totalContrib")}</dt><dd className="tabular-nums">{currency.format(result.totalContrib)}</dd></div>
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800"><dt>{t("result.interest")}</dt><dd className="tabular-nums text-emerald-600">{currency.format(result.interestEarned)}</dd></div>
            </dl>
          </>
        ) : (
          <div className="text-sm text-slate-500">{t("empty")}</div>
        )}
      </div>
    </div>
  );
}
