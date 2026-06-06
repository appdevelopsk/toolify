"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

type Cat = "underweight" | "normal" | "overweight" | "obese";
type Range = [number, number];

// IOM/NASEM 2009 total recommended gain (kg). Twins ranges are provisional.
const TOTAL: Record<"single" | "twins", Record<Cat, Range>> = {
  single: { underweight: [12.5, 18], normal: [11.5, 16], overweight: [7, 11.5], obese: [5, 9] },
  twins: { underweight: [16.8, 24.5], normal: [16.8, 24.5], overweight: [14.1, 22.7], obese: [11.3, 19.1] },
};
// Singleton 2nd/3rd-trimester weekly rate (kg/week).
const WEEKLY_SINGLE: Record<Cat, Range> = {
  underweight: [0.44, 0.58], normal: [0.35, 0.5], overweight: [0.23, 0.33], obese: [0.17, 0.27],
};
const FIRST_TRI: Range = [0.5, 2]; // total gain by end of week 13 (kg)

function kg(n: number) {
  return n;
}
function lb(n: number) {
  return n * 2.2046226;
}
function fmtRange(r: Range, unit: "kg" | "lb") {
  const conv = unit === "kg" ? kg : lb;
  return `${conv(r[0]).toFixed(1)}–${conv(r[1]).toFixed(1)} ${unit}`;
}

