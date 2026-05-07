"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

type Sex = "male" | "female";

function whrCategory(sex: Sex, whr: number): string {
  if (sex === "male") {
    if (whr < 0.85) return "low";
    if (whr < 0.90) return "moderate";
    if (whr < 1.00) return "high";
    return "veryHigh";
  }
  if (whr < 0.75) return "low";
  if (whr < 0.80) return "moderate";
  if (whr < 0.85) return "high";
  return "veryHigh";
}

export default function WaistHipRatioCalculator() {
  const t = useTranslations("tools.waist-hip-ratio-calculator");
  const locale = useLocale();
  const [sex, setSex] = useState<Sex>("female");
  const [waist, setWaist] = useState("75");
  const [hip, setHip] = useState("95");

  const result = useMemo(() => {
    const w = parseFloat(waist);
    const h = parseFloat(hip);
    if (![w, h].every(isFinite) || w <= 0 || h <= 0) return null;
    const whr = w / h;
    return { whr, category: whrCategory(sex, whr) };
  }, [sex, waist, hip]);

  const fmt = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }), [locale]);
  const catColor: Record<string, string> = {
    low: "bg-emerald-50 dark:bg-emerald-900/20",
    moderate: "bg-lime-50 dark:bg-lime-900/20",
    high: "bg-amber-50 dark:bg-amber-900/20",
    veryHigh: "bg-rose-50 dark:bg-rose-900/20",
  };

  return (
    <div>
      <div className="mb-3 flex gap-2">
        <button onClick={() => setSex("male")} className={`rounded px-3 py-1 text-sm ${sex === "male" ? "bg-brand-600 text-white" : "border border-slate-300 dark:border-slate-700"}`}>{t("sex.male")}</button>
        <button onClick={() => setSex("female")} className={`rounded px-3 py-1 text-sm ${sex === "female" ? "bg-brand-600 text-white" : "border border-slate-300 dark:border-slate-700"}`}>{t("sex.female")}</button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">{t("input.waist")} (cm)</span>
          <input type="number" value={waist} onChange={(e) => setWaist(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.hip")} (cm)</span>
          <input type="number" value={hip} onChange={(e) => setHip(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900" />
        </label>
      </div>

      <div aria-live="polite" className="mt-6 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
        {result ? (
          <div>
            <div className={`rounded p-4 text-center ${catColor[result.category]}`}>
              <div className="text-sm font-medium">{t("result.whr")}</div>
              <div className="tabular-nums text-4xl font-bold">{fmt.format(result.whr)}</div>
              <div className="mt-1 text-sm font-medium">{t(`category.${result.category}`)}</div>
            </div>
            <p className="mt-3 text-xs text-slate-500">{t("result.note")}</p>
          </div>
        ) : (
          <div className="text-sm text-slate-500">{t("empty")}</div>
        )}
      </div>
    </div>
  );
}
