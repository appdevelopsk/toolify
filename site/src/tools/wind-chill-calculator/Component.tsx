"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

type UnitSystem = "metric" | "imperial";

interface WindChillResult {
  windChill: number;
  difference: number;
  riskLevel: RiskLevel;
}

type RiskLevel = "safe" | "watch" | "warning" | "danger" | "critical" | "extremeDanger";

/** NWS/Environment Canada 2001 formula — Metric (°C, km/h) */
function calcWindChillMetric(tempC: number, windKmh: number): number {
  const v = Math.pow(windKmh, 0.16);
  return 13.12 + 0.6215 * tempC - 11.37 * v + 0.3965 * tempC * v;
}

/** NWS/Environment Canada 2001 formula — Imperial (°F, mph) */
function calcWindChillImperial(tempF: number, windMph: number): number {
  const v = Math.pow(windMph, 0.16);
  return 35.74 + 0.6215 * tempF - 35.75 * v + 0.4275 * tempF * v;
}

/**
 * Frostbite risk based on wind chill in °C.
 * Thresholds from Environment Canada / NWS advisory chart.
 */
function getRiskLevel(windChillC: number): RiskLevel {
  if (windChillC > -27) return "safe";
  if (windChillC > -35) return "watch";
  if (windChillC > -45) return "warning";
  if (windChillC > -55) return "danger";
  if (windChillC > -60) return "critical";
  return "extremeDanger";
}

const RISK_COLORS: Record<RiskLevel, string> = {
  safe: "border-green-300 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300",
  watch:
    "border-yellow-300 bg-yellow-50 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300",
  warning:
    "border-orange-300 bg-orange-50 text-orange-800 dark:border-orange-800 dark:bg-orange-900/20 dark:text-orange-300",
  danger: "border-red-400 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300",
  critical:
    "border-red-600 bg-red-100 text-red-900 dark:border-red-700 dark:bg-red-900/30 dark:text-red-200",
  extremeDanger:
    "border-purple-600 bg-purple-100 text-purple-900 dark:border-purple-700 dark:bg-purple-900/30 dark:text-purple-200",
};

export default function WindChillCalculator() {
  const t = useTranslations("tools.wind-chill-calculator");
  const locale = useLocale();

  const [unit, setUnit] = useState<UnitSystem>("metric");
  const [tempInput, setTempInput] = useState("");
  const [windInput, setWindInput] = useState("");

  const fmt = useMemo(
    () => new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }),
    [locale]
  );

  const result = useMemo((): WindChillResult | "out-of-range" | "no-wind-chill" | null => {
    const temp = parseFloat(tempInput);
    const wind = parseFloat(windInput);
    if (!isFinite(temp) || !isFinite(wind)) return null;

    // Validity bounds (convert imperial inputs to metric for range checks)
    const tempC = unit === "metric" ? temp : ((temp - 32) * 5) / 9;
    const windKmh = unit === "metric" ? wind : wind * 1.60934;

    if (tempC > 10 || windKmh <= 4.8) return "out-of-range";

    let windChill: number;
    if (unit === "metric") {
      windChill = calcWindChillMetric(temp, wind);
    } else {
      windChill = calcWindChillImperial(temp, wind);
    }

    // For risk level we always need °C
    const windChillC =
      unit === "metric" ? windChill : ((windChill - 32) * 5) / 9;

    const difference = temp - windChill;

    // If difference is negligible, report no wind chill effect
    if (Math.abs(difference) < 0.05) return "no-wind-chill";

    return {
      windChill,
      difference,
      riskLevel: getRiskLevel(windChillC),
    };
  }, [tempInput, windInput, unit]);

  const tempUnit = unit === "metric" ? t("units.celsius") : t("units.fahrenheit");
  const windUnit = unit === "metric" ? t("units.kmh") : t("units.mph");

  return (
    <div>
      {/* Unit toggle */}
      <div className="mb-5">
        <span className="text-sm font-medium">{t("unitToggle.label")}</span>
        <div className="mt-2 flex gap-2">
          {(["metric", "imperial"] as UnitSystem[]).map((u) => (
            <button
              key={u}
              onClick={() => {
                setUnit(u);
                setTempInput("");
                setWindInput("");
              }}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                unit === u
                  ? "border-brand-500 bg-brand-500 text-white dark:border-brand-400 dark:bg-brand-400 dark:text-slate-900"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              {t(`unitToggle.${u}`)}
            </button>
          ))}
        </div>
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
            placeholder={t("input.temperaturePlaceholder")}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">
            {t("input.windSpeed")} ({windUnit})
          </span>
          <input
            inputMode="decimal"
            value={windInput}
            onChange={(e) => setWindInput(e.target.value)}
            placeholder={t("input.windSpeedPlaceholder")}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          />
        </label>
      </div>

      {/* Results */}
      <div aria-live="polite" className="mt-6">
        {result === null && (
          <p className="text-sm text-slate-500 dark:text-slate-400">{t("info.empty")}</p>
        )}

        {result === "out-of-range" && (
          <div className="rounded border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
            {t("info.outOfRange")}
          </div>
        )}

        {result === "no-wind-chill" && (
          <div className="rounded border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {t("info.noWindChill")}
          </div>
        )}

        {result !== null && result !== "out-of-range" && result !== "no-wind-chill" && (
          <div className="space-y-4">
            {/* Primary result card */}
            <div
              className={`rounded border px-5 py-4 ${RISK_COLORS[result.riskLevel]}`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium opacity-75">{t("result.windChill")}</p>
                  <p className="text-5xl font-bold tabular-nums leading-none">
                    {fmt.format(result.windChill)}
                    <span className="ml-1 text-2xl">{tempUnit}</span>
                  </p>
                  <p className="mt-1 text-sm opacity-80">
                    {t("result.feelsLike")}:{" "}
                    <span className="font-semibold">
                      {fmt.format(result.windChill)}
                      {tempUnit}
                    </span>
                    {" · "}
                    {t("result.difference")}:{" "}
                    <span className="font-semibold">
                      {fmt.format(result.difference)}
                      {tempUnit}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Frostbite risk card */}
            <div className={`rounded border px-4 py-3 ${RISK_COLORS[result.riskLevel]}`}>
              <p className="text-xs font-semibold uppercase tracking-wide opacity-70">
                {t("result.frostbiteRisk")}
              </p>
              <p className="mt-0.5 text-base font-bold">
                {t(`risk.${result.riskLevel}`)}
              </p>
              <p className="mt-0.5 text-sm opacity-80">
                {t("result.exposure")}:{" "}
                <span className="font-medium">{t(`exposure.${result.riskLevel}`)}</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
