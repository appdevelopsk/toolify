"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

type Base = 2 | 8 | 10 | 16;

const BASES: Base[] = [2, 8, 10, 16];
const BASE_LABEL: Record<Base, string> = { 2: "Binary (2)", 8: "Octal (8)", 10: "Decimal (10)", 16: "Hexadecimal (16)" };

function isValidForBase(value: string, base: Base): boolean {
  const trimmed = value.trim().replace(/^-/, "");
  if (!trimmed) return false;
  if (base === 2) return /^[01]+$/.test(trimmed);
  if (base === 8) return /^[0-7]+$/.test(trimmed);
  if (base === 10) return /^\d+$/.test(trimmed);
  if (base === 16) return /^[0-9a-fA-F]+$/.test(trimmed);
  return false;
}

export default function NumberBaseConverter() {
  const t = useTranslations("tools.number-base-converter");
  const [value, setValue] = useState("255");
  const [from, setFrom] = useState<Base>(10);

  const results = useMemo(() => {
    const cleaned = value.trim();
    if (!cleaned) return null;
    const negative = cleaned.startsWith("-");
    const abs = negative ? cleaned.slice(1) : cleaned;
    if (!isValidForBase(abs, from)) return { error: true } as const;
    const n = parseInt(abs, from);
    if (!isFinite(n) || n < 0) return { error: true } as const;
    const signed = negative ? -n : n;
    const out: Record<Base, string> = {} as Record<Base, string>;
    for (const b of BASES) {
      const s = Math.abs(signed).toString(b);
      out[b] = (signed < 0 ? "-" : "") + (b === 16 ? s.toUpperCase() : s);
    }
    return { error: false, ...out } as const;
  }, [value, from]);

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">{t("input.value")}</span>
          <input value={value} onChange={(e) => setValue(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-mono dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.from")}</span>
          <select value={from} onChange={(e) => setFrom(parseInt(e.target.value, 10) as Base)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
            {BASES.map((b) => (
              <option key={b} value={b}>{BASE_LABEL[b]}</option>
            ))}
          </select>
        </label>
      </div>

      <div aria-live="polite" className="mt-6">
        {results && results.error ? (
          <div className="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
            {t("error.invalidForBase")}
          </div>
        ) : (
          <dl className="space-y-2">
            {BASES.map((b) => (
              <div key={b} className={`flex items-center justify-between rounded border px-4 py-3 ${b === from ? "border-brand-200 bg-brand-50 dark:border-brand-900 dark:bg-brand-900/20" : "border-slate-200 dark:border-slate-800"}`}>
                <dt className="font-medium">{BASE_LABEL[b]}</dt>
                <dd className="font-mono text-lg tabular-nums">{results && !results.error ? results[b] : "—"}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </div>
  );
}
