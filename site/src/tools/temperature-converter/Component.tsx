"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

type Scale = "C" | "F" | "K" | "R";

function toCelsius(value: number, from: Scale): number {
  switch (from) {
    case "C":
      return value;
    case "F":
      return ((value - 32) * 5) / 9;
    case "K":
      return value - 273.15;
    case "R":
      return ((value - 491.67) * 5) / 9;
  }
}

function fromCelsius(c: number, to: Scale): number {
  switch (to) {
    case "C":
      return c;
    case "F":
      return (c * 9) / 5 + 32;
    case "K":
      return c + 273.15;
    case "R":
      return (c + 273.15) * 9 / 5;
  }
}

const SCALES: Scale[] = ["C", "F", "K", "R"];

export default function TemperatureConverter() {
  const t = useTranslations("tools.temperature-converter");
  const locale = useLocale();
  const [value, setValue] = useState("0");
  const [from, setFrom] = useState<Scale>(locale === "en" ? "F" : "C");

  const all = useMemo(() => {
    const v = parseFloat(value);
    if (!isFinite(v)) return null;
    const c = toCelsius(v, from);
    return Object.fromEntries(SCALES.map((s) => [s, fromCelsius(c, s)])) as Record<Scale, number>;
  }, [value, from]);

  const fmt = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 4 }), [locale]);

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
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
            onChange={(e) => setFrom(e.target.value as Scale)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          >
            {SCALES.map((s) => (
              <option key={s} value={s}>
                {t(`scale.${s}`)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div aria-live="polite" className="mt-6 grid gap-2 sm:grid-cols-2">
        {SCALES.map((s) => (
          <div
            key={s}
            className={`flex items-baseline justify-between rounded border px-4 py-3 ${
              s === from
                ? "border-brand-200 bg-brand-50 dark:border-brand-900 dark:bg-brand-900/20"
                : "border-slate-200 dark:border-slate-800"
            }`}
          >
            <span className="font-medium">{t(`scale.${s}`)}</span>
            <span className="text-2xl font-bold tabular-nums">
              {all !== null ? fmt.format(all[s]) : "—"}
              <span className="ml-1 text-base text-slate-500">°{s === "K" || s === "R" ? "" : ""}{s}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
