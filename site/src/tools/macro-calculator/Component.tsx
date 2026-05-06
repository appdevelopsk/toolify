"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

type Goal = "lose" | "maintain" | "gain";
type Unit = "metric" | "imperial";

const GOAL_DELTA: Record<Goal, number> = { lose: -500, maintain: 0, gain: 500 };

function bmrMifflin(sex: "male" | "female", weightKg: number, heightCm: number, age: number): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === "male" ? base + 5 : base - 161;
}

export default function MacroCalculator() {
  const t = useTranslations("tools.macro-calculator");
  const locale = useLocale();
  const [unit, setUnit] = useState<Unit>(locale === "en" ? "imperial" : "metric");
  const [sex, setSex] = useState<"male" | "female">("male");
  const [age, setAge] = useState("30");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [activity, setActivity] = useState(1.55);
  const [goal, setGoal] = useState<Goal>("maintain");

  const result = useMemo(() => {
    const a = parseFloat(age);
    const h = parseFloat(height);
    const w = parseFloat(weight);
    if (![a, h, w].every(isFinite) || a <= 0 || h <= 0 || w <= 0) return null;
    const heightCm = unit === "metric" ? h : h * 2.54;
    const weightKg = unit === "metric" ? w : w * 0.45359237;
    const bmr = bmrMifflin(sex, weightKg, heightCm, a);
    const tdee = bmr * activity;
    const targetKcal = Math.max(1200, Math.round(tdee + GOAL_DELTA[goal]));
    // Standard split: P 30%, F 30%, C 40% with floor of 1.6 g/kg protein
    const proteinG = Math.max(1.6 * weightKg, (targetKcal * 0.3) / 4);
    const fatG = (targetKcal * 0.3) / 9;
    const remainingKcal = targetKcal - proteinG * 4 - fatG * 9;
    const carbsG = Math.max(0, remainingKcal / 4);
    return {
      tdee: Math.round(tdee),
      targetKcal,
      proteinG: Math.round(proteinG),
      fatG: Math.round(fatG),
      carbsG: Math.round(carbsG),
    };
  }, [unit, sex, age, height, weight, activity, goal]);

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

      <div className="grid gap-3 sm:grid-cols-3">
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
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">{t("input.activity")}</span>
          <select value={activity} onChange={(e) => setActivity(parseFloat(e.target.value))} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
            <option value={1.2}>{t("activity.sedentary")}</option>
            <option value={1.375}>{t("activity.light")}</option>
            <option value={1.55}>{t("activity.moderate")}</option>
            <option value={1.725}>{t("activity.active")}</option>
            <option value={1.9}>{t("activity.veryActive")}</option>
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.goal")}</span>
          <select value={goal} onChange={(e) => setGoal(e.target.value as Goal)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
            <option value="lose">{t("goal.lose")}</option>
            <option value="maintain">{t("goal.maintain")}</option>
            <option value="gain">{t("goal.gain")}</option>
          </select>
        </label>
      </div>

      <div aria-live="polite" className={`mt-6 rounded-lg border p-4 ${result ? "border-brand-200 bg-brand-50 dark:border-brand-900 dark:bg-brand-900/20" : "border-slate-200 dark:border-slate-800"}`}>
        {result ? (
          <>
            <div className="text-xs uppercase tracking-wider text-slate-500">{t("result.target")}</div>
            <div className="mt-1 text-4xl font-bold tabular-nums">{fmt.format(result.targetKcal)} <span className="text-base font-normal text-slate-500">kcal/day</span></div>
            <dl className="mt-4 grid gap-2 sm:grid-cols-3">
              <Macro label={t("result.protein")} grams={result.proteinG} kcal={result.proteinG * 4} color="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200" />
              <Macro label={t("result.fat")} grams={result.fatG} kcal={result.fatG * 9} color="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200" />
              <Macro label={t("result.carbs")} grams={result.carbsG} kcal={result.carbsG * 4} color="bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-200" />
            </dl>
          </>
        ) : (
          <div className="text-sm text-slate-500">{t("empty")}</div>
        )}
      </div>
    </div>
  );
}

function Macro({ label, grams, kcal, color }: { label: string; grams: number; kcal: number; color: string }) {
  return (
    <div className={`rounded p-3 ${color}`}>
      <div className="text-xs font-medium uppercase tracking-wider">{label}</div>
      <div className="mt-1 text-2xl font-bold tabular-nums">{grams}g</div>
      <div className="text-xs">{kcal} kcal</div>
    </div>
  );
}
