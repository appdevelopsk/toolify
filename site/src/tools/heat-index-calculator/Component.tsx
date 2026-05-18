"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

type Unit = "metric" | "imperial";

interface HeatIndexResult {
  heatIndex: number;
  difference: number;
  dangerKey: "safe" | "caution" | "extremeCaution" | "danger" | "extremeDanger";
  outOfRange: boolean;
}

/** Rothfusz / NWS full heat index formula. Input and output in °F. */
function rothfuszF(T: number, RH: number): number {
  const HI =
    -42.379 +
    2.04901523 * T +
    10.14333127 * RH -
    0.22475541 * T * RH -
    6.83783e-3 * T * T -
    5.481717e-2 * RH * RH +
    1.22874e-3 * T * T * RH +
    8.5282e-4 * T * RH * RH -
    1.99e-6 * T * T * RH * RH;

  // Low-humidity adjustment: RH < 13% and 80°F < T < 112°F
  if (RH < 13 && T > 80 && T < 112) {
    const adj = ((13 - RH) / 4) * Math.sqrt((17 - Math.abs(T - 95)) / 17);
    return HI - adj;
  }

  // High-humidity adjustment: RH > 85% and 80°F < T < 87°F
  if (RH > 85 && T >= 80 && T <= 87) {
    const adj = ((RH - 85) / 10) * ((87 - T) / 5);
    return HI + adj;
  }

  return HI;
}

function calculateHeatIndex(tempC: number, rh: number): HeatIndexResult | null {
  // Formula is only valid at T >= 27°C (80°F) and RH >= 40%
  const outOfRange = tempC < 27 || rh < 40;

  const tempF = tempC * 9 / 5 + 32;

  let hiF: number;
  if (tempF >= 80) {
    hiF = rothfuszF(tempF, rh);
  } else {
    // Steadman simple approximation for edge cases near the boundary
    hiF = 0.5 * (tempF + 61.0 + (tempF - 68.0) * 1.2 + rh * 0.094);
  }

  const hiC = (hiF - 32) * 5 / 9;
  const difference = hiC - tempC;

  let dangerKey: HeatIndexResult["dangerKey"];
  if (hiC < 27) {
    dangerKey = "safe";
  } else if (hiC < 32) {
    dangerKey = "caution";
  } else if (hiC < 41) {
    dangerKey = "extremeCaution";
  } else if (hiC < 54) {
    dangerKey = "danger";
  } else {
    dangerKey = "extremeDanger";
  }

  return { heatIndex: hiC, difference, dangerKey, outOfRange };
}

const DANGER_COLORS: Record<HeatIndexResult["dangerKey"], string> = {
  safe: "border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-900/20",
  caution: "border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-900/20",
  extremeCaution: "border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-900/20",
  danger: "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/20",
  extremeDanger: "border-red-600 bg-red-100 dark:border-red-600 dark:bg-red-900/30",
};

const DANGER_BADGE_COLORS: Record<HeatIndexResult["dangerKey"], string> = {
  safe: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  caution: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  extremeCaution: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
  danger: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  extremeDanger: "bg-red-200 text-red-900 dark:bg-red-800/60 dark:text-red-200",
};

