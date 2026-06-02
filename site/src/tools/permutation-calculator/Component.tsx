"use client";

import { useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";

function nPr(n: number, r: number): number {
  if (r < 0 || r > n) return 0;
  let result = 1;
  for (let i = 0; i < r; i++) result *= n - i;
  return result;
}

export default function PermutationCalculator() {
  const t = useTranslations("tools.permutation-calculator");
  const locale = useLocale();
  const [n, setN] = useState("");
  const [r, setR] = useState("");

  const result = useMemo(() => {
    const nv = parseInt(n, 10), rv = parseInt(r, 10);
    if (![nv, rv].every(Number.isFinite) || nv < 0 || rv < 0 || rv > nv) return null;
    return nPr(nv, rv);
  }, [n, r]);

  const fmt = useMemo(() => new Intl.NumberFormat(locale), [locale]);

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">{t("input.n")}</span>
          <input inputMode="numeric" value={n} onChange={(e) => setN(e.target.value)} placeholder="10"
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.r")}</span>
          <input inputMode="numeric" value={r} onChange={(e) => setR(e.target.value)} placeholder="3"
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
        </label>
      </div>
      <div className="mt-6 rounded-lg bg-brand-50 p-4 dark:bg-slate-800">
        {result === null ? (
          <p className="text-slate-600 dark:text-slate-400">{t("result.empty")}</p>
        ) : (
          <>
            <p className="text-sm text-slate-600 dark:text-slate-400">{t("result.label")}</p>
            <p className="text-3xl font-bold">{fmt.format(result)}</p>
          </>
        )}
      </div>
    </div>
  );
}
