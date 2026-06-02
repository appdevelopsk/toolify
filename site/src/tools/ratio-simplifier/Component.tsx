"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

function gcd(a: number, b: number): number {
  a = Math.abs(a); b = Math.abs(b);
  while (b) { [a, b] = [b, a % b]; }
  return a || 1;
}

export default function RatioSimplifier() {
  const t = useTranslations("tools.ratio-simplifier");
  const [a, setA] = useState("");
  const [b, setB] = useState("");

  const result = useMemo(() => {
    const av = parseInt(a, 10), bv = parseInt(b, 10);
    if (![av, bv].every(Number.isFinite) || av === 0 || bv === 0) return null;
    const g = gcd(av, bv);
    return `${av / g} : ${bv / g}`;
  }, [a, b]);

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">{t("input.a")}</span>
          <input inputMode="numeric" value={a} onChange={(e) => setA(e.target.value)} placeholder="1920"
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.b")}</span>
          <input inputMode="numeric" value={b} onChange={(e) => setB(e.target.value)} placeholder="1080"
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
        </label>
      </div>
      <div className="mt-6 rounded-lg bg-brand-50 p-4 dark:bg-slate-800">
        {result === null ? (
          <p className="text-slate-600 dark:text-slate-400">{t("result.empty")}</p>
        ) : (
          <>
            <p className="text-sm text-slate-600 dark:text-slate-400">{t("result.label")}</p>
            <p className="text-3xl font-bold tabular-nums">{result}</p>
          </>
        )}
      </div>
    </div>
  );
}
