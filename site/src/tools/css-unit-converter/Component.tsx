"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

const DEFAULT_BASE = 16;

function sig4(n: number): number {
  if (!isFinite(n) || n === 0) return 0;
  const f = Math.pow(10, 4 - Math.floor(Math.log10(Math.abs(n))) - 1);
  return Math.round(n * f) / f;
}

interface Conversion {
  unit: string;
  value: number | null;
  formula: string;
}

function convert(px: number, base: number): Conversion[] {
  return [
    { unit: "px", value: sig4(px), formula: "1px = 1px" },
    { unit: "rem", value: sig4(px / base), formula: `1rem = ${base}px` },
    { unit: "em", value: sig4(px / base), formula: `1em = ${base}px (assumes same base)` },
    { unit: "pt", value: sig4(px * 0.75), formula: "1pt = 1.333px" },
    { unit: "%", value: sig4((px / base) * 100), formula: `base = ${base}px` },
  ];
}

function fromUnit(value: number, unit: string, base: number): number {
  switch (unit) {
    case "px": return value;
    case "rem":
    case "em": return value * base;
    case "pt": return value / 0.75;
    case "%": return (value / 100) * base;
    default: return value;
  }
}

const UNITS = ["px", "rem", "em", "pt", "%"] as const;
type Unit = (typeof UNITS)[number];

export default function CssUnitConverter() {
  const t = useTranslations("tools.css-unit-converter");
  const [value, setValue] = useState("16");
  const [fromUnit, setFromUnit] = useState<Unit>("px");
  const [base, setBase] = useState(String(DEFAULT_BASE));

  const baseParsed = parseFloat(base);
  const validBase = isFinite(baseParsed) && baseParsed > 0 ? baseParsed : DEFAULT_BASE;

  const pxValue = useMemo(() => {
    const v = parseFloat(value);
    if (!isFinite(v)) return null;
    switch (fromUnit) {
      case "px": return v;
      case "rem":
      case "em": return v * validBase;
      case "pt": return v / 0.75;
      case "%": return (v / 100) * validBase;
      default: return v;
    }
  }, [value, fromUnit, validBase]);

  const results = useMemo(() => {
    if (pxValue === null) return [];
    return convert(pxValue, validBase).filter((c) => c.unit !== fromUnit);
  }, [pxValue, fromUnit, validBase]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block sm:col-span-1">
          <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            {t("input.value")}
          </span>
          <div className="flex gap-2">
            <input
              inputMode="decimal"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full rounded border border-slate-300 px-3 py-2 font-mono text-sm dark:border-slate-700 dark:bg-slate-900"
            />
            <select
              value={fromUnit}
              onChange={(e) => setFromUnit(e.target.value as Unit)}
              className="rounded border border-slate-300 px-2 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
            >
              {UNITS.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
        </label>

        <label className="block sm:col-span-1">
          <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            {t("input.base")}
          </span>
          <input
            inputMode="decimal"
            value={base}
            onChange={(e) => setBase(e.target.value)}
            placeholder="16"
            className="w-full rounded border border-slate-300 px-3 py-2 font-mono text-sm dark:border-slate-700 dark:bg-slate-900"
          />
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{t("input.baseHint")}</p>
        </label>
      </div>

      <div aria-live="polite" className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((r) => (
          <div
            key={r.unit}
            className="flex items-baseline justify-between rounded border border-slate-200 px-3 py-2 text-sm dark:border-slate-800"
          >
            <span className="font-mono font-semibold text-brand-600 dark:text-brand-400">
              {r.unit}
            </span>
            <span className="tabular-nums font-medium">
              {r.value !== null ? `${r.value} ${r.unit}` : "—"}
            </span>
          </div>
        ))}
      </div>

      {pxValue !== null && (
        <p className="text-xs text-slate-600 dark:text-slate-400">
          {t("note.basePx", { base: validBase })}
        </p>
      )}
    </div>
  );
}