export default function PregnancyWeightGainCalculator() {
  const t = useTranslations("tools.pregnancy-weight-gain-calculator");
  const [units, setUnits] = useState<"metric" | "imperial">("metric");
  const [weight, setWeight] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [heightFt, setHeightFt] = useState("");
  const [heightIn, setHeightIn] = useState("");
  const [week, setWeek] = useState("20");
  const [current, setCurrent] = useState("");
  const [type, setType] = useState<"single" | "twins">("single");

  const result = useMemo(() => {
    const w = parseFloat(weight);
    if (!isFinite(w) || w <= 0) return null;
    const preKg = units === "metric" ? w : w * 0.4535924;

    let hM: number;
    if (units === "metric") {
      const cm = parseFloat(heightCm);
      if (!isFinite(cm) || cm < 120 || cm > 230) return null;
      hM = cm / 100;
    } else {
      const ft = parseFloat(heightFt) || 0;
      const inch = parseFloat(heightIn) || 0;
      const totalIn = ft * 12 + inch;
      if (totalIn < 48 || totalIn > 90) return null;
      hM = totalIn * 0.0254;
    }
    const bmi = preKg / (hM * hM);
    const cat: Cat = bmi < 18.5 ? "underweight" : bmi < 25 ? "normal" : bmi < 30 ? "overweight" : "obese";

    const total = TOTAL[type][cat];
    const weekly: Range = type === "single"
      ? WEEKLY_SINGLE[cat]
      : [(total[0] - FIRST_TRI[1]) / 27, (total[1] - FIRST_TRI[0]) / 27];

    const wk = parseInt(week, 10);
    let byWeek: Range | null = null;
    if (isFinite(wk) && wk >= 1 && wk <= 42) {
      if (wk <= 13) byWeek = [FIRST_TRI[0] * (wk / 13), FIRST_TRI[1] * (wk / 13)];
      else byWeek = [FIRST_TRI[0] + weekly[0] * (wk - 13), FIRST_TRI[1] + weekly[1] * (wk - 13)];
    }

    let status: "below" | "onTrack" | "above" | null = null;
    let gainKg: number | null = null;
    const cur = parseFloat(current);
    if (isFinite(cur) && cur > 0 && byWeek) {
      const curKg = units === "metric" ? cur : cur * 0.4535924;
      gainKg = curKg - preKg;
      status = gainKg < byWeek[0] ? "below" : gainKg > byWeek[1] ? "above" : "onTrack";
    }

    return { bmi, cat, total, byWeek, status, gainKg };
  }, [weight, heightCm, heightFt, heightIn, week, current, units, type]);

  const u: "kg" | "lb" = units === "metric" ? "kg" : "lb";
  const inputBox = "mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900";

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        <div className="inline-flex rounded-md border border-slate-300 p-1 dark:border-slate-700">
          {(["metric", "imperial"] as const).map((m) => (
            <button key={m} onClick={() => setUnits(m)} className={`rounded px-3 py-1.5 text-sm ${units === m ? "bg-brand-600 text-white" : ""}`}>
              {t(`units.${m}`)}
            </button>
          ))}
        </div>
        <div className="inline-flex rounded-md border border-slate-300 p-1 dark:border-slate-700">
          {(["single", "twins"] as const).map((m) => (
            <button key={m} onClick={() => setType(m)} className={`rounded px-3 py-1.5 text-sm ${type === m ? "bg-brand-600 text-white" : ""}`}>
              {t(`type.${m}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">{t("input.prePregWeight")} ({u})</span>
          <input type="number" min={1} value={weight} onChange={(e) => setWeight(e.target.value)} className={inputBox} />
        </label>
        {units === "metric" ? (
          <label className="block">
            <span className="text-sm font-medium">{t("input.height")} (cm)</span>
            <input type="number" min={120} max={230} value={heightCm} onChange={(e) => setHeightCm(e.target.value)} className={inputBox} />
          </label>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="text-sm font-medium">{t("input.heightFt")} (ft)</span>
              <input type="number" min={4} max={7} value={heightFt} onChange={(e) => setHeightFt(e.target.value)} className={inputBox} />
            </label>
            <label className="block">
              <span className="text-sm font-medium">{t("input.heightIn")} (in)</span>
              <input type="number" min={0} max={11} value={heightIn} onChange={(e) => setHeightIn(e.target.value)} className={inputBox} />
            </label>
          </div>
        )}
        <label className="block">
          <span className="text-sm font-medium">{t("input.week")}</span>
          <input type="number" min={1} max={42} value={week} onChange={(e) => setWeek(e.target.value)} className={inputBox} />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.currentWeight")} ({u})</span>
          <input type="number" min={1} value={current} onChange={(e) => setCurrent(e.target.value)} className={inputBox} />
        </label>
      </div>

      <div aria-live="polite" className="mt-6 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
        {result ? (
          <>
            <div className="flex flex-wrap items-baseline gap-x-4">
              <div>
                <span className="text-xs uppercase tracking-wider text-slate-500">{t("result.bmi")}</span>{" "}
                <span className="text-xl font-bold tabular-nums">{result.bmi.toFixed(1)}</span>
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider text-slate-500">{t("result.category")}</span>{" "}
                <span className="font-medium">{t(`category.${result.cat}`)}</span>
              </div>
            </div>

            <dl className="mt-4 grid gap-2 text-sm">
              <div className="flex justify-between rounded bg-emerald-50 px-3 py-2 dark:bg-emerald-900/20">
                <dt className="font-medium">{t("result.totalGain")}</dt>
                <dd className="tabular-nums">{fmtRange(result.total, u)}</dd>
              </div>
              {result.byWeek && (
                <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800">
                  <dt>{t("result.gainByWeek")}</dt>
                  <dd className="tabular-nums">{fmtRange(result.byWeek, u)}</dd>
                </div>
              )}
              {result.gainKg !== null && (
                <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800">
                  <dt>{t("result.yourGain")}</dt>
                  <dd className="tabular-nums">{(u === "kg" ? result.gainKg : result.gainKg * 2.2046226).toFixed(1)} {u}</dd>
                </div>
              )}
            </dl>

            {result.status && (
              <p className={`mt-3 rounded px-3 py-2 text-sm font-medium ${
                result.status === "onTrack"
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200"
                  : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200"
              }`}>
                {t(`status.${result.status}`)}
              </p>
            )}

            <p className="mt-3 text-xs text-slate-600 dark:text-slate-400">{t("note")}</p>
          </>
        ) : (
          <div className="text-sm text-slate-600 dark:text-slate-400">{t("empty")}</div>
        )}
      </div>
    </div>
  );
}
