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

const SCALE_SYMBOL: Record<Scale, string> = { C: "°C", F: "°F", K: "K", R: "°R" };

// Temperatures people actually check: cooking, health, weather, household
const QUICK_REF: Array<{ id: string; value: number; unit: Scale; ref: Scale }> = [
  { id: "absoluteZero", value: -273.15, unit: "C", ref: "F" },
  { id: "freezer", value: -18, unit: "C", ref: "F" },
  { id: "freezing", value: 0, unit: "C", ref: "F" },
  { id: "fridge", value: 4, unit: "C", ref: "F" },
  { id: "room", value: 20, unit: "C", ref: "F" },
  { id: "summer", value: 30, unit: "C", ref: "F" },
  { id: "body", value: 37, unit: "C", ref: "F" },
  { id: "fever", value: 39, unit: "C", ref: "F" },
  { id: "bath", value: 41, unit: "C", ref: "F" },
  { id: "sauna", value: 80, unit: "C", ref: "F" },
  { id: "boiling", value: 100, unit: "C", ref: "F" },
  { id: "ovenLow", value: 150, unit: "C", ref: "F" },
  { id: "ovenModerate", value: 180, unit: "C", ref: "F" },
  { id: "ovenHot", value: 220, unit: "C", ref: "F" },
];

function convertScale(value: number, from: Scale, to: Scale): number {
  return fromCelsius(toCelsius(value, from), to);
}

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
              <span className="ml-1 text-base text-slate-600 dark:text-slate-400">°{s === "K" || s === "R" ? "" : ""}{s}</span>
            </span>
          </div>
        ))}
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
                    {fmtRef.format(r.value)} {SCALE_SYMBOL[r.unit]}
                  </td>
                  <td className="whitespace-nowrap py-2 pr-2 text-right tabular-nums">
                    {fmtRef.format(convertScale(r.value, r.unit, r.ref))} {SCALE_SYMBOL[r.ref]}
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
