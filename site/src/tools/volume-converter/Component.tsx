"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

const UNITS = [
  { code: "ml", toL: 0.001 },
  { code: "l", toL: 1 },
  { code: "m3", toL: 1000 },
  { code: "tsp_us", toL: 0.00492892 },
  { code: "tbsp_us", toL: 0.01478676 },
  { code: "floz_us", toL: 0.0295735 },
  { code: "cup_us", toL: 0.236588 },
  { code: "pint_us", toL: 0.473176 },
  { code: "quart_us", toL: 0.946353 },
  { code: "gal_us", toL: 3.785411784 },
  { code: "gal_uk", toL: 4.54609 },
] as const;

type UnitCode = (typeof UNITS)[number]["code"];

function convert(v: number, from: UnitCode, to: UnitCode): number {
  const f = UNITS.find((u) => u.code === from)!.toL;
  const t = UNITS.find((u) => u.code === to)!.toL;
  return (v * f) / t;
}

export default function VolumeConverter() {
  const t = useTranslations("tools.volume-converter");
  const locale = useLocale();
  const [value, setValue] = useState("1");
  const [from, setFrom] = useState<UnitCode>("l");
  const fmt = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 6 }), [locale]);

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
              <span className="text-slate-500">{t(`unit.${u.code}`)}</span>
              <span className="tabular-nums">{c !== null ? fmt.format(c) : "—"}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
