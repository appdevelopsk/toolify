"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

interface Result {
  breakEvenUnits: number;
  breakEvenRevenue: number;
  contributionMargin: number;
  contributionMarginRatio: number;
}

function calcBreakEven(fixedCosts: number, pricePerUnit: number, variableCostPerUnit: number): Result | null {
  const cm = pricePerUnit - variableCostPerUnit;
  if (cm <= 0) return null;
  const beu = fixedCosts / cm;
  const ber = beu * pricePerUnit;
  const cmr = (cm / pricePerUnit) * 100;
  return {
    breakEvenUnits: beu,
    breakEvenRevenue: ber,
    contributionMargin: cm,
    contributionMarginRatio: cmr,
  };
}

export default function BreakEvenCalculator() {
  const t = useTranslations("tools.break-even-calculator");
  const locale = useLocale();

  const [fixedCosts, setFixedCosts] = useState("10000");
  const [price, setPrice] = useState("50");
  const [varCost, setVarCost] = useState("30");
  const [targetUnits, setTargetUnits] = useState("");

  const fmt = useMemo(
    () => new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true }),
    [locale]
  );
  const fmtInt = useMemo(
    () => new Intl.NumberFormat(locale, { maximumFractionDigits: 0, useGrouping: true }),
    [locale]
  );

  const result = useMemo(() => {
    const fc = parseFloat(fixedCosts);
    const p = parseFloat(price);
    const vc = parseFloat(varCost);
    if (!isFinite(fc) || !isFinite(p) || !isFinite(vc)) return null;
    if (fc < 0 || p <= 0) return null;
    return calcBreakEven(fc, p, vc);
  }, [fixedCosts, price, varCost]);

  const targetProfit = useMemo(() => {
    if (!result || !targetUnits) return null;
    const tu = parseFloat(targetUnits);
    if (!isFinite(tu) || tu < 0) return null;
    const profit = tu * result.contributionMargin - parseFloat(fixedCosts);
    return profit;
  }, [result, targetUnits, fixedCosts]);

  const inputClass =
    "w-full rounded border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900";

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            {t("input.fixedCosts")}
          </span>
          <input inputMode="decimal" value={fixedCosts} onChange={(e) => setFixedCosts(e.target.value)} className={inputClass} />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            {t("input.pricePerUnit")}
          </span>
          <input inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} className={inputClass} />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            {t("input.variableCostPerUnit")}
          </span>
          <input inputMode="decimal" value={varCost} onChange={(e) => setVarCost(e.target.value)} className={inputClass} />
        </label>
      </div>

      {result === null && (
        <p className="text-sm text-amber-700 dark:text-amber-400">{t("error.negativeCM")}</p>
      )}

      {result && (
        <div aria-live="polite" className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg bg-brand-50 p-4 dark:bg-brand-900/20">
              <p className="text-sm font-medium text-brand-700 dark:text-brand-300">{t("result.breakEvenUnits")}</p>
              <p className="mt-1 text-3xl font-bold text-brand-600 dark:text-brand-400">
                {fmtInt.format(Math.ceil(result.breakEvenUnits))} {t("result.units")}
              </p>
            </div>
            <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
              <p className="text-sm font-medium text-green-700 dark:text-green-300">{t("result.breakEvenRevenue")}</p>
              <p className="mt-1 text-3xl font-bold text-green-600 dark:text-green-400">
                {fmt.format(result.breakEvenRevenue)}
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded border border-slate-200 p-3 dark:border-slate-800">
              <p className="text-xs text-slate-600 dark:text-slate-400">{t("result.contributionMargin")}</p>
              <p className="mt-1 text-xl font-semibold">{fmt.format(result.contributionMargin)}</p>
            </div>
            <div className="rounded border border-slate-200 p-3 dark:border-slate-800">
              <p className="text-xs text-slate-600 dark:text-slate-400">{t("result.cmRatio")}</p>
              <p className="mt-1 text-xl font-semibold">{fmt.format(result.contributionMarginRatio)}%</p>
            </div>
          </div>

          <div className="rounded border border-slate-200 p-4 dark:border-slate-800">
            <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">{t("section.targetProfit")}</h3>
            <label className="block">
              <span className="mb-1 block text-xs text-slate-600 dark:text-slate-400">{t("input.targetUnits")}</span>
              <input
                inputMode="decimal"
                value={targetUnits}
                onChange={(e) => setTargetUnits(e.target.value)}
                placeholder="e.g. 500"
                className={inputClass}
              />
            </label>
            {targetProfit !== null && (
              <p className="mt-2 text-sm">
                {t("result.targetProfitLabel")}{" "}
                <span className={targetProfit >= 0 ? "font-semibold text-green-600 dark:text-green-400" : "font-semibold text-red-600 dark:text-red-400"}>
                  {targetProfit >= 0 ? "+" : ""}{fmt.format(targetProfit)}
                </span>
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
