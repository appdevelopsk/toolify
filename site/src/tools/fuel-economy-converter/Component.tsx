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

export default function FuelEconomyConverter() {
  const t = useTranslations("tools.fuel-economy-converter");
  const locale = useLocale();
  const [value, setValue] = useState("30");
  const [from, setFrom] = useState<Unit>(locale === "en" ? "mpg_us" : "kml");
  const fmt = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 4 }), [locale]);

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
    </div>
  );
}