export default function HeatIndexCalculator() {
  const t = useTranslations("tools.heat-index-calculator");
  const locale = useLocale();

  const [unit, setUnit] = useState<Unit>(locale === "en" ? "imperial" : "metric");
  const [tempInput, setTempInput] = useState("");
  const [rhInput, setRhInput] = useState("");

  const fmt = useMemo(
    () => new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }),
    [locale]
  );

  const result = useMemo((): HeatIndexResult | null => {
    const tempRaw = parseFloat(tempInput);
    const rh = parseFloat(rhInput);
    if (!isFinite(tempRaw) || !isFinite(rh)) return null;
    if (rh < 0 || rh > 100) return null;

    const tempC = unit === "metric" ? tempRaw : (tempRaw - 32) * 5 / 9;
    return calculateHeatIndex(tempC, rh);
  }, [tempInput, rhInput, unit]);

  const displayHI = useMemo(() => {
    if (result === null) return null;
    return unit === "metric"
      ? result.heatIndex
      : result.heatIndex * 9 / 5 + 32;
  }, [result, unit]);

  const displayDiff = useMemo(() => {
    if (result === null) return null;
    return unit === "metric"
      ? result.difference
      : result.difference * 9 / 5;
  }, [result, unit]);

  const tempUnit = unit === "metric" ? "°C" : "°F";
  const tempPlaceholder = unit === "metric" ? "35" : "95";

  // Danger level table rows: [rangeMetric, rangeImperial, dangerKey]
  const dangerRows: Array<{ key: HeatIndexResult["dangerKey"]; rangeC: string; rangeF: string }> = [
    { key: "caution", rangeC: "27–32°C", rangeF: "80–91°F" },
    { key: "extremeCaution", rangeC: "32–41°C", rangeF: "91–103°F" },
    { key: "danger", rangeC: "41–54°C", rangeF: "103–124°F" },
    { key: "extremeDanger", rangeC: "≥54°C", rangeF: "≥124°F" },
  ];

  return (
    <div>
      {/* Unit toggle */}
      <div className="mb-4 inline-flex rounded-md border border-slate-300 dark:border-slate-700">
        <button
          onClick={() => { setUnit("metric"); setTempInput(""); }}
          className={`px-3 py-1.5 text-sm rounded-l-md ${unit === "metric" ? "bg-brand-600 text-white" : ""}`}
        >
          {t("unitToggle.metric")}
        </button>
        <button
          onClick={() => { setUnit("imperial"); setTempInput(""); }}
          className={`px-3 py-1.5 text-sm rounded-r-md ${unit === "imperial" ? "bg-brand-600 text-white" : ""}`}
        >
          {t("unitToggle.imperial")}
        </button>
      </div>

      {/* Inputs */}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">
            {t("input.temperature")} ({tempUnit})
          </span>
          <input
            inputMode="decimal"
            value={tempInput}
            onChange={(e) => setTempInput(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
            placeholder={tempPlaceholder}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">
            {t("input.humidity")} (% RH)
          </span>
          <input
            inputMode="decimal"
            value={rhInput}
            onChange={(e) => setRhInput(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
            placeholder="60"
          />
        </label>
      </div>

      {/* Result */}
      <div
        aria-live="polite"
        className={`mt-6 rounded-lg border p-5 transition-colors ${
          result !== null && !result.outOfRange
            ? DANGER_COLORS[result.dangerKey]
            : "border-slate-200 dark:border-slate-800"
        }`}
      >
        {result === null ? (
          <p className="text-sm text-slate-600 dark:text-slate-400">{t("empty")}</p>
        ) : result.outOfRange ? (
          <p className="text-sm text-slate-600 dark:text-slate-400">{t("error.outOfRange")}</p>
        ) : (
          <>
            <div className="text-sm uppercase tracking-wider text-slate-600 dark:text-slate-400">
              {t("result.feelsLike")}
            </div>
            <div className="mt-1 text-4xl font-bold tabular-nums">
              {fmt.format(displayHI!)}
              <span className="ml-1 text-xl font-normal">{tempUnit}</span>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span
                className={`inline-block rounded-full px-3 py-0.5 text-sm font-medium ${DANGER_BADGE_COLORS[result.dangerKey]}`}
              >
                {t(`dangerLevel.${result.dangerKey}`)}
              </span>
              {displayDiff !== null && Math.abs(displayDiff) >= 0.1 && (
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {t("result.difference")}:{" "}
                  <span className="font-medium tabular-nums">
                    {displayDiff > 0 ? "+" : ""}
                    {fmt.format(displayDiff)}
                    {tempUnit}
                  </span>
                </span>
              )}
            </div>
          </>
        )}
      </div>

      {/* Danger levels table */}
      <div className="mt-8">
        <h3 className="mb-3 text-base font-semibold">{t("result.dangerLevel")}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="pb-2 text-left font-medium">{t("table.level")}</th>
                <th className="pb-2 text-left font-medium">°C</th>
                <th className="pb-2 text-left font-medium">°F</th>
              </tr>
            </thead>
            <tbody>
              {dangerRows.map((row) => (
                <tr
                  key={row.key}
                  className={`border-b border-slate-100 dark:border-slate-800 ${
                    result && !result.outOfRange && result.dangerKey === row.key
                      ? "font-semibold"
                      : ""
                  }`}
                >
                  <td className="py-2 pr-4">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${DANGER_BADGE_COLORS[row.key]}`}
                    >
                      {t(`dangerLevel.${row.key}`)}
                    </span>
                  </td>
                  <td className="py-2 pr-4 tabular-nums">{row.rangeC}</td>
                  <td className="py-2 tabular-nums">{row.rangeF}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
