"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

function factorial(n: number): bigint | null {
  if (n < 0 || !Number.isInteger(n)) return null;
  if (n > 5000) return null;
  let r = 1n;
  for (let i = 2; i <= n; i++) r *= BigInt(i);
  return r;
}

function permutations(n: number, k: number): bigint | null {
  if (n < 0 || k < 0 || k > n || !Number.isInteger(n) || !Number.isInteger(k)) return null;
  let r = 1n;
  for (let i = 0; i < k; i++) r *= BigInt(n - i);
  return r;
}

function combinations(n: number, k: number): bigint | null {
  if (n < 0 || k < 0 || k > n || !Number.isInteger(n) || !Number.isInteger(k)) return null;
  if (k > n - k) k = n - k;
  let r = 1n;
  for (let i = 0; i < k; i++) {
    r *= BigInt(n - i);
    r /= BigInt(i + 1);
  }
  return r;
}

function shorten(s: string, max = 60): string {
  if (s.length <= max) return s;
  return s.slice(0, max / 2) + "..." + s.slice(-max / 2 + 3) + ` (${s.length} digits)`;
}

export default function FactorialCalculator() {
  const t = useTranslations("tools.factorial-calculator");
  const locale = useLocale();
  const [n, setN] = useState("10");
  const [k, setK] = useState("3");

  const result = useMemo(() => {
    const N = parseInt(n, 10);
    const K = parseInt(k, 10);
    return {
      factN: factorial(N),
      perm: permutations(N, K),
      comb: combinations(N, K),
    };
  }, [n, k]);

  const fmt = useMemo(() => new Intl.NumberFormat(locale), [locale]);

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">n</span>
          <input type="number" min={0} max={5000} value={n} onChange={(e) => setN(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-mono text-2xl tabular-nums dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">k {t("input.kHint")}</span>
          <input type="number" min={0} value={k} onChange={(e) => setK(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-mono text-2xl tabular-nums dark:border-slate-700 dark:bg-slate-900" />
        </label>
      </div>

      <div aria-live="polite" className="mt-6 space-y-3">
        <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
          <div className="text-xs font-medium text-slate-600 dark:text-slate-400">n!</div>
          <div className="mt-1 break-all font-mono text-base">{result.factN ? shorten(result.factN.toString()) : t("error.tooLargeOrNeg")}</div>
        </div>
        <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
          <div className="text-xs font-medium text-slate-600 dark:text-slate-400">P(n, k) = n! / (n−k)! ({t("result.permutationsLabel")})</div>
          <div className="mt-1 break-all font-mono text-base">{result.perm ? shorten(result.perm.toString()) : t("error.invalid")}</div>
        </div>
        <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
          <div className="text-xs font-medium text-slate-600 dark:text-slate-400">C(n, k) = n! / (k!(n−k)!) ({t("result.combinationsLabel")})</div>
          <div className="mt-1 break-all font-mono text-base">{result.comb ? shorten(result.comb.toString()) : t("error.invalid")}</div>
        </div>
      </div>
    </div>
  );
}
