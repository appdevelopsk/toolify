"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

type Sex = "male" | "female";

function navyBodyFat(sex: Sex, heightCm: number, neckCm: number, waistCm: number, hipCm: number): number {
  // US Navy method (cm version)
  if (sex === "male") {
    return 86.010 * Math.log10(waistCm - neckCm) - 70.041 * Math.log10(heightCm) + 36.76;
  }
  // female
  return 163.205 * Math.log10(waistCm + hipCm - neckCm) - 97.684 * Math.log10(heightCm) - 78.387;
}

function bfCategory(sex: Sex, bfPct: number): string {
  if (sex === "male") {
    if (bfPct < 6) return "essential";
    if (bfPct < 14) return "athlete";
    if (bfPct < 18) return "fit";
    if (bfPct < 25) return "average";
    return "obese";
  }
  if (bfPct < 14) return "essential";
  if (bfPct < 21) return "athlete";
  if (bfPct < 25) return "fit";
  if (bfPct < 32) return "average";
  return "obese";
}

export default function BodyFatCalculator() {
  const t = useTranslations("tools.body-fat-calculator");
  const locale = useLocale();
  const [sex, setSex] = useState<Sex>("male");
  const [height, setHeight] = useState("170");
  const [waist, setWaist] = useState("85");
  const [neck, setNeck] = useState("38");
  const [hip, setHip] = useState("95");
  const [weight, setWeight] = useState("70");

  const result = useMemo(() => {
    const h = parseFloat(height);
    const w = parseFloat(waist);
    const n = parseFloat(neck);
    const hp = parseFloat(hip);
    const wt = parseFloat(weight);
    if (![h, w, n, wt].every(isFinite)) return null;
    if (sex === "female" && !isFinite(hp)) return null;
    const bf = navyBodyFat(sex, h, n, w, hp);
    if (!isFinite(bf) || bf <= 0 || bf >= 60) return null;
    const fatMass = (wt * bf) / 100;
    const leanMass = wt - fatMass;
    return { bf, fatMass, leanMass, category: bfCategory(sex, bf) };
  }, [sex, height, waist, neck, hip, weight]);

  const fmt = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }), [locale]);

  return (
    <div>
      <div className="mb-3 flex gap-2">
        <button onClick={() => setSex("male")} className={`rounded px-3 py-1 text-sm ${sex === "male" ? "bg-brand-600 text-white" : "border border-slate-300 dark:border-slate-700"}`}>{t("sex.male")}</button>
        <button onClick={() => setSex("female")} className={`rounded px-3 py-1 text-sm ${sex === "female" ? "bg-brand-600 text-white" : "border border-slate-300 dark:border-slate-700"}`}>{t("sex.female")}</button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">{t("input.height")} (cm)</span>
          <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.weight")} (kg)</span>
          <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.waist")} (cm)</span>
          <input type="number" value={waist} onChange={(e) => setWaist(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.neck")} (cm)</span>
          <input type="number" value={neck} onChange={(e) => setNeck(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900" />
        </label>
        {sex === "female" && (
          <label className="block">
            <span className="text-sm font-medium">{t("input.hip")} (cm)</span>
            <input type="number" value={hip} onChange={(e) => setHip(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900" />
          </label>
        )}
      </div>

      <div aria-live="polite" className="mt-6 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
        {result ? (
          <div>
            <div className="flex items-baseline gap-3">
              <div className="text-4xl font-bold tabular-nums">{fmt.format(result.bf)}%</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">{t(`category.${result.category}`)}</div>
            </div>
            <dl className="mt-4 grid gap-2 text-sm">
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800"><dt>{t("result.fatMass")}</dt><dd className="tabular-nums">{fmt.format(result.fatMass)} kg</dd></div>
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800"><dt>{t("result.leanMass")}</dt><dd className="tabular-nums">{fmt.format(result.leanMass)} kg</dd></div>
            </dl>
          </div>
        ) : (
          <div className="text-sm text-slate-600 dark:text-slate-400">{t("empty")}</div>
        )}
      </div>
    </div>
  );
}
