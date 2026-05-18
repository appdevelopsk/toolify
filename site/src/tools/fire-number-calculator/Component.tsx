"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

function sig2(n: number): number {
  if (!isFinite(n) || n === 0) return 0;
  return Math.round(n * 100) / 100;
}

interface Result {
  fireNumber: number;
  leanFire: number;
  fatFire: number;
  additionalNeeded: number;
  yearsToFire: number | null;
  withdrawalRate4: number;
}

function calcFire(
  annualExpenses: number,
  currentSavings: number,
  annualSavings: number,
  returnRate: number,
  wr: number
): Result {
  const fireNumber = annualExpenses / (wr / 100);
  const leanFire = annualExpenses * 0.75 / (wr / 100);
  const fatFire = annualExpenses * 1.5 / (wr / 100);
  const additionalNeeded = Math.max(0, fireNumber - currentSavings);
  const withdrawalRate4 = sig2((annualExpenses / fireNumber) * 100);

  let yearsToFire: number | null = null;
  if (additionalNeeded <= 0) {
    yearsToFire = 0;
  } else if (annualSavings > 0 && returnRate >= 0) {
    const r = returnRate / 100;
    if (r === 0) {
      yearsToFire = additionalNeeded / annualSavings;
    } else {
      // FV(r, n, pmt, pv) = pv*(1+r)^n + pmt*((1+r)^n - 1)/r = target
      // Solve numerically
      let balance = currentSavings;
      let years = 0;
      while (balance < fireNumber && years < 200) {
        balance = balance * (1 + r) + annualSavings;
        years++;
      }
      yearsToFire = balance >= fireNumber ? years : null;
    }
  }

  return { fireNumber, leanFire, fatFire, additionalNeeded, yearsToFire, withdrawalRate4 };
}

export default function FireNumberCalculator() {
  const t = useTranslations("tools.fire-number-calculator");
  const locale = useLocale();

  const [expenses, setExpenses] = useState("40000");
  const [savings, setSavings] = useState("100000");
  const [annualSavings, setAnnualSavings] = useState("20000");
  const [returnRate, setReturnRate] = useState("7");
  const [wr, setWr] = useState("4");

  const fmt = useMemo(
    () => new Intl.NumberFormat(locale, { style: "currency", currency: "USD", maximumFractionDigits: 0 }),
    [locale]
  );

  const result = useMemo(() => {
    const e = parseFloat(expenses);
    const s = parseFloat(savings);
    const as = parseFloat(annualSavings);
    const r = parseFloat(returnRate);
    const w = parseFloat(wr);
    if (!isFinite(e) || !isFinite(s) || !isFinite(as) || !isFinite(r) || !isFinite(w)) return null;
    if (e <= 0 || w <= 0 || w > 20) return null;
    return calcFire(e, s, as, r, w);
  }, [expenses, savings, annualSavings, returnRate, wr]);

  const inputClass =
    "w-full rounded border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900";

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            {t("input.expenses")}
          </span>
          <input inputMode="decimal" value={expenses} onChange={(e) => setExpenses(e.target.value)} className={inputClass} />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            {t("input.savings")}
          </span>
          <input inputMode="decimal" value={savings} onChange={(e) => setSavings(e.target.value)} className={inputClass} />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            {t("input.annualSavings")}
          </span>
          <input inputMode="decimal" value={annualSavings} onChange={(e) => setAnnualSavings(e.target.value)} className={inputClass} />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            {t("input.returnRate")}
          </span>
          <input inputMode="decimal" value={returnRate} onChange={(e) => setReturnRate(e.target.value)} className={inputClass} />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            {t("input.withdrawalRate")}
          </span>
          <input inputMode="decimal" value={wr} onChange={(e) => setWr(e.target.value)} className={inputClass} />
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{t("input.wrHint")}</p>
        </label>
      </div>

      {result && (
        <div aria-live="polite" className="space-y-4">
          <div className="rounded-lg bg-brand-50 p-4 dark:bg-brand-900/20">
            <p className="text-sm font-medium text-brand-700 dark:text-brand-300">{t("result.fireNumber")}</p>
            <p className="mt-1 text-3xl font-bold text-brand-600 dark:text-brand-400">
              {fmt.format(result.fireNumber)}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded border border-slate-200 p-3 dark:border-slate-800">
              <p className="text-xs text-slate-600 dark:text-slate-400">{t("result.yearsToFire")}</p>
              <p className="mt-1 text-xl font-semibold">
                {result.yearsToFire === null
                  ? "—"
                  : result.yearsToFire === 0
                  ? t("result.alreadyFire")
                  : `${Math.ceil(result.yearsToFire)} ${t("result.years")}`}
              </p>
            </div>
            <div className="rounded border border-slate-200 p-3 dark:border-slate-800">
              <p className="text-xs text-slate-600 dark:text-slate-400">{t("result.leanFire")}</p>
              <p className="mt-1 text-xl font-semibold">{fmt.format(result.leanFire)}</p>
            </div>
            <div className="rounded border border-slate-200 p-3 dark:border-slate-800">
              <p className="text-xs text-slate-600 dark:text-slate-400">{t("result.fatFire")}</p>
              <p className="mt-1 text-xl font-semibold">{fmt.format(result.fatFire)}</p>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400">
            {t("result.note", { expenses: fmt.format(parseFloat(expenses)), wr })}
          </p>
        </div>
      )}
    </div>
  );
}
