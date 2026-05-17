"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

const TO_RAD: Record<string, number> = {
  deg: Math.PI / 180,
  rad: 1,
  grad: Math.PI / 200,
  turn: 2 * Math.PI,
  arcmin: Math.PI / (180 * 60),
  arcsec: Math.PI / (180 * 3600),
};

const UNITS = Object.keys(TO_RAD);

export default function AngleConverter() {
  const t = useTranslations("tools.angle-converter");
  const locale = useLocale();
  const [value, setValue] = useState("90");
  const [from, setFrom] = useState("deg");

  const allValues = useMemo(() => {
    const v = parseFloat(value);
    if (!isFinite(v)) return null;
    const inRad = v * TO_RAD[from]!;
    return UNITS.map((u) => ({ unit: u, value: inRad / TO_RAD[u]! }));
  }, [value, from]);

  const fmt = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 6 }), [locale]);

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">{t("input.value")}</span>
          <input type="number" step="any" value={value} onChange={(e) => setValue(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-mono text-lg tabular-nums dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.from")}</span>
          <select value={from} onChange={(e) => setFrom(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
            {UNITS.map((u) => (
              <option key={u} value={u}>{t(`unit.${u}`)} ({u})</option>
            ))}
          </select>
        </label>
      </div>

      <div aria-live="polite" className="mt-6 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
        {allValues ? (
          <ul className="grid gap-1">
            {allValues.map((u) => (
              <li key={u.unit} className={`flex justify-between rounded px-2 py-1 ${u.unit === from ? "bg-emerald-50 font-bold dark:bg-emerald-900/20" : ""}`}>
                <span className="text-sm">{t(`unit.${u.unit}`)}</span>
                <span className="tabular-nums">{fmt.format(u.value)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-sm text-slate-600 dark:text-slate-400">{t("empty")}</div>
        )}
      </div>
    </div>
  );
}
