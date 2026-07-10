"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

type Unit = "mpg_us" | "mpg_uk" | "kml" | "l100km";

const MILE = 1.609344; // km
const GAL_US = 3.785411784; // L
const GAL_UK = 4.54609; // L

function toKml(v: number, from: Unit): number {
  switch (from) {
    case "kml": return v;
    case "l100km": return v <= 0 ? Infinity : 100 / v;
    case "mpg_us": return (v * MILE) / GAL_US;
    case "mpg_uk": return (v * MILE) / GAL_UK;
  }
}
function fromKml(kml: number, to: Unit): number {
  switch (to) {
    case "kml": return kml;
    case "l100km": return kml <= 0 ? Infinity : 100 / kml;
    case "mpg_us": return (kml * GAL_US) / MILE;
    case "mpg_uk": return (kml * GAL_UK) / MILE;
  }
}

const UNITS: Unit[] = ["mpg_us", "mpg_uk", "kml", "l100km"];

function convert(v: number, from: Unit, to: Unit): number {
  return fromKml(toKml(v, from), to);
}

const UNIT_SYMBOL: Record<Unit, string> = {
  mpg_us: "mpg (US)", mpg_uk: "mpg (UK)", kml: "km/L", l100km: "L/100 km",
};

// Typical fuel economy by vehicle class — realistic combined-cycle figures
const QUICK_REF: Array<{ id: string; value: number; unit: Unit; ref: Unit }> = [
  { id: "keiCar", value: 22, unit: "kml", ref: "mpg_us" },
  { id: "hybrid", value: 4, unit: "l100km", ref: "mpg_us" },
  { id: "compact", value: 6, unit: "l100km", ref: "mpg_us" },
  { id: "midsizeSedan", value: 7.5, unit: "l100km", ref: "mpg_us" },
  { id: "minivan", value: 9, unit: "l100km", ref: "mpg_us" },
  { id: "suv", value: 10, unit: "l100km", ref: "mpg_us" },
  { id: "sportsCar", value: 12, unit: "l100km", ref: "mpg_us" },
  { id: "pickup", value: 17, unit: "mpg_us", ref: "l100km" },
  { id: "motorcycle", value: 30, unit: "kml", ref: "mpg_us" },
  { id: "ukAverage", value: 50, unit: "mpg_uk", ref: "l100km" },
  { id: "benchmark30", value: 30, unit: "mpg_us", ref: "l100km" },
];

export default function FuelEconomyConverter() {
  const t = useTranslations("tools.fuel-economy-converter");
  const locale = useLocale();
  const [value, setValue] = useState("30");
  const [from, setFrom] = useState<Unit>(locale === "en" ? "mpg_us" : "kml");
  const fmt = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 4 }), [locale]);
  const fmtRef = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }), [locale]);

  function applyRow(row: (typeof QUICK_REF)[number]) {
    setFrom(row.unit);
    setValue(String(row.value));
  }

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">{t("input.value")}</span>
          <input inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.from")}</span>
          <select value={from} onChange={(e) => setFrom(e.target.value as Unit)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
            {UNITS.map((u) => (
              <option key={u} value={u}>{t(`unit.${u}`)}</option>
            ))}
          </select>
        </label>
      </div>
      <div aria-live="polite" className="mt-6 grid gap-2 sm:grid-cols-2">
        {UNITS.filter((u) => u !== from).map((u) => {
          const v = parseFloat(value);
          const c = isFinite(v) ? fromKml(toKml(v, from), u) : null;
          return (
            <div key={u} className="flex items-baseline justify-between rounded border border-slate-200 px-3 py-2 text-sm dark:border-slate-800">
              <span className="text-slate-600 dark:text-slate-400">{t(`unit.${u}`)}</span>
              <span className="tabular-nums">{c !== null && isFinite(c) ? fmt.format(c) : "—"}</span>
            </div>
          );
        })}
      </div>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">{t("quickRef.title")}</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{t("quickRef.hint")}</p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[28rem] text-sm">
            <thead>
              <tr className="border-b border-slate-300 text-left dark:border-slate-700">
                <th className="py-2 pr-2 font-medium">{t("quickRef.colItem")}</th>
                <th className="py-2 pr-2 text-right font-medium">{t("quickRef.colValue")}</th>
                <th className="py-2 pr-2 text-right font-medium">{t("quickRef.colEquiv")}</th>
                <th className="py-2" aria-hidden="true"></th>
              </tr>
            </thead>
            <tbody>
              {QUICK_REF.map((r) => (
                <tr key={r.id} className="border-b border-slate-200 dark:border-slate-800">
                  <td className="py-2 pr-2">{t(`quickRef.rows.${r.id}`)}</td>
                  <td className="whitespace-nowrap py-2 pr-2 text-right tabular-nums">
                    {fmtRef.format(r.value)} {UNIT_SYMBOL[r.unit]}
                  </td>
                  <td className="whitespace-nowrap py-2 pr-2 text-right tabular-nums">
                    {fmtRef.format(convert(r.value, r.unit, r.ref))} {UNIT_SYMBOL[r.ref]}
                  </td>
                  <td className="py-2 text-right">
                    <button
                      onClick={() => applyRow(r)}
                      className="rounded border border-slate-300 px-2 py-0.5 text-xs hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                    >
                      {t("quickRef.apply")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
