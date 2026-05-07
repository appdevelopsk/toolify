"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

// All conversion to Pa (Pascals)
const TO_PA: Record<string, number> = {
  Pa: 1,
  hPa: 100,
  kPa: 1000,
  MPa: 1000000,
  bar: 100000,
  mbar: 100,
  atm: 101325,
  psi: 6894.757,
  mmHg: 133.322,
  inHg: 3386.39,
  Torr: 133.322,
  ft_H2O: 2989.07,
};

const UNITS = Object.keys(TO_PA);

export default function PressureConverter() {
  const t = useTranslations("tools.pressure-converter");
  const locale = useLocale();
  const [value, setValue] = useState("1");
  const [from, setFrom] = useState("atm");

  const allValues = useMemo(() => {
    const v = parseFloat(value);
    if (!isFinite(v)) return null;
    const inPa = v * TO_PA[from]!;
    return UNITS.map((u) => ({ unit: u, value: inPa / TO_PA[u]! }));
  }, [value, from]);

  const fmt = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 6, minimumFractionDigits: 0 }), [locale]);

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">{t("input.value")}</span>
          <input type="number" value={value} onChange={(e) => setValue(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-mono text-lg tabular-nums dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.from")}</span>
          <select value={from} onChange={(e) => setFrom(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
            {UNITS.map((u) => (
              <option key={u} value={u}>{t(`unit.${u}`)} ({u})</option>
            ))}
          </select>
        </label>
      </div>

      <div aria-live="polite" className="mt-6 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
        {allValues ? (
          <ul className="grid gap-1 sm:grid-cols-2">
            {allValues.map((u) => (
              <li key={u.unit} className={`flex justify-between rounded px-2 py-1 ${u.unit === from ? "bg-emerald-50 font-bold dark:bg-emerald-900/20" : ""}`}>
                <span className="text-sm">{t(`unit.${u.unit}`)}</span>
                <span className="tabular-nums">{fmt.format(u.value)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-sm text-slate-500">{t("empty")}</div>
        )}
      </div>
    </div>
  );
}
