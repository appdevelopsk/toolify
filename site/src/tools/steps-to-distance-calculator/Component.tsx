"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

type Unit = "metric" | "imperial";
type StrideMethod = "height" | "custom";
type Gender = "male" | "female" | "other";

const STRIDE_RATIO: Record<Gender, number> = {
  male: 0.415,
  female: 0.413,
  other: 0.414,
};

const STEPS_PER_MIN = 100;

function estimateStrideCm(heightCm: number, gender: Gender): number {
  return heightCm * STRIDE_RATIO[gender];
}

function inchesToCm(inches: number): number {
  return inches * 2.54;
}

function cmToMeters(cm: number): number {
  return cm / 100;
}

function metersToKm(m: number): number {
  return m / 1000;
}

function metersToMiles(m: number): number {
  return m / 1609.344;
}

export default function StepsToDistanceCalculator() {
  const t = useTranslations("tools.steps-to-distance-calculator");
  const locale = useLocale();

  const [steps, setSteps] = useState("");
  const [unit, setUnit] = useState<Unit>(locale === "en" ? "imperial" : "metric");
  const [strideMethod, setStrideMethod] = useState<StrideMethod>("height");
  const [gender, setGender] = useState<Gender>("other");
  const [height, setHeight] = useState("");
  const [strideLength, setStrideLength] = useState("");
  const [weight, setWeight] = useState("");

  const result = useMemo(() => {
    const stepsNum = parseFloat(steps);
    if (!isFinite(stepsNum) || stepsNum <= 0) return null;

    let strideCm: number;

    if (strideMethod === "height") {
      const heightVal = parseFloat(height);
      if (!isFinite(heightVal) || heightVal <= 0) return null;
      const heightCm = unit === "imperial" ? inchesToCm(heightVal) : heightVal;
      strideCm = estimateStrideCm(heightCm, gender);
    } else {
      const strideVal = parseFloat(strideLength);
      if (!isFinite(strideVal) || strideVal <= 0) return null;
      strideCm = unit === "imperial" ? inchesToCm(strideVal) : strideVal;
    }

    const distanceMeters = stepsNum * cmToMeters(strideCm);

    const distanceDisplay =
      unit === "metric" ? metersToKm(distanceMeters) : metersToMiles(distanceMeters);

    const distanceUnit = unit === "metric" ? "km" : "mi";

    const minutesWalked = stepsNum / STEPS_PER_MIN;
    const hoursWalked = Math.floor(minutesWalked / 60);
    const remainingMinutes = Math.round(minutesWalked % 60);

    // Calorie estimation: MET for walking ≈ 3.5
    // calories = MET × weight_kg × duration_hours
    const weightKg = (() => {
      const w = parseFloat(weight);
      if (!isFinite(w) || w <= 0) return 70; // default 70 kg
      return unit === "imperial" ? w * 0.453592 : w;
    })();

    const calories = Math.round(3.5 * weightKg * (minutesWalked / 60));

    return {
      distanceDisplay,
      distanceUnit,
      strideCm: Math.round(strideCm * 10) / 10,
      strideDisplay: unit === "imperial" ? Math.round((strideCm / 2.54) * 10) / 10 : Math.round(strideCm * 10) / 10,
      strideUnit: unit === "imperial" ? "in" : "cm",
      hoursWalked,
      remainingMinutes,
      calories,
      weightKg,
    };
  }, [steps, unit, strideMethod, gender, height, strideLength, weight]);

  const fmt = useMemo(
    () => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }),
    [locale]
  );

  const heightUnit = unit === "metric" ? "cm" : "in";
  const weightUnit = unit === "metric" ? "kg" : "lb";

  return (
    <div>
      <div className="mb-4 inline-flex rounded-md border border-slate-300 dark:border-slate-700">
        <button
          onClick={() => setUnit("metric")}
          className={`px-3 py-1.5 text-sm ${unit === "metric" ? "bg-brand-600 text-white" : ""}`}
        >
          {t("units.metric")}
        </button>
        <button
          onClick={() => setUnit("imperial")}
          className={`px-3 py-1.5 text-sm ${unit === "imperial" ? "bg-brand-600 text-white" : ""}`}
        >
          {t("units.imperial")}
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">{t("input.steps")}</span>
          <input
            inputMode="numeric"
            value={steps}
            onChange={(e) => setSteps(e.target.value)}
            placeholder="10000"
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">{t("input.gender")}</span>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value as Gender)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          >
            <option value="male">{t("genders.male")}</option>
            <option value="female">{t("genders.female")}</option>
            <option value="other">{t("genders.other")}</option>
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium">{t("input.strideMethod")}</span>
          <select
            value={strideMethod}
            onChange={(e) => setStrideMethod(e.target.value as StrideMethod)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          >
            <option value="height">{t("strideMethods.height")}</option>
            <option value="custom">{t("strideMethods.custom")}</option>
          </select>
        </label>

        {strideMethod === "height" ? (
          <label className="block">
            <span className="text-sm font-medium">
              {t("input.height")} ({heightUnit})
            </span>
            <input
              inputMode="decimal"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder={unit === "metric" ? "170" : "67"}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
            />
          </label>
        ) : (
          <label className="block">
            <span className="text-sm font-medium">
              {t("input.strideLength")} ({heightUnit})
            </span>
            <input
              inputMode="decimal"
              value={strideLength}
              onChange={(e) => setStrideLength(e.target.value)}
              placeholder={unit === "metric" ? "75" : "30"}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
            />
          </label>
        )}

        <label className="block">
          <span className="text-sm font-medium">
            {t("input.weight")} ({weightUnit}){" "}
            <span className="font-normal text-slate-500 dark:text-slate-400">
              (optional, default {unit === "metric" ? "70 kg" : "154 lb"})
            </span>
          </span>
          <input
            inputMode="decimal"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder={unit === "metric" ? "70" : "154"}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          />
        </label>
      </div>

      <div
        aria-live="polite"
        className={`mt-6 rounded-lg border p-4 ${
          result
            ? "border-brand-200 bg-brand-50 dark:border-brand-900 dark:bg-brand-900/20"
            : "border-slate-200 dark:border-slate-800"
        }`}
      >
        {result ? (
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">
                {t("result.distance")}
              </dt>
              <dd className="mt-1 text-3xl font-bold tabular-nums">
                {fmt.format(result.distanceDisplay)}{" "}
                <span className="text-lg font-normal">{result.distanceUnit}</span>
              </dd>
            </div>

            <div>
              <dt className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">
                {t("result.time")}
              </dt>
              <dd className="mt-1 text-2xl font-bold tabular-nums">
                {result.hoursWalked > 0 && (
                  <span>
                    {result.hoursWalked}
                    <span className="text-base font-normal"> h </span>
                  </span>
                )}
                {result.remainingMinutes}
                <span className="text-base font-normal"> min</span>
              </dd>
            </div>

            <div>
              <dt className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">
                {t("result.calories")}
              </dt>
              <dd className="mt-1 text-2xl font-bold tabular-nums">
                {fmt.format(result.calories)}{" "}
                <span className="text-base font-normal">kcal</span>
              </dd>
            </div>

            <div>
              <dt className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">
                {t("result.strideUsed")}
              </dt>
              <dd className="mt-1 text-2xl font-bold tabular-nums">
                {fmt.format(result.strideDisplay)}{" "}
                <span className="text-base font-normal">{result.strideUnit}</span>
              </dd>
            </div>
          </dl>
        ) : (
          <p className="text-sm text-slate-600 dark:text-slate-400">{t("empty")}</p>
        )}
      </div>
    </div>
  );
}
