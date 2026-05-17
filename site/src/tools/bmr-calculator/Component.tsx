"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

type Sex = "male" | "female";
type Unit = "metric" | "imperial";

function mifflin(sex: Sex, weightKg: number, heightCm: number, age: number): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === "male" ? base + 5 : base - 161;
}

function harrisBenedict(sex: Sex, weightKg: number, heightCm: number, age: number): number {
  if (sex === "male") {
    return 88.362 + 13.397 * weightKg + 4.799 * heightCm - 5.677 * age;
  } else {
    return 447.593 + 9.247 * weightKg + 3.098 * heightCm - 4.330 * age;
  }
}

function katchMcArdle(leanMassKg: number): number {
  // requires lean body mass, not total body mass
  return 370 + 21.6 * leanMassKg;
}

export default function BmrCalculator() {
  const t = useTranslations("tools.bmr-calculator");
  const locale = useLocale();
  const [unit, setUnit] = useState<Unit>(locale === "en" ? "imperial" : "metric");
  const [sex, setSex] = useState<Sex>("male");
  const [age, setAge] = useState("30");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [bodyFatPct, setBodyFatPct] = useState("");

  const result = useMemo(() => {
    const a = parseFloat(age);
    const h = parseFloat(height);
    const w = parseFloat(weight);
    if (![a, h, w].every(isFinite) || a <= 0 || h <= 0 || w <= 0) return null;
    const heightCm = unit === "metric" ? h : h * 2.54;
    const weightKg = unit === "metric" ? w : w * 0.45359237;
    const mst = mifflin(sex, weightKg, heightCm, a);
    const hb = harrisBenedict(sex, weightKg, heightCm, a);
    const bf = parseFloat(bodyFatPct);
    let km: number | null = null;
    if (isFinite(bf) && bf > 0 && bf < 100) {
      const lean = weightKg * (1 - bf / 100);
      km = katchMcArdle(lean);
    }
    return {
      mifflin: Math.round(mst),
      harris: Math.round(hb),
      katch: km !== null ? Math.round(km) : null,
    };
  }, [unit, sex, age, height, weight, bodyFatPct]);

  const fmt = useMemo(() => new Intl.NumberFormat(locale), [locale]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        <div className="inline-flex rounded-md border border-slate-300 dark:border-slate-700">
          <button onClick={() => setUnit("metric")} className={`px-3 py-1.5 text-sm ${unit === "metric" ? "bg-brand-600 text-white" : ""}`}>{t("unit.metric")}</button>
          <button onClick={() => setUnit("imperial")} className={`px-3 py-1.5 text-sm ${unit === "imperial" ? "bg-brand-600 text-white" : ""}`}>{t("unit.imperial")}</button>
        </div>
        <div className="inline-flex rounded-md border border-slate-300 dark:border-slate-700">
          <button onClick={() => setSex("male")} className={`px-3 py-1.5 text-sm ${sex === "male" ? "bg-brand-600 text-white" : ""}`}>{t("sex.male")}</button>
          <button onClick={() => setSex("female")} className={`px-3 py-1.5 text-sm ${sex === "female" ? "bg-brand-600 text-white" : ""}`}>{t("sex.female")}</button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">{t("input.age")}</span>
          <input inputMode="numeric" value={age} onChange={(e) => setAge(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.height")} ({unit === "metric" ? "cm" : "in"})</span>
          <input inputMode="decimal" value={height} onChange={(e) => setHeight(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.weight")} ({unit === "metric" ? "kg" : "lb"})</span>
          <input inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.bodyFat")}</span>
          <input inputMode="decimal" value={bodyFatPct} onChange={(e) => setBodyFatPct(e.target.value)} placeholder={t("input.bodyFatOptional")} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
        </label>
      </div>

      <div aria-live="polite" className={`mt-6 rounded-lg border p-4 ${result ? "border-brand-200 bg-brand-50 dark:border-brand-900 dark:bg-brand-900/20" : "border-slate-200 dark:border-slate-800"}`}>
        {result ? (
          <dl className="grid gap-3 sm:grid-cols-3">
            <div>
              <dt className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">{t("formula.mifflin")}</dt>
              <dd className="mt-1 text-3xl font-bold tabular-nums">{fmt.format(result.mifflin)} <span className="text-sm font-normal text-slate-600 dark:text-slate-400">kcal/day</span></dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">{t("formula.harris")}</dt>
              <dd className="mt-1 text-2xl font-bold tabular-nums">{fmt.format(result.harris)} <span className="text-sm font-normal text-slate-600 dark:text-slate-400">kcal/day</span></dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">{t("formula.katch")}</dt>
              <dd className="mt-1 text-2xl font-bold tabular-nums">
                {result.katch !== null ? <>{fmt.format(result.katch)} <span className="text-sm font-normal text-slate-600 dark:text-slate-400">kcal/day</span></> : <span className="text-base font-normal text-slate-600 dark:text-slate-400">{t("formula.katchNoBf")}</span>}
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
