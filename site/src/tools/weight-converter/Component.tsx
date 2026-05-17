"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

const UNITS = [
  { code: "mg", toKg: 0.000001 },
  { code: "g", toKg: 0.001 },
  { code: "kg", toKg: 1 },
  { code: "t", toKg: 1000 },
  { code: "oz", toKg: 0.0283495231 },
  { code: "lb", toKg: 0.45359237 },
  { code: "st", toKg: 6.35029318 },
] as const;

type UnitCode = (typeof UNITS)[number]["code"];

function convert(value: number, from: UnitCode, to: UnitCode): number {
  const f = UNITS.find((u) => u.code === from)!.toKg;
  const t = UNITS.find((u) => u.code === to)!.toKg;
  return (value * f) / t;
}

export default function WeightConverter() {
  const t = useTranslations("tools.weight-converter");
  const locale = useLocale();
  const [value, setValue] = useState("1");
  const [from, setFrom] = useState<UnitCode>("kg");

  const fmt = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 8 }), [locale]);

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">{t("input.value")}</span>
          <input
            inputMode="decimal"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.from")}</span>
          <select
            value={from}
            onChange={(e) => setFrom(e.target.value as UnitCode)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          >
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
            <div
              key={u.code}
              className="flex items-baseline justify-between rounded border border-slate-200 px-3 py-2 text-sm dark:border-slate-800"
            >
              <span className="text-slate-600 dark:text-slate-400">{t(`unit.${u.code}`)}</span>
              <span className="tabular-nums">{c !== null ? fmt.format(c) : "—"}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
