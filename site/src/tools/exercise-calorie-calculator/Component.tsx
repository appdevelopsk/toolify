"use client";

import { useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";

type WeightUnit = "kg" | "lbs";

const ACTIVITIES: { key: string; met: number }[] = [
  { key: "walkingModerate", met: 4.3 },
  { key: "running", met: 10.0 },
  { key: "cycling", met: 8.0 },
  { key: "swimming", met: 7.0 },
  { key: "jumpRope", met: 11.0 },
  { key: "yoga", met: 2.5 },
  { key: "weightTraining", met: 5.0 },
  { key: "hiit", met: 8.0 },
  { key: "dancing", met: 5.0 },
  { key: "walkingSlow", met: 2.5 },
  { key: "hiking", met: 6.0 },
  { key: "rowing", met: 7.0 },
  { key: "elliptical", met: 5.0 },
  { key: "pilates", met: 3.0 },
  { key: "basketball", met: 8.0 },
  { key: "soccer", met: 10.0 },
  { key: "tennis", met: 7.3 },
  { key: "gardening", met: 3.5 },
];

export default function ExerciseCalorieCalculator() {
  const t = useTranslations("tools.exercise-calorie-calculator");
  const locale = useLocale();
  const [unit, setUnit] = useState<WeightUnit>("kg");
  const [weight, setWeight] = useState("");
  const [duration, setDuration] = useState("");
  const [activityKey, setActivityKey] = useState("walkingModerate");

  const result = useMemo(() => {
    const w = parseFloat(weight);
    const d = parseFloat(duration);
    if (!isFinite(w) || !isFinite(d) || w <= 0 || d <= 0) return null;
    const weightKg = unit === "lbs" ? w * 0.45359237 : w;
    const activity = ACTIVITIES.find((a) => a.key === activityKey);
    if (!activity) return null;
    const durationHours = d / 60;
    const calories = activity.met * weightKg * durationHours;
    const fatGrams = calories / 9;
    const perMinute = calories / d;
    return { calories, fatGrams, perMinute };
  }, [weight, duration, activityKey, unit]);

  const fmt = useMemo(
    () => new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }),
    [locale]
  );

  return (
    <div>
      <div className="mb-4 inline-flex rounded-md border border-slate-300 dark:border-slate-700">
        <button
          onClick={() => setUnit("kg")}
          className={`px-3 py-1.5 text-sm ${unit === "kg" ? "bg-brand-600 text-white" : ""}`}
        >
          {t("input.unitKg")}
        </button>
        <button
          onClick={() => setUnit("lbs")}
          className={`px-3 py-1.5 text-sm ${unit === "lbs" ? "bg-brand-600 text-white" : ""}`}
        >
          {t("input.unitLbs")}
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">
            {t("input.weight")} ({unit === "kg" ? t("input.unitKg") : t("input.unitLbs")})
          </span>
          <input
            inputMode="decimal"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
            placeholder={unit === "kg" ? "70" : "154"}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">
            {t("input.duration")} (min)
          </span>
          <input
            inputMode="decimal"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
            placeholder="30"
          />
        </label>
      </div>

      <label className="mt-4 block">
        <span className="text-sm font-medium">{t("input.activity")}</span>
        <select
          value={activityKey}
          onChange={(e) => setActivityKey(e.target.value)}
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
        >
          {ACTIVITIES.map((a) => (
            <option key={a.key} value={a.key}>
              {t(`activities.${a.key}`)} (MET {a.met})
            </option>
          ))}
        </select>
      </label>

      <div
        aria-live="polite"
        className={`mt-6 rounded-lg border p-4 ${
          result !== null
            ? "border-brand-200 bg-brand-50 dark:border-brand-900 dark:bg-brand-900/20"
            : "border-slate-200 dark:border-slate-800"
        }`}
      >
        {result !== null ? (
          <dl className="grid gap-4 sm:grid-cols-3">
            <div>
              <dt className="text-sm text-slate-600 dark:text-slate-400">
                {t("result.calories")}
              </dt>
              <dd className="mt-1 text-3xl font-bold tabular-nums">
                {fmt.format(result.calories)}
                <span className="ml-1 text-base font-normal">{t("unit.kcal")}</span>
              </dd>
            </div>
            <div>
              <dt className="text-sm text-slate-600 dark:text-slate-400">
                {t("result.fatBurned")}
              </dt>
              <dd className="mt-1 text-3xl font-bold tabular-nums">
                {fmt.format(result.fatGrams)}
                <span className="ml-1 text-base font-normal">{t("unit.g")}</span>
              </dd>
            </div>
            <div>
              <dt className="text-sm text-slate-600 dark:text-slate-400">
                {t("result.perMinute")}
              </dt>
              <dd className="mt-1 text-3xl font-bold tabular-nums">
                {fmt.format(result.perMinute)}
                <span className="ml-1 text-base font-normal">{t("unit.kcal")}/min</span>
              </dd>
            </div>
          </dl>
        ) : (
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {t("result.empty")}
          </div>
        )}
      </div>
    </div>
  );
}
