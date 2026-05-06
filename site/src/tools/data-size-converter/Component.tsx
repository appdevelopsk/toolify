"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

const SI = [
  { code: "B", toBase: 1 },
  { code: "kB", toBase: 1000 },
  { code: "MB", toBase: 1000 ** 2 },
  { code: "GB", toBase: 1000 ** 3 },
  { code: "TB", toBase: 1000 ** 4 },
  { code: "PB", toBase: 1000 ** 5 },
] as const;

const IEC = [
  { code: "B", toBase: 1 },
  { code: "KiB", toBase: 1024 },
  { code: "MiB", toBase: 1024 ** 2 },
  { code: "GiB", toBase: 1024 ** 3 },
  { code: "TiB", toBase: 1024 ** 4 },
  { code: "PiB", toBase: 1024 ** 5 },
] as const;

type Mode = "si" | "iec";
type Unit = string;

export default function DataSizeConverter() {
  const t = useTranslations("tools.data-size-converter");
  const locale = useLocale();
  const [mode, setMode] = useState<Mode>("si");
  const [value, setValue] = useState("1");
  const [from, setFrom] = useState<Unit>("MB");

  const units = mode === "si" ? SI : IEC;
  const fmt = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 6 }), [locale]);

  function convert(v: number, f: Unit, t: Unit): number {
    const fb = units.find((u) => u.code === f)!.toBase;
    const tb = units.find((u) => u.code === t)!.toBase;
    return (v * fb) / tb;
  }

  function setModeAndUnit(m: Mode) {
    setMode(m);
    setFrom(m === "si" ? "MB" : "MiB");
  }

  return (
    <div>
      <div className="mb-4 inline-flex rounded-md border border-slate-300 dark:border-slate-700">
        <button onClick={() => setModeAndUnit("si")} className={`px-3 py-1.5 text-sm ${mode === "si" ? "bg-brand-600 text-white" : ""}`}>
          {t("mode.si")}
        </button>
        <button onClick={() => setModeAndUnit("iec")} className={`px-3 py-1.5 text-sm ${mode === "iec" ? "bg-brand-600 text-white" : ""}`}>
          {t("mode.iec")}
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">{t("input.value")}</span>
          <input inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.from")}</span>
          <select value={from} onChange={(e) => setFrom(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
            {units.map((u) => (
              <option key={u.code} value={u.code}>
                {u.code}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div aria-live="polite" className="mt-6 grid gap-2 sm:grid-cols-2">
        {units.filter((u) => u.code !== from).map((u) => {
          const v = parseFloat(value);
          const c = isFinite(v) ? convert(v, from, u.code) : null;
          return (
            <div key={u.code} className="flex items-baseline justify-between rounded border border-slate-200 px-3 py-2 text-sm dark:border-slate-800">
              <span className="text-slate-500">{u.code}</span>
              <span className="tabular-nums">{c !== null ? fmt.format(c) : "—"}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
