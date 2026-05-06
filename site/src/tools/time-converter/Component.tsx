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

export default function TimeConverter() {
  const t = useTranslations("tools.time-converter");
  const locale = useLocale();
  const [value, setValue] = useState("1");
  const [from, setFrom] = useState<UnitCode>("h");
  const fmt = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 8 }), [locale]);

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
              <span className="text-slate-500">{t(`unit.${u.code}`)}</span>
              <span className="tabular-nums">{c !== null ? fmt.format(c) : "—"}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
