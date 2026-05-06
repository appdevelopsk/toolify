"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

type Mode = "fromTime" | "fromPace";
type Unit = "metric" | "imperial";

const MILE_KM = 1.609344;

function toSec(h: string, m: string, s: string): number | null {
  const H = parseInt(h, 10) || 0;
  const M = parseInt(m, 10) || 0;
  const S = parseInt(s, 10) || 0;
  const total = H * 3600 + M * 60 + S;
  return total > 0 ? total : null;
}

function fmtTime(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.round(sec % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function PaceCalculator() {
  const t = useTranslations("tools.pace-calculator");
  const locale = useLocale();
  const [mode, setMode] = useState<Mode>("fromTime");
  const [unit, setUnit] = useState<Unit>(locale === "en" ? "imperial" : "metric");
  const [distance, setDistance] = useState("5");
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("25");
  const [seconds, setSeconds] = useState("0");
  const [paceMin, setPaceMin] = useState("5");
  const [paceSec, setPaceSec] = useState("0");

  const result = useMemo(() => {
    const d = parseFloat(distance);
    if (!isFinite(d) || d <= 0) return null;
    const km = unit === "metric" ? d : d * MILE_KM;
    if (mode === "fromTime") {
      const totalSec = toSec(hours, minutes, seconds);
      if (totalSec === null) return null;
      const pacePerKm = totalSec / km;
      const pacePerMile = pacePerKm * MILE_KM;
      const speedKmh = (km / totalSec) * 3600;
      const speedMph = speedKmh / MILE_KM;
      return { totalSec, pacePerKm, pacePerMile, speedKmh, speedMph };
    } else {
      const pSec = (parseInt(paceMin, 10) || 0) * 60 + (parseInt(paceSec, 10) || 0);
      if (pSec <= 0) return null;
      const pacePerKm = unit === "metric" ? pSec : pSec / MILE_KM;
      const pacePerMile = pacePerKm * MILE_KM;
      const totalSec = pacePerKm * km;
      const speedKmh = 3600 / pacePerKm;
      const speedMph = speedKmh / MILE_KM;
      return { totalSec, pacePerKm, pacePerMile, speedKmh, speedMph };
    }
  }, [mode, unit, distance, hours, minutes, seconds, paceMin, paceSec]);

  const fmt = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }), [locale]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        <div className="inline-flex rounded-md border border-slate-300 dark:border-slate-700">
          <button onClick={() => setMode("fromTime")} className={`px-3 py-1.5 text-sm ${mode === "fromTime" ? "bg-brand-600 text-white" : ""}`}>{t("mode.fromTime")}</button>
          <button onClick={() => setMode("fromPace")} className={`px-3 py-1.5 text-sm ${mode === "fromPace" ? "bg-brand-600 text-white" : ""}`}>{t("mode.fromPace")}</button>
        </div>
        <div className="inline-flex rounded-md border border-slate-300 dark:border-slate-700">
          <button onClick={() => setUnit("metric")} className={`px-3 py-1.5 text-sm ${unit === "metric" ? "bg-brand-600 text-white" : ""}`}>{t("unit.metric")}</button>
          <button onClick={() => setUnit("imperial")} className={`px-3 py-1.5 text-sm ${unit === "imperial" ? "bg-brand-600 text-white" : ""}`}>{t("unit.imperial")}</button>
        </div>
      </div>

      <label className="block">
        <span className="text-sm font-medium">{t("input.distance")} ({unit === "metric" ? "km" : "mi"})</span>
        <input inputMode="decimal" value={distance} onChange={(e) => setDistance(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
      </label>

      {mode === "fromTime" ? (
        <div className="mt-3 grid grid-cols-3 gap-2">
          <label className="block">
            <span className="text-xs uppercase text-slate-500">h</span>
            <input inputMode="numeric" value={hours} onChange={(e) => setHours(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-center font-mono dark:border-slate-700 dark:bg-slate-900" />
          </label>
          <label className="block">
            <span className="text-xs uppercase text-slate-500">m</span>
            <input inputMode="numeric" value={minutes} onChange={(e) => setMinutes(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-center font-mono dark:border-slate-700 dark:bg-slate-900" />
          </label>
          <label className="block">
            <span className="text-xs uppercase text-slate-500">s</span>
            <input inputMode="numeric" value={seconds} onChange={(e) => setSeconds(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-center font-mono dark:border-slate-700 dark:bg-slate-900" />
          </label>
        </div>
      ) : (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <label className="block">
            <span className="text-xs uppercase text-slate-500">{t("paceMin", { unit: unit === "metric" ? "km" : "mi" })}</span>
            <input inputMode="numeric" value={paceMin} onChange={(e) => setPaceMin(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-center font-mono dark:border-slate-700 dark:bg-slate-900" />
          </label>
          <label className="block">
            <span className="text-xs uppercase text-slate-500">s</span>
            <input inputMode="numeric" value={paceSec} onChange={(e) => setPaceSec(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-center font-mono dark:border-slate-700 dark:bg-slate-900" />
          </label>
        </div>
      )}

      <div aria-live="polite" className={`mt-6 rounded-lg border p-4 ${result ? "border-brand-200 bg-brand-50 dark:border-brand-900 dark:bg-brand-900/20" : "border-slate-200 dark:border-slate-800"}`}>
        {result ? (
          <dl className="grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-wider text-slate-500">{t("result.totalTime")}</dt>
              <dd className="mt-1 text-3xl font-bold tabular-nums">{fmtTime(result.totalSec)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-slate-500">{t("result.paceKm")}</dt>
              <dd className="mt-1 text-2xl font-bold tabular-nums">{fmtTime(result.pacePerKm)} <span className="text-sm font-normal text-slate-500">/ km</span></dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-slate-500">{t("result.paceMile")}</dt>
              <dd className="mt-1 text-2xl font-bold tabular-nums">{fmtTime(result.pacePerMile)} <span className="text-sm font-normal text-slate-500">/ mi</span></dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-slate-500">{t("result.speed")}</dt>
              <dd className="mt-1 text-2xl font-bold tabular-nums">
                {fmt.format(result.speedKmh)} <span className="text-sm font-normal text-slate-500">km/h</span>
                {" · "}
                {fmt.format(result.speedMph)} <span className="text-sm font-normal text-slate-500">mph</span>
              </dd>
            </div>
          </dl>
        ) : (
          <div className="text-sm text-slate-500">{t("empty")}</div>
        )}
      </div>
    </div>
  );
}
