"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

const UNITS = [
  { code: "mm", toMeter: 0.001 },
  { code: "cm", toMeter: 0.01 },
  { code: "m", toMeter: 1 },
  { code: "km", toMeter: 1000 },
  { code: "in", toMeter: 0.0254 },
  { code: "ft", toMeter: 0.3048 },
  { code: "yd", toMeter: 0.9144 },
  { code: "mi", toMeter: 1609.344 },
] as const;

type UnitCode = (typeof UNITS)[number]["code"];

function convert(value: number, from: UnitCode, to: UnitCode): number {
  const fromMeter = UNITS.find((u) => u.code === from)!.toMeter;
  const toMeter = UNITS.find((u) => u.code === to)!.toMeter;
  return (value * fromMeter) / toMeter;
}

export default function LengthConverter() {
  const t = useTranslations("tools.length-converter");
  const locale = useLocale();
  const [value, setValue] = useState("1");
  const [from, setFrom] = useState<UnitCode>("m");
  const [to, setTo] = useState<UnitCode>("ft");

  const result = useMemo(() => {
    const v = parseFloat(value);
    if (!isFinite(v)) return null;
    const r = convert(v, from, to);
    return r;
  }, [value, from, to]);

  const fmt = useMemo(
    () => new Intl.NumberFormat(locale, { maximumFractionDigits: 8, useGrouping: true }),
    [locale],
  );

  function swap() {
    setFrom(to);
    setTo(from);
  }

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
        <label className="block">
          <span className="text-sm font-medium">{t("input.value")}</span>
          <input
            inputMode="decimal"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          />
          <select
            value={from}
            onChange={(e) => setFrom(e.target.value as UnitCode)}
            className="mt-2 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          >
            {UNITS.map((u) => (
              <option key={u.code} value={u.code}>
                {t(`unit.${u.code}`)}
              </option>
            ))}
          </select>
        </label>
        <button
          onClick={swap}
          aria-label={t("swap")}
          className="mb-2 mx-auto rounded-full border border-slate-300 p-2 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          ⇅
        </button>
        <label className="block">
          <span className="text-sm font-medium">{t("output.value")}</span>
          <div
            aria-live="polite"
            className="mt-1 min-h-[42px] rounded border border-slate-200 bg-slate-50 px-3 py-2 tabular-nums dark:border-slate-800 dark:bg-slate-950"
          >
            {result !== null ? fmt.format(result) : "—"}
          </div>
          <select
            value={to}
            onChange={(e) => setTo(e.target.value as UnitCode)}
            className="mt-2 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          >
            {UNITS.map((u) => (
              <option key={u.code} value={u.code}>
                {t(`unit.${u.code}`)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-6 grid gap-2 sm:grid-cols-2">
        {UNITS.filter((u) => u.code !== from).map((u) => {
          const v = parseFloat(value);
          const conv = isFinite(v) ? convert(v, from, u.code) : null;
          return (
            <div
              key={u.code}
              className="flex items-baseline justify-between rounded border border-slate-200 px-3 py-2 text-sm dark:border-slate-800"
            >
              <span className="text-slate-500">{t(`unit.${u.code}`)}</span>
              <span className="tabular-nums">{conv !== null ? fmt.format(conv) : "—"}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
