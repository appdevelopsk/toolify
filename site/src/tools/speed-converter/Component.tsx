"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

const UNITS = [
  { code: "mps", toMps: 1 },
  { code: "kmh", toMps: 1 / 3.6 },
  { code: "mph", toMps: 0.44704 },
  { code: "fps", toMps: 0.3048 },
  { code: "knot", toMps: 0.514444 },
  { code: "mach", toMps: 343 }, // sea level, 20C
] as const;

type UnitCode = (typeof UNITS)[number]["code"];

function convert(v: number, from: UnitCode, to: UnitCode): number {
  const f = UNITS.find((u) => u.code === from)!.toMps;
  const t = UNITS.find((u) => u.code === to)!.toMps;
  return (v * f) / t;
}

const UNIT_SYMBOL: Record<UnitCode, string> = {
  mps: "m/s", kmh: "km/h", mph: "mph", fps: "ft/s", knot: "kn", mach: "Mach",
};

// Speeds with real-world meaning: sport, traffic law, transport, weather
const QUICK_REF: Array<{ id: string; value: number; unit: UnitCode; ref: UnitCode }> = [
  { id: "walk", value: 5, unit: "kmh", ref: "mph" },
  { id: "jog", value: 10, unit: "kmh", ref: "mph" },
  { id: "cycle", value: 20, unit: "kmh", ref: "mph" },
  { id: "sprint", value: 37.6, unit: "kmh", ref: "mph" },
  { id: "cityLimit", value: 50, unit: "kmh", ref: "mph" },
  { id: "usHighway", value: 65, unit: "mph", ref: "kmh" },
  { id: "autobahn", value: 130, unit: "kmh", ref: "mph" },
  { id: "typhoon", value: 17.2, unit: "mps", ref: "kmh" },
  { id: "hurricane", value: 74, unit: "mph", ref: "kmh" },
  { id: "shinkansen", value: 320, unit: "kmh", ref: "mph" },
  { id: "airliner", value: 900, unit: "kmh", ref: "knot" },
  { id: "sound", value: 343, unit: "mps", ref: "mph" },
];

export default function SpeedConverter() {
  const t = useTranslations("tools.speed-converter");
  const locale = useLocale();
  const [value, setValue] = useState("60");
  const [from, setFrom] = useState<UnitCode>(locale === "en" ? "mph" : "kmh");
  const fmt = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 6 }), [locale]);
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
          <select value={from} onChange={(e) => setFrom(e.target.value as UnitCode)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
            {UNITS.map((u) => (
              <option key={u.code} value={u.code}>{t(`unit.${u.code}`)}</option>
            ))}
          </select>
        </label>
      </div>
      <div aria-live="polite" className="mt-6 grid gap-2 sm:grid-cols-2">
        {UNITS.filter((u) => u.code !== from).map((u) => {
          const v = parseFloat(value);
          const c = isFinite(v) ? convert(v, from, u.code) : null;
          return (
            <div key={u.code} className="flex items-baseline justify-between rounded border border-slate-200 px-3 py-2 text-sm dark:border-slate-800">
              <span className="text-slate-600 dark:text-slate-400">{t(`unit.${u.code}`)}</span>
              <span className="tabular-nums">{c !== null ? fmt.format(c) : "—"}</span>
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
