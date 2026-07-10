"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

const TO_W: Record<string, number> = {
  W: 1,
  kW: 1000,
  MW: 1000000,
  GW: 1000000000,
  hp: 745.6998715822702, // mechanical hp
  hp_metric: 735.49875, // PS / metric hp (Japan, EU)
  BTUh: 0.29307107, // BTU/hour
  ftlbs: 1.355817948, // ft-lb/s
  cal_s: 4.184, // cal/s
  kcal_h: 1.16222, // kcal/h
};

const UNITS = Object.keys(TO_W);

function convert(v: number, from: string, to: string): number {
  return (v * TO_W[from]!) / TO_W[to]!;
}

const UNIT_SYMBOL: Record<string, string> = {
  hp_metric: "PS", BTUh: "BTU/h", ftlbs: "ft·lb/s", cal_s: "cal/s", kcal_h: "kcal/h",
};
function sym(u: string): string {
  return UNIT_SYMBOL[u] ?? u;
}

// Power ratings people actually compare: appliances, cars, energy infrastructure
const QUICK_REF: Array<{ id: string; value: number; unit: string; ref: string }> = [
  { id: "ledBulb", value: 10, unit: "W", ref: "BTUh" },
  { id: "laptopCharger", value: 65, unit: "W", ref: "BTUh" },
  { id: "cyclist", value: 200, unit: "W", ref: "kcal_h" },
  { id: "microwave", value: 800, unit: "W", ref: "BTUh" },
  { id: "kettle", value: 1500, unit: "W", ref: "hp" },
  { id: "onePs", value: 1, unit: "hp", ref: "W" },
  { id: "homeAc", value: 12000, unit: "BTUh", ref: "kW" },
  { id: "evCharger", value: 7, unit: "kW", ref: "hp" },
  { id: "keiCar", value: 64, unit: "hp_metric", ref: "kW" },
  { id: "compactCar", value: 100, unit: "hp", ref: "kW" },
  { id: "sportsCar", value: 300, unit: "hp", ref: "kW" },
  { id: "windTurbine", value: 8, unit: "MW", ref: "hp" },
  { id: "reactor", value: 1, unit: "GW", ref: "hp" },
];

export default function PowerConverter() {
  const t = useTranslations("tools.power-converter");
  const locale = useLocale();
  const [value, setValue] = useState("100");
  const [from, setFrom] = useState("W");

  const allValues = useMemo(() => {
    const v = parseFloat(value);
    if (!isFinite(v)) return null;
    const inW = v * TO_W[from]!;
    return UNITS.map((u) => ({ unit: u, value: inW / TO_W[u]! }));
  }, [value, from]);

  const fmt = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 6 }), [locale]);
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
          <input type="number" step="any" value={value} onChange={(e) => setValue(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-mono text-lg tabular-nums dark:border-slate-700 dark:bg-slate-900" />
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
