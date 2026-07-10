"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useLocalDraft } from "@/lib/hooks/useLocalDraft";
import { DraftNotice } from "@/lib/hooks/DraftNotice";
import { defaultUnitSystem, type UnitSystem } from "@/lib/hooks/useUnitSystem";

type Sex = "male" | "female";
type Activity = "sedentary" | "light" | "moderate" | "active" | "veryActive";
type Unit = UnitSystem;

const ACTIVITY_FACTOR: Record<Activity, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  veryActive: 1.9,
};

function bmrMifflin(sex: Sex, weightKg: number, heightCm: number, age: number): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === "male" ? base + 5 : base - 161;
}

export default function CalorieCalculator() {
  const t = useTranslations("tools.calorie-calculator");
  const locale = useLocale();
  const [unit, setUnit] = useState<Unit>(defaultUnitSystem(locale));
  const [sex, setSex] = useState<Sex>("male");
  const [age, setAge] = useState("30");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [activity, setActivity] = useState<Activity>("moderate");

  const draft = useLocalDraft(
    "calorie-calculator",
    { unit, sex, age, height, weight, activity },
    (d) => {
      if (d.unit === "metric" || d.unit === "imperial") setUnit(d.unit);
      if (d.sex === "male" || d.sex === "female") setSex(d.sex);
      if (typeof d.age === "string") setAge(d.age);
      if (typeof d.height === "string") setHeight(d.height);
      if (typeof d.weight === "string") setWeight(d.weight);
      if (typeof d.activity === "string" && d.activity in ACTIVITY_FACTOR) setActivity(d.activity);
    },
  );

  const result = useMemo(() => {
    const a = parseFloat(age);
    const h = parseFloat(height);
    const w = parseFloat(weight);
    if (![a, h, w].every(isFinite) || a <= 0 || h <= 0 || w <= 0) return null;
    const heightCm = unit === "metric" ? h : h * 2.54;
    const weightKg = unit === "metric" ? w : w * 0.45359237;
    const bmr = bmrMifflin(sex, weightKg, heightCm, a);
    const tdee = bmr * ACTIVITY_FACTOR[activity];
    return {
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      mildLoss: Math.round(tdee - 250),
      loss: Math.round(tdee - 500),
      mildGain: Math.round(tdee + 250),
      gain: Math.round(tdee + 500),
    };
  }, [unit, sex, age, height, weight, activity]);

  const fmt = useMemo(() => new Intl.NumberFormat(locale), [locale]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        <div className="inline-flex rounded-md border border-slate-300 dark:border-slate-700">
          <button onClick={() => setUnit("metric")} className={`px-3 py-1.5 text-sm ${unit === "metric" ? "bg-brand-600 text-white" : ""}`}>
            {t("unit.metric")}
          </button>
          <button onClick={() => setUnit("imperial")} className={`px-3 py-1.5 text-sm ${unit === "imperial" ? "bg-brand-600 text-white" : ""}`}>
            {t("unit.imperial")}
          </button>
        </div>
        <div className="inline-flex rounded-md border border-slate-300 dark:border-slate-700">
          <button onClick={() => setSex("male")} className={`px-3 py-1.5 text-sm ${sex === "male" ? "bg-brand-600 text-white" : ""}`}>
            {t("sex.male")}
          </button>
          <button onClick={() => setSex("female")} className={`px-3 py-1.5 text-sm ${sex === "female" ? "bg-brand-600 text-white" : ""}`}>
            {t("sex.female")}
          </button>
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

      <label className="mt-3 block">
        <span className="text-sm font-medium">{t("input.activity")}</span>
        <select value={activity} onChange={(e) => setActivity(e.target.value as Activity)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
          {(["sedentary", "light", "moderate", "active", "veryActive"] as Activity[]).map((a) => (
            <option key={a} value={a}>
              {t(`activity.${a}`)}
            </option>
          ))}
        </select>
      </label>

      <div aria-live="polite" className={`mt-6 rounded-lg border p-4 ${result ? "border-brand-200 bg-brand-50 dark:border-brand-900 dark:bg-brand-900/20" : "border-slate-200 dark:border-slate-800"}`}>
        {result ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <div className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">{t("result.bmr")}</div>
                <div className="mt-1 text-3xl font-bold tabular-nums">{fmt.format(result.bmr)} <span className="text-sm font-normal text-slate-600 dark:text-slate-400">{t("unit.kcalDay")}</span></div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">{t("result.tdee")}</div>
                <div className="mt-1 text-3xl font-bold tabular-nums">{fmt.format(result.tdee)} <span className="text-sm font-normal text-slate-600 dark:text-slate-400">{t("unit.kcalDay")}</span></div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
              <div className="rounded border border-slate-200 px-2 py-1 dark:border-slate-800"><div className="text-xs text-slate-600 dark:text-slate-400">{t("result.loss")}</div><div className="tabular-nums">{fmt.format(result.loss)}</div></div>
              <div className="rounded border border-slate-200 px-2 py-1 dark:border-slate-800"><div className="text-xs text-slate-600 dark:text-slate-400">{t("result.mildLoss")}</div><div className="tabular-nums">{fmt.format(result.mildLoss)}</div></div>
              <div className="rounded border border-slate-200 px-2 py-1 dark:border-slate-800"><div className="text-xs text-slate-600 dark:text-slate-400">{t("result.mildGain")}</div><div className="tabular-nums">{fmt.format(result.mildGain)}</div></div>
              <div className="rounded border border-slate-200 px-2 py-1 dark:border-slate-800"><div className="text-xs text-slate-600 dark:text-slate-400">{t("result.gain")}</div><div className="tabular-nums">{fmt.format(result.gain)}</div></div>
            </div>
          </>
        ) : (
          <div className="text-sm text-slate-600 dark:text-slate-400">{t("empty")}</div>
        )}
      </div>

      <DraftNotice
        draft={draft}
        privacyNote={t("draft.privacyNote")}
        restoredLabel={t("draft.restored")}
        clearLabel={t("draft.clear")}
      />
    </div>
  );
}
