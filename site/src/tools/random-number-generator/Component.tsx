"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

function secureRandomInt(min: number, max: number): number {
  // Inclusive range [min, max]
  const range = max - min + 1;
  if (range <= 0) return min;
  // Reject-based uniform sampling using 32-bit space
  const max32 = 0x100000000;
  const limit = max32 - (max32 % range);
  const buf = new Uint32Array(1);
  while (true) {
    crypto.getRandomValues(buf);
    if (buf[0]! < limit) return min + (buf[0]! % range);
  }
}

export default function RandomNumberGenerator() {
  const t = useTranslations("tools.random-number-generator");
  const locale = useLocale();
  const [min, setMin] = useState("1");
  const [max, setMax] = useState("100");
  const [count, setCount] = useState(5);
  const [unique, setUnique] = useState(false);
  const [list, setList] = useState<number[]>([]);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fmt = useCallback((n: number) => new Intl.NumberFormat(locale).format(n), [locale]);

  const generate = useCallback(() => {
    const a = parseInt(min, 10);
    const b = parseInt(max, 10);
    if (!isFinite(a) || !isFinite(b) || a > b) {
      setError(t("error.invalidRange"));
      setList([]);
      return;
    }
    const span = b - a + 1;
    if (unique && count > span) {
      setError(t("error.tooManyUnique"));
      setList([]);
      return;
    }
    setError(null);
    const out: number[] = [];
    if (unique) {
      const pool = new Set<number>();
      while (pool.size < count) pool.add(secureRandomInt(a, b));
      for (const v of pool) out.push(v);
    } else {
      for (let i = 0; i < count; i++) out.push(secureRandomInt(a, b));
    }
    setList(out);
    setCopied(false);
  }, [min, max, count, unique, t]);

  useEffect(() => {
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function copyAll() {
    if (list.length === 0) return;
    await navigator.clipboard.writeText(list.join(", "));
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block">
          <span className="text-sm font-medium">{t("input.min")}</span>
          <input inputMode="numeric" value={min} onChange={(e) => setMin(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.max")}</span>
          <input inputMode="numeric" value={max} onChange={(e) => setMax(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.count")}</span>
          <input inputMode="numeric" value={count} onChange={(e) => setCount(Math.max(1, Math.min(100, parseInt(e.target.value, 10) || 1)))} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
        </label>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={unique} onChange={(e) => setUnique(e.target.checked)} />
          {t("unique")}
        </label>
        <button onClick={generate} className="rounded bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700">{t("regenerate")}</button>
        {list.length > 0 && (
          <button onClick={copyAll} className="rounded border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800">
            {copied ? t("copied") : t("copyAll")}
          </button>
        )}
      </div>

      <div aria-live="polite" className={`mt-6 rounded-lg border p-4 ${error ? "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/20" : list.length > 0 ? "border-brand-200 bg-brand-50 dark:border-brand-900 dark:bg-brand-900/20" : "border-slate-200 dark:border-slate-800"}`}>
        {error ? (
          <div className="text-sm text-red-700 dark:text-red-300">{error}</div>
        ) : list.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {list.map((n, i) => (
              <span key={i} className="rounded bg-white px-3 py-1 font-mono text-lg tabular-nums dark:bg-slate-900">{fmt(n)}</span>
            ))}
          </div>
        ) : (
          <div className="text-sm text-slate-500">{t("empty")}</div>
        )}
      </div>
    </div>
  );
}
