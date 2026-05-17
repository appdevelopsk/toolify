"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

function monthlyPayment(principal: number, monthlyRate: number, months: number): number {
  if (monthlyRate === 0) return principal / months;
  const r = monthlyRate;
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

export default function MortgageRefinanceCalculator() {
  const t = useTranslations("tools.mortgage-refinance-calculator");
  const locale = useLocale();

  // Current loan
  const [currentBalance, setCurrentBalance] = useState("250000");
  const [currentRate, setCurrentRate] = useState("6.5");
  const [currentRemainingYears, setCurrentRemainingYears] = useState("25");
  // New loan
  const [newRate, setNewRate] = useState("5.0");
  const [newTermYears, setNewTermYears] = useState("25");
  const [closingCosts, setClosingCosts] = useState("4000");

  const result = useMemo(() => {
    const balance = parseFloat(currentBalance);
    const curRate = parseFloat(currentRate);
    const curMonths = Math.round(parseFloat(currentRemainingYears) * 12);
    const nRate = parseFloat(newRate);
    const nMonths = Math.round(parseFloat(newTermYears) * 12);
    const fees = parseFloat(closingCosts);

    if (![balance, curRate, curMonths, nRate, nMonths, fees].every((v) => Number.isFinite(v) && v >= 0)) return null;
    if (balance <= 0 || curMonths <= 0 || nMonths <= 0) return null;

    const curMonthlyRate = curRate / 100 / 12;
    const nMonthlyRate = nRate / 100 / 12;

    const currentPayment = monthlyPayment(balance, curMonthlyRate, curMonths);
    const newPayment = monthlyPayment(balance, nMonthlyRate, nMonths);

    const currentTotalRemaining = currentPayment * curMonths;
    const newTotal = newPayment * nMonths + fees;

    const monthlySavings = currentPayment - newPayment;
    const lifetimeSavings = currentTotalRemaining - newTotal;
    const breakevenMonths = monthlySavings > 0 ? Math.ceil(fees / monthlySavings) : null;

    const currentInterest = currentTotalRemaining - balance;
    const newInterest = newPayment * nMonths - balance;
    const interestSavings = currentInterest - newInterest;

    return {
      currentPayment,
      newPayment,
      monthlySavings,
      lifetimeSavings,
      breakevenMonths,
      currentInterest,
      newInterest,
      interestSavings,
      fees,
    };
  }, [currentBalance, currentRate, currentRemainingYears, newRate, newTermYears, closingCosts]);

  const currency = new Intl.NumberFormat(locale, { style: "currency", currency: locale === "ja" || locale === "zh-CN" || locale === "zh-TW" || locale === "ko" ? (locale === "ja" ? "JPY" : locale === "ko" ? "KRW" : "CNY") : "USD", maximumFractionDigits: 0 });

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <fieldset className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
          <legend className="px-2 text-sm font-semibold">{t("currentHeading")}</legend>
          <div className="space-y-3">
            <label className="block">
              <span className="text-sm font-medium">{t("input.currentBalance")}</span>
              <input type="number" inputMode="decimal" value={currentBalance} onChange={(e) => setCurrentBalance(e.target.value)} className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
            </label>
            <label className="block">
              <span className="text-sm font-medium">{t("input.currentRate")}</span>
              <input type="number" inputMode="decimal" step="0.01" value={currentRate} onChange={(e) => setCurrentRate(e.target.value)} className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
            </label>
            <label className="block">
              <span className="text-sm font-medium">{t("input.currentRemainingYears")}</span>
              <input type="number" inputMode="decimal" step="0.5" value={currentRemainingYears} onChange={(e) => setCurrentRemainingYears(e.target.value)} className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
            </label>
          </div>
        </fieldset>

        <fieldset className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
          <legend className="px-2 text-sm font-semibold">{t("newHeading")}</legend>
          <div className="space-y-3">
            <label className="block">
              <span className="text-sm font-medium">{t("input.newRate")}</span>
              <input type="number" inputMode="decimal" step="0.01" value={newRate} onChange={(e) => setNewRate(e.target.value)} className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
            </label>
            <label className="block">
              <span className="text-sm font-medium">{t("input.newTermYears")}</span>
              <input type="number" inputMode="decimal" step="0.5" value={newTermYears} onChange={(e) => setNewTermYears(e.target.value)} className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
            </label>
            <label className="block">
              <span className="text-sm font-medium">{t("input.closingCosts")}</span>
              <input type="number" inputMode="decimal" value={closingCosts} onChange={(e) => setClosingCosts(e.target.value)} className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
            </label>
          </div>
        </fieldset>
      </div>

      {result === null ? (
        <p className="rounded bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-900/20 dark:text-amber-200">{t("empty")}</p>
      ) : (
        <div className="space-y-3">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded border border-slate-200 p-3 dark:border-slate-800">
              <div className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">{t("result.currentPayment")}</div>
              <div className="mt-1 font-mono text-lg">{currency.format(result.currentPayment)}</div>
            </div>
            <div className="rounded border border-slate-200 p-3 dark:border-slate-800">
              <div className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">{t("result.newPayment")}</div>
              <div className="mt-1 font-mono text-lg">{currency.format(result.newPayment)}</div>
            </div>
            <div className={`rounded border p-3 ${result.monthlySavings > 0 ? "border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20" : "border-rose-300 bg-rose-50 dark:border-rose-800 dark:bg-rose-900/20"}`}>
              <div className={`text-xs uppercase tracking-wider ${result.monthlySavings > 0 ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300"}`}>{t("result.monthlyDelta")}</div>
              <div className={`mt-1 font-mono text-lg ${result.monthlySavings > 0 ? "text-emerald-900 dark:text-emerald-100" : "text-rose-900 dark:text-rose-100"}`}>{result.monthlySavings >= 0 ? "−" : "+"}{currency.format(Math.abs(result.monthlySavings))}</div>
            </div>
          </div>

          <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800/50">
            <h3 className="text-sm font-semibold">{t("result.summary")}</h3>
            <dl className="mt-2 grid gap-2 text-sm md:grid-cols-2">
              <div className="flex justify-between gap-3">
                <dt className="text-slate-600 dark:text-slate-400">{t("result.currentInterest")}</dt>
                <dd className="font-mono">{currency.format(result.currentInterest)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-600 dark:text-slate-400">{t("result.newInterest")}</dt>
                <dd className="font-mono">{currency.format(result.newInterest)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-600 dark:text-slate-400">{t("result.interestSavings")}</dt>
                <dd className={`font-mono ${result.interestSavings > 0 ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300"}`}>{currency.format(result.interestSavings)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-600 dark:text-slate-400">{t("result.lifetimeSavings")}</dt>
                <dd className={`font-mono font-semibold ${result.lifetimeSavings > 0 ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300"}`}>{currency.format(result.lifetimeSavings)}</dd>
              </div>
            </dl>
            {result.breakevenMonths !== null ? (
              <p className="mt-3 text-sm">
                <strong>{t("result.breakevenLabel")}:</strong>{" "}
                {result.breakevenMonths <= 60
                  ? t("result.breakevenGood", { months: result.breakevenMonths, years: (result.breakevenMonths / 12).toFixed(1) })
                  : t("result.breakevenSlow", { months: result.breakevenMonths, years: (result.breakevenMonths / 12).toFixed(1) })}
              </p>
            ) : (
              <p className="mt-3 text-sm text-rose-700 dark:text-rose-300">{t("result.noBreakeven")}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
