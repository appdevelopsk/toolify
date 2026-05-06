"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

type Unit = "metric" | "imperial";

const M2_PER_LITER_AT_ONE_COAT = 10; // typical interior latex coverage
const SQFT_PER_GAL_AT_ONE_COAT = 350; // typical US figure

export default function PaintCalculator() {
  const t = useTranslations("tools.paint-calculator");
  const locale = useLocale();
  const [unit, setUnit] = useState<Unit>(locale === "en" ? "imperial" : "metric");
  const [length, setLength] = useState("4");
  const [width, setWidth] = useState("3");
  const [height, setHeight] = useState("2.5");
  const [coats, setCoats] = useState(2);
  const [doorsAndWindows, setDoorsAndWindows] = useState("3");

  const result = useMemo(() => {
    const L = parseFloat(length);
    const W = parseFloat(width);
    const H = parseFloat(height);
    const dwCount = parseFloat(doorsAndWindows);
    if (![L, W, H, dwCount].every(isFinite) || L <= 0 || W <= 0 || H <= 0 || dwCount < 0) return null;

    let wallArea = 2 * (L + W) * H; // wall perimeter × height
    // Subtract approximate door/window area (~1.7 m² or ~21 sq ft per opening)
    const subtractPerOpening = unit === "metric" ? 1.7 : 18;
    wallArea = Math.max(0, wallArea - dwCount * subtractPerOpening);

    const coverPerUnit = unit === "metric" ? M2_PER_LITER_AT_ONE_COAT : SQFT_PER_GAL_AT_ONE_COAT;
    const totalArea = wallArea * coats;
    const paintNeeded = totalArea / coverPerUnit;

    return { wallArea, totalArea, paintNeeded };
  }, [unit, length, width, height, coats, doorsAndWindows]);

  const fmt1 = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }), [locale]);

  return (
    <div>
      <div className="mb-4 inline-flex rounded-md border border-slate-300 dark:border-slate-700">
        <button onClick={() => setUnit("metric")} className={`px-3 py-1.5 text-sm ${unit === "metric" ? "bg-brand-600 text-white" : ""}`}>{t("unit.metric")}</button>
        <button onClick={() => setUnit("imperial")} className={`px-3 py-1.5 text-sm ${unit === "imperial" ? "bg-brand-600 text-white" : ""}`}>{t("unit.imperial")}</button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block">
          <span className="text-sm font-medium">{t("input.length")} ({unit === "metric" ? "m" : "ft"})</span>
          <input inputMode="decimal" value={length} onChange={(e) => setLength(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.width")} ({unit === "metric" ? "m" : "ft"})</span>
          <input inputMode="decimal" value={width} onChange={(e) => setWidth(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.height")} ({unit === "metric" ? "m" : "ft"})</span>
          <input inputMode="decimal" value={height} onChange={(e) => setHeight(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.coats")}</span>
          <select value={coats} onChange={(e) => setCoats(parseInt(e.target.value, 10))} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
            {[1, 2, 3].map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <label className="block sm:col-span-2">
          <span className="text-sm font-medium">{t("input.openings")}</span>
          <input inputMode="numeric" value={doorsAndWindows} onChange={(e) => setDoorsAndWindows(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
        </label>
      </div>

      <div aria-live="polite" className={`mt-6 rounded-lg border p-4 ${result ? "border-brand-200 bg-brand-50 dark:border-brand-900 dark:bg-brand-900/20" : "border-slate-200 dark:border-slate-800"}`}>
        {result ? (
          <>
            <div className="text-xs uppercase tracking-wider text-slate-500">{t("result.paint")}</div>
            <div className="mt-1 text-4xl font-bold tabular-nums">
              {fmt1.format(result.paintNeeded)} <span className="text-base font-normal text-slate-500">{unit === "metric" ? t("unit.liters") : t("unit.gallons")}</span>
            </div>
            <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800">
                <dt>{t("result.wallArea")}</dt>
                <dd className="tabular-nums">{fmt1.format(result.wallArea)} {unit === "metric" ? "m²" : "ft²"}</dd>
              </div>
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800">
                <dt>{t("result.totalCoverage")}</dt>
                <dd className="tabular-nums">{fmt1.format(result.totalArea)} {unit === "metric" ? "m²" : "ft²"}</dd>
              </div>
            </dl>
          </>
        ) : (
          <div className="text-sm text-slate-500">{t("empty")}</div>
        )}
      </div>
    </div>
  );
}
