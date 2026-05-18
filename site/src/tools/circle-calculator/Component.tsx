"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

type Mode = "radius" | "diameter" | "area" | "circumference";

interface CircleResult {
  radius: number;
  diameter: number;
  area: number;
  circumference: number;
  arcLength?: number;
  sectorArea?: number;
}

export default function CircleCalculator() {
  const t = useTranslations("tools.circle-calculator");
  const locale = useLocale();
  const [mode, setMode] = useState<Mode>("radius");
  const [value, setValue] = useState("5");
  const [angle, setAngle] = useState("");

  const result = useMemo<CircleResult | null>(() => {
    const v = parseFloat(value);
    if (!isFinite(v) || v <= 0) return null;

    let r: number;
    if (mode === "radius") {
      r = v;
    } else if (mode === "diameter") {
      r = v / 2;
    } else if (mode === "area") {
      r = Math.sqrt(v / Math.PI);
    } else {
      // circumference
      r = v / (2 * Math.PI);
    }

    const d = 2 * r;
    const a = Math.PI * r * r;
    const c = 2 * Math.PI * r;

    const res: CircleResult = { radius: r, diameter: d, area: a, circumference: c };

    const theta = parseFloat(angle);
    if (isFinite(theta) && theta > 0 && theta <= 360) {
      res.arcLength = (theta / 360) * c;
      res.sectorArea = (theta / 360) * a;
    }

    return res;
  }, [mode, value, angle]);

  const fmt = useMemo(
    () => new Intl.NumberFormat(locale, { maximumFractionDigits: 6 }),
    [locale]
  );

  const modes: Mode[] = ["radius", "diameter", "area", "circumference"];

  return (
    <div>
      {/* Mode selector */}
      <fieldset className="mb-4">
        <legend className="mb-2 text-sm font-medium">{t("modeLabel")}</legend>
        <div className="flex flex-wrap gap-2">
          {modes.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`rounded px-3 py-1 text-sm ${
                mode === m
                  ? "bg-brand-600 text-white"
                  : "border border-slate-300 dark:border-slate-700"
              }`}
            >
              {t(`modeOptions.${m}`)}
            </button>
          ))}
        </div>
      </fieldset>

      {/* Single value input */}
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">{t(`modeOptions.${mode}`)}</span>
          <input
            type="number"
            step="any"
            min="0"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.angle")}</span>
          <input
            type="number"
            step="any"
            min="0"
            max="360"
            value={angle}
            onChange={(e) => setAngle(e.target.value)}
            placeholder={t("input.anglePlaceholder")}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900"
          />
        </label>
      </div>

      {/* Results */}
      <div aria-live="polite" className="mt-6 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
        {!result ? (
          <div className="text-sm text-slate-600 dark:text-slate-400">{t("empty")}</div>
        ) : (
          <div>
            {/* Primary 2-column grid for 4 basic values */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded bg-emerald-50 p-3 dark:bg-emerald-900/20">
                <div className="text-xs font-medium text-emerald-900 dark:text-emerald-200">
                  {t("result.radius")}
                </div>
                <div className="font-mono text-2xl font-bold tabular-nums">
                  {fmt.format(result.radius)}
                </div>
              </div>
              <div className="rounded bg-slate-100 p-3 dark:bg-slate-800">
                <div className="text-xs font-medium">{t("result.diameter")}</div>
                <div className="font-mono text-2xl font-bold tabular-nums">
                  {fmt.format(result.diameter)}
                </div>
              </div>
            </div>

            <dl className="mt-3 grid gap-1 text-sm">
              <div className="flex justify-between border-b border-slate-200 py-1.5 dark:border-slate-800">
                <dt>{t("result.area")}</dt>
                <dd className="tabular-nums font-mono">{fmt.format(result.area)}</dd>
              </div>
              <div className="flex justify-between border-b border-slate-200 py-1.5 dark:border-slate-800">
                <dt>{t("result.circumference")}</dt>
                <dd className="tabular-nums font-mono">{fmt.format(result.circumference)}</dd>
              </div>

              {result.arcLength !== undefined && (
                <div className="flex justify-between border-b border-slate-200 py-1.5 dark:border-slate-800">
                  <dt>{t("result.arcLength")}</dt>
                  <dd className="tabular-nums font-mono">{fmt.format(result.arcLength)}</dd>
                </div>
              )}
              {result.sectorArea !== undefined && (
                <div className="flex justify-between border-b border-slate-200 py-1.5 dark:border-slate-800">
                  <dt>{t("result.sectorArea")}</dt>
                  <dd className="tabular-nums font-mono">{fmt.format(result.sectorArea)}</dd>
                </div>
              )}
            </dl>
          </div>
        )}
      </div>
    </div>
  );
}
