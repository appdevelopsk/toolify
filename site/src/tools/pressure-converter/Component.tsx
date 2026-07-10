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

function convert(v: number, from: string, to: string): number {
  return (v * TO_PA[from]!) / TO_PA[to]!;
}

const UNIT_SYMBOL: Record<string, string> = { ft_H2O: "ft H₂O" };
function sym(u: string): string {
  return UNIT_SYMBOL[u] ?? u;
}

// Pressures people actually look up: weather, tires, coffee, medicine, diving
const QUICK_REF: Array<{ id: string; value: number; unit: string; ref: string }> = [
  { id: "atmosphere", value: 1, unit: "atm", ref: "kPa" },
  { id: "stormLow", value: 980, unit: "hPa", ref: "inHg" },
  { id: "strongHigh", value: 1025, unit: "hPa", ref: "inHg" },
  { id: "carTire", value: 32, unit: "psi", ref: "kPa" },
  { id: "bikeTire", value: 100, unit: "psi", ref: "bar" },
  { id: "bloodPressure", value: 120, unit: "mmHg", ref: "kPa" },
  { id: "espresso", value: 9, unit: "bar", ref: "psi" },
  { id: "champagne", value: 6, unit: "bar", ref: "psi" },
  { id: "pressureCooker", value: 15, unit: "psi", ref: "kPa" },
  { id: "tapWater", value: 4, unit: "bar", ref: "psi" },
  { id: "scubaTank", value: 200, unit: "bar", ref: "psi" },
  { id: "everest", value: 34, unit: "kPa", ref: "atm" },
];

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
  const fmtRef = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }), [locale]);

  function applyRow(row: (typeof QUICK_REF)[number]) {
    setFrom(row.unit);
    setValue(String(row.value));
  }

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
          <div className="text-sm text-slate-600 dark:text-slate-400">{t("empty")}</div>
        )}
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
                    {fmtRef.format(r.value)} {sym(r.unit)}
                  </td>
                  <td className="whitespace-nowrap py-2 pr-2 text-right tabular-nums">
                    {fmtRef.format(convert(r.value, r.unit, r.ref))} {sym(r.ref)}
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
