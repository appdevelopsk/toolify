"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

type Unit = "metric" | "imperial";
type Activity = "low" | "moderate" | "high";

const ACTIVITY_FACTOR: Record<Activity, number> = { low: 1.0, moderate: 1.15, high: 1.3 };

export default function WaterIntakeCalculator() {
  const t = useTranslations("tools.water-intake-calculator");
  const locale = useLocale();
  const [unit, setUnit] = useState<Unit>(locale === "en" ? "imperial" : "metric");
  const [weight, setWeight] = useState("");
  const [activity, setActivity] = useState<Activity>("moderate");

  const result = useMemo(() => {
    const w = parseFloat(weight);
    if (!isFinite(w) || w <= 0) return null;
    const kg = unit === "metric" ? w : w * 0.45359237;
    // Baseline: 35 mL per kg of bodyweight (typical adult)
    const baselineMl = kg * 35;
    const totalMl = baselineMl * ACTIVITY_FACTOR[activity];
    const totalL = totalMl / 1000;
    const totalFlOz = totalMl / 29.5735;
    const totalCups = totalMl / 236.588;
    return { totalMl, totalL, totalFlOz, totalCups };
  }, [unit, weight, activity]);

  const fmt0 = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }), [locale]);
  const fmt1 = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }), [locale]);

  return (
    <div>
      <div className="mb-4 inline-flex rounded-md border border-slate-300 dark:border-slate-700">
        <button onClick={() => setUnit("metric")} className={`px-3 py-1.5 text-sm ${unit === "metric" ? "bg-brand-600 text-white" : ""}`}>
          {t("unit.metric")}
        </button>
        <button onClick={() => setUnit("imperial")} className={`px-3 py-1.5 text-sm ${unit === "imperial" ? "bg-brand-600 text-white" : ""}`}>
          {t("unit.imperial")}
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">{t("input.weight")} ({unit === "metric" ? "kg" : "lb"})</span>
          <input inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" placeholder={unit === "metric" ? "65" : "143"} />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.activity")}</span>
          <select value={activity} onChange={(e) => setActivity(e.target.value as Activity)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
            {(["low", "moderate", "high"] as Activity[]).map((a) => (
              <option key={a} value={a}>{t(`activity.${a}`)}</option>
            ))}
          </select>
        </label>
      </div>

      <div aria-live="polite" className={`mt-6 rounded-lg border p-4 ${result ? "border-brand-200 bg-brand-50 dark:border-brand-900 dark:bg-brand-900/20" : "border-slate-200 dark:border-slate-800"}`}>
        {result ? (
          <>
            <div className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">{t("result.daily")}</div>
            <div className="mt-1 text-4xl font-bold tabular-nums">
              {unit === "metric" ? `${fmt1.format(result.totalL)} L` : `${fmt0.format(result.totalFlOz)} fl oz`}
            </div>
            <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800">
                <dt>{t("result.ml")}</dt>
                <dd className="tabular-nums">{fmt0.format(result.totalMl)}</dd>
              </div>
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800">
                <dt>{t("result.cups")}</dt>
                <dd className="tabular-nums">{fmt1.format(result.totalCups)}</dd>
              </div>
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800">
                <dt>{t("result.bottles500")}</dt>
                <dd className="tabular-nums">{fmt1.format(result.totalMl / 500)}</dd>
              </div>
            </dl>
          </>
        ) : (
          <div className="text-sm text-slate-600 dark:text-slate-400">{t("empty")}</div>
        )}
      </div>
    </div>
  );
}
