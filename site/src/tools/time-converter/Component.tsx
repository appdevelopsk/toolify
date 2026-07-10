"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

const UNITS = [
  { code: "ms", toS: 0.001 },
  { code: "s", toS: 1 },
  { code: "min", toS: 60 },
  { code: "h", toS: 3600 },
  { code: "d", toS: 86400 },
  { code: "wk", toS: 604800 },
  { code: "mo", toS: 2629800 },
  { code: "yr", toS: 31557600 },
] as const;

type UnitCode = (typeof UNITS)[number]["code"];

function convert(value: number, from: UnitCode, to: UnitCode): number {
  const f = UNITS.find((u) => u.code === from)!.toS;
  const t = UNITS.find((u) => u.code === to)!.toS;
  return (value * f) / t;
}

// Durations with a real anchor: sport, media, work, astronomy, biology
const QUICK_REF: Array<{ id: string; value: number; unit: UnitCode; ref: UnitCode }> = [
  { id: "blink", value: 300, unit: "ms", ref: "s" },
  { id: "sprintRecord", value: 9.58, unit: "s", ref: "ms" },
  { id: "popSong", value: 3.5, unit: "min", ref: "s" },
  { id: "footballMatch", value: 90, unit: "min", ref: "h" },
  { id: "movie", value: 2, unit: "h", ref: "min" },
  { id: "workday", value: 8, unit: "h", ref: "min" },
  { id: "longHaulFlight", value: 10, unit: "h", ref: "min" },
  { id: "week", value: 1, unit: "wk", ref: "h" },
  { id: "lunarMonth", value: 29.53, unit: "d", ref: "wk" },
  { id: "pregnancy", value: 280, unit: "d", ref: "wk" },
  { id: "month", value: 1, unit: "mo", ref: "d" },
  { id: "year", value: 1, unit: "yr", ref: "d" },
];

export default function TimeConverter() {
  const t = useTranslations("tools.time-converter");
  const locale = useLocale();
  const [value, setValue] = useState("1");
  const [from, setFrom] = useState<UnitCode>("h");
  const fmt = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 8 }), [locale]);
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
              <option key={u.code} value={u.code}>
                {t(`unit.${u.code}`)}
              </option>
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
                    {fmtRef.format(r.value)} {r.unit}
                  </td>
                  <td className="whitespace-nowrap py-2 pr-2 text-right tabular-nums">
                    {fmtRef.format(convert(r.value, r.unit, r.ref))} {r.ref}
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
