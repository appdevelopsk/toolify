"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

type Unit = "metric" | "imperial";
type Sex = "male" | "female";

// kg/week loss goals in metric; converted to lbs for imperial display
const METRIC_GOALS = [0.25, 0.5, 0.75, 1.0] as const;
const IMPERIAL_GOALS = [0.5, 1.0, 1.5, 2.0] as const; // lbs/week

const SAFE_MIN: Record<Sex, number> = { male: 1500, female: 1200 };

function bmrMifflin(sex: Sex, weightKg: number, heightCm: number, age: number): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === "male" ? base + 5 : base - 161;
}

export default function CalorieDeficitCalculator() {
  const t = useTranslations("tools.calorie-deficit-calculator");
  const locale = useLocale();

  const [unit, setUnit] = useState<Unit>(locale === "en" ? "imperial" : "metric");
  const [sex, setSex] = useState<Sex>("male");
  const [age, setAge] = useState("30");
  const [heightCm, setHeightCm] = useState("");
  const [heightFt, setHeightFt] = useState("");
  const [heightIn, setHeightIn] = useState("");
  const [weight, setWeight] = useState("");
  const [activity, setActivity] = useState(1.55);
  // goal stored as kg/week regardless of unit
  const [goalKgPerWeek, setGoalKgPerWeek] = useState(0.5);
  const [targetWeight, setTargetWeight] = useState("");

  const fmt = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }), [locale]);
  const fmtDec = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }), [locale]);

  // Convert imperial goal selection (lbs/week) back to kg/week
  function handleGoalChange(value: string) {
    const parsed = parseFloat(value);
    if (!isFinite(parsed)) return;
    // imperial goals are stored as lbs/week; convert to kg
    setGoalKgPerWeek(unit === "imperial" ? parsed * 0.45359237 : parsed);
  }

  const result = useMemo(() => {
    const a = parseFloat(age);
    const w = parseFloat(weight);
    if (!isFinite(a) || a <= 0 || !isFinite(w) || w <= 0) return null;

    let resolvedHeightCm: number;
    if (unit === "metric") {
      resolvedHeightCm = parseFloat(heightCm);
    } else {
      const ft = parseFloat(heightFt) || 0;
      const inches = parseFloat(heightIn) || 0;
      resolvedHeightCm = (ft * 12 + inches) * 2.54;
    }
    if (!isFinite(resolvedHeightCm) || resolvedHeightCm <= 0) return null;

    const weightKg = unit === "metric" ? w : w * 0.45359237;

    const bmr = Math.round(bmrMifflin(sex, weightKg, resolvedHeightCm, a));
    const tdee = Math.round(bmr * activity);

    // Weekly deficit: 1 kg fat ≈ 7700 kcal
    const weeklyDeficitKcal = goalKgPerWeek * 7700;
    const dailyDeficit = Math.round(weeklyDeficitKcal / 7);
    const rawTarget = tdee - dailyDeficit;
    const safeMin = SAFE_MIN[sex];
    const targetCalories = Math.max(rawTarget, safeMin);
    const belowSafe = rawTarget < safeMin;

    // Weeks to goal (optional)
    let weeksToGoal: number | null = null;
    const tw = parseFloat(targetWeight);
    if (isFinite(tw) && tw > 0) {
      const currentKg = weightKg;
      const targetKg = unit === "metric" ? tw : tw * 0.45359237;
      const diffKg = currentKg - targetKg;
      if (diffKg > 0 && goalKgPerWeek > 0) {
        weeksToGoal = diffKg / goalKgPerWeek;
      }
    }

    return { bmr, tdee, dailyDeficit, targetCalories, belowSafe, safeMin, weeksToGoal };
  }, [unit, sex, age, heightCm, heightFt, heightIn, weight, activity, goalKgPerWeek, targetWeight]);

  // Current goal display value for the select
  const goalSelectValue = unit === "imperial"
    ? String(Math.round((goalKgPerWeek / 0.45359237) * 10) / 10)
    : String(goalKgPerWeek);

  return (
    <div>
      {/* Unit / Sex toggles */}
      <div className="mb-4 flex flex-wrap gap-2">
        <div className="inline-flex rounded-md border border-slate-300 dark:border-slate-700">
          <button
            onClick={() => setUnit("metric")}
            className={`px-3 py-1.5 text-sm ${unit === "metric" ? "bg-brand-600 text-white" : ""}`}
          >
            {t("unit.metric")}
          </button>
          <button
            onClick={() => setUnit("imperial")}
            className={`px-3 py-1.5 text-sm ${unit === "imperial" ? "bg-brand-600 text-white" : ""}`}
          >
            {t("unit.imperial")}
          </button>
        </div>
        <div className="inline-flex rounded-md border border-slate-300 dark:border-slate-700">
          <button
            onClick={() => setSex("male")}
            className={`px-3 py-1.5 text-sm ${sex === "male" ? "bg-brand-600 text-white" : ""}`}
          >
            {t("sex.male")}
          </button>
          <button
            onClick={() => setSex("female")}
            className={`px-3 py-1.5 text-sm ${sex === "female" ? "bg-brand-600 text-white" : ""}`}
          >
            {t("sex.female")}
          </button>
        </div>
      </div>

      {/* Age + Height + Weight */}
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block">
          <span className="text-sm font-medium">{t("input.age")}</span>
          <input
            inputMode="numeric"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          />
        </label>

        {unit === "metric" ? (
          <label className="block">
            <span className="text-sm font-medium">{t("input.height")} (cm)</span>
            <input
              inputMode="decimal"
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
            />
          </label>
        ) : (
          <div className="block">
            <span className="text-sm font-medium">{t("input.height")}</span>
            <div className="mt-1 flex gap-2">
              <input
                inputMode="numeric"
                placeholder="ft"
                value={heightFt}
                onChange={(e) => setHeightFt(e.target.value)}
                className="w-1/2 rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
              />
              <input
                inputMode="decimal"
                placeholder="in"
                value={heightIn}
                onChange={(e) => setHeightIn(e.target.value)}
                className="w-1/2 rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
              />
            </div>
          </div>
        )}

        <label className="block">
          <span className="text-sm font-medium">
            {t("input.weight")} ({unit === "metric" ? "kg" : "lb"})
          </span>
          <input
            inputMode="decimal"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          />
        </label>
      </div>

      {/* Activity + Goal */}
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">{t("input.activity")}</span>
          <select
            value={activity}
            onChange={(e) => setActivity(parseFloat(e.target.value))}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          >
            <option value={1.2}>{t("activity.sedentary")}</option>
            <option value={1.375}>{t("activity.light")}</option>
            <option value={1.55}>{t("activity.moderate")}</option>
            <option value={1.725}>{t("activity.active")}</option>
            <option value={1.9}>{t("activity.veryActive")}</option>
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium">{t("input.goal")}</span>
          <select
            value={goalSelectValue}
            onChange={(e) => handleGoalChange(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          >
            {unit === "metric"
              ? METRIC_GOALS.map((g) => (
                  <option key={g} value={String(g)}>
                    {t(`goal.kg_${String(g).replace(".", "_")}`)}
                  </option>
                ))
              : IMPERIAL_GOALS.map((g) => (
                  <option key={g} value={String(g)}>
                    {t(`goal.lbs_${String(g).replace(".", "_")}`)}
                  </option>
                ))}
          </select>
        </label>
      </div>

      {/* Optional target weight */}
      <div className="mt-3">
        <label className="block">
          <span className="text-sm font-medium">
            {t("input.targetWeight")} ({unit === "metric" ? "kg" : "lb"}) —{" "}
            <span className="font-normal text-slate-500">{t("input.targetWeightHint")}</span>
          </span>
          <input
            inputMode="decimal"
            value={targetWeight}
            onChange={(e) => setTargetWeight(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900 sm:w-48"
          />
        </label>
      </div>

      {/* Results */}
      <div
        aria-live="polite"
        className={`mt-6 rounded-lg border p-4 ${
          result
            ? "border-brand-200 bg-brand-50 dark:border-brand-900 dark:bg-brand-900/20"
            : "border-slate-200 dark:border-slate-800"
        }`}
      >
        {result ? (
          <>
            {/* Safety warning */}
            {result.belowSafe && (
              <div className="mb-4 rounded border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-200">
                {t("result.safetyWarning", { min: fmt.format(result.safeMin) })}
              </div>
            )}

            {/* Primary: Target calories */}
            <div className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">
              {t("result.targetCalories")}
            </div>
            <div className="mt-1 text-4xl font-bold tabular-nums">
              {fmt.format(result.targetCalories)}{" "}
              <span className="text-base font-normal text-slate-600 dark:text-slate-400">kcal/day</span>
            </div>

            {/* Secondary stats grid */}
            <dl className="mt-4 grid gap-3 sm:grid-cols-3">
              <StatCard
                label={t("result.bmr")}
                value={`${fmt.format(result.bmr)} kcal`}
                color="bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
              />
              <StatCard
                label={t("result.tdee")}
                value={`${fmt.format(result.tdee)} kcal`}
                color="bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-200"
              />
              <StatCard
                label={t("result.dailyDeficit")}
                value={`−${fmt.format(result.dailyDeficit)} kcal`}
                color="bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-200"
              />
            </dl>

            {/* Weeks to goal */}
            {result.weeksToGoal !== null && (
              <div className="mt-4 rounded bg-emerald-100 px-4 py-3 text-sm text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-200">
                {t("result.weeksToGoal", { weeks: fmtDec.format(result.weeksToGoal) })}
              </div>
            )}
          </>
        ) : (
          <div className="text-sm text-slate-600 dark:text-slate-400">{t("empty")}</div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className={`rounded p-3 ${color}`}>
      <dt className="text-xs font-medium uppercase tracking-wider">{label}</dt>
      <dd className="mt-1 text-xl font-bold tabular-nums">{value}</dd>
    </div>
  );
}
