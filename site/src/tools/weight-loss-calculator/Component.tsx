"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

const KCAL_PER_KG_FAT = 7700;

export default function WeightLossCalculator() {
  const t = useTranslations("tools.weight-loss-calculator");
  const locale = useLocale();
  const [currentWeight, setCurrentWeight] = useState("75");
  const [targetWeight, setTargetWeight] = useState("65");
  const [dailyDeficit, setDailyDeficit] = useState("500");

  const result = useMemo(() => {
    const cw = parseFloat(currentWeight);
    const tw = parseFloat(targetWeight);
    const d = parseFloat(dailyDeficit);
    if (![cw, tw, d].every(isFinite) || cw <= 0 || tw <= 0 || d <= 0) return null;
    const kgToLose = cw - tw;
    if (kgToLose <= 0) return { invalid: true as const };
    const totalDeficit = kgToLose * KCAL_PER_KG_FAT;
    const days = totalDeficit / d;
    const weeks = days / 7;
    const months = days / 30.44;
    const weeklyKg = (d * 7) / KCAL_PER_KG_FAT;
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + Math.ceil(days));
    return { kgToLose, totalDeficit, days: Math.ceil(days), weeks, months, weeklyKg, targetDate };
  }, [currentWeight, targetWeight, dailyDeficit]);

  const fmt = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }), [locale]);
  const fmtInt = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }), [locale]);
  const fmtDate = useMemo(() => new Intl.DateTimeFormat(locale, { year: "numeric", month: "long", day: "numeric" }), [locale]);

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="text-sm font-medium">{t("input.currentWeight")} (kg)</span>
          <input type="number" value={currentWeight} onChange={(e) => setCurrentWeight(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.targetWeight")} (kg)</span>
          <input type="number" value={targetWeight} onChange={(e) => setTargetWeight(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.dailyDeficit")} (kcal)</span>
          <input type="number" value={dailyDeficit} onChange={(e) => setDailyDeficit(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900" />
        </label>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {[250, 500, 750, 1000].map((d) => (
          <button key={d} onClick={() => setDailyDeficit(String(d))} className="rounded border border-slate-300 px-3 py-1 text-xs hover:border-brand-500 dark:border-slate-700">
            {d} kcal
          </button>
        ))}
      </div>

      <div aria-live="polite" className="mt-6 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
        {result && "invalid" in result ? (
          <div className="text-sm text-rose-500">{t("invalidTarget")}</div>
        ) : result ? (
          <dl className="grid gap-2 text-sm">
            <div className="rounded bg-emerald-50 px-3 py-2 dark:bg-emerald-900/20">
              <dt className="text-xs font-medium text-emerald-900 dark:text-emerald-200">{t("result.targetDate")}</dt>
              <dd className="tabular-nums text-2xl font-bold">{fmtDate.format(result.targetDate)}</dd>
            </div>
            <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800"><dt>{t("result.kgToLose")}</dt><dd className="tabular-nums">{fmt.format(result.kgToLose)} kg</dd></div>
            <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800"><dt>{t("result.weeklyKg")}</dt><dd className="tabular-nums">{fmt.format(result.weeklyKg)} kg</dd></div>
            <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800"><dt>{t("result.days")}</dt><dd className="tabular-nums">{fmtInt.format(result.days)}</dd></div>
            <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800"><dt>{t("result.weeks")}</dt><dd className="tabular-nums">{fmt.format(result.weeks)}</dd></div>
            <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800"><dt>{t("result.months")}</dt><dd className="tabular-nums">{fmt.format(result.months)}</dd></div>
            <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800"><dt>{t("result.totalDeficit")}</dt><dd className="tabular-nums">{fmtInt.format(result.totalDeficit)} kcal</dd></div>
          </dl>
        ) : (
          <div className="text-sm text-slate-600 dark:text-slate-400">{t("empty")}</div>
        )}
      </div>
    </div>
  );
}
