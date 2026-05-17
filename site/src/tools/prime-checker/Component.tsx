"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

function isPrime(n: bigint): boolean {
  if (n < 2n) return false;
  if (n < 4n) return true;
  if (n % 2n === 0n) return false;
  if (n % 3n === 0n) return false;
  let i = 5n;
  while (i * i <= n) {
    if (n % i === 0n) return false;
    if (n % (i + 2n) === 0n) return false;
    i += 6n;
  }
  return true;
}

function primeFactors(n: bigint): bigint[] {
  const factors: bigint[] = [];
  let x = n;
  while (x % 2n === 0n) {
    factors.push(2n);
    x /= 2n;
  }
  let i = 3n;
  while (i * i <= x) {
    while (x % i === 0n) {
      factors.push(i);
      x /= i;
    }
    i += 2n;
  }
  if (x > 1n) factors.push(x);
  return factors;
}

function nextPrime(n: bigint): bigint {
  let x = n + 1n;
  while (!isPrime(x)) x++;
  return x;
}

function prevPrime(n: bigint): bigint | null {
  let x = n - 1n;
  while (x >= 2n) {
    if (isPrime(x)) return x;
    x--;
  }
  return null;
}

export default function PrimeChecker() {
  const t = useTranslations("tools.prime-checker");
  const locale = useLocale();
  const [input, setInput] = useState("97");

  const result = useMemo(() => {
    const trimmed = input.trim();
    if (!/^\d+$/.test(trimmed)) return null;
    let n: bigint;
    try {
      n = BigInt(trimmed);
    } catch {
      return null;
    }
    if (n > 10n ** 18n) return { error: "tooLarge" as const };
    const prime = isPrime(n);
    let factors: bigint[] = [];
    let next: bigint | null = null;
    let prev: bigint | null = null;
    try {
      if (!prime && n >= 2n) factors = primeFactors(n);
      next = nextPrime(n);
      prev = prevPrime(n);
    } catch {
      // overflow guard
    }
    return { n, prime, factors, next, prev };
  }, [input]);

  const fmt = useMemo(() => new Intl.NumberFormat(locale), [locale]);

  return (
    <div>
      <label className="block">
        <span className="text-sm font-medium">{t("input.value")}</span>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          inputMode="numeric"
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-mono text-2xl tabular-nums dark:border-slate-700 dark:bg-slate-900"
        />
      </label>

      <div className="mt-3 flex flex-wrap gap-2">
        {["7", "97", "1009", "10007", "1000003", "104729"].map((v) => (
          <button key={v} onClick={() => setInput(v)} className="rounded border border-slate-300 px-3 py-1 text-xs hover:border-brand-500 dark:border-slate-700">
            {v}
          </button>
        ))}
      </div>

      <div aria-live="polite" className="mt-6 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
        {!result ? (
          <div className="text-sm text-slate-600 dark:text-slate-400">{t("empty")}</div>
        ) : "error" in result && result.error === "tooLarge" ? (
          <div className="text-sm text-rose-500">{t("tooLarge")}</div>
        ) : "n" in result ? (
          <div>
            <div className={`flex items-center gap-3 rounded p-3 ${result.prime ? "bg-emerald-50 dark:bg-emerald-900/20" : "bg-amber-50 dark:bg-amber-900/20"}`}>
              <span className={`text-3xl ${result.prime ? "text-emerald-600 dark:text-emerald-400" : "text-amber-700 dark:text-amber-400"}`}>
                {result.prime ? "✓" : "✗"}
              </span>
              <div>
                <div className="text-2xl font-bold tabular-nums">{fmt.format(Number(result.n))}</div>
                <div className="text-sm">{t(result.prime ? "result.isPrime" : "result.notPrime")}</div>
              </div>
            </div>
            {result.factors.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium">{t("result.factors")}</h3>
                <p className="mt-1 font-mono text-base">{result.factors.map((f) => f.toString()).join(" × ")}</p>
              </div>
            )}
            <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
              {result.prev != null && (
                <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800">
                  <dt>{t("result.prevPrime")}</dt>
                  <dd className="tabular-nums">{result.prev.toString()}</dd>
                </div>
              )}
              {result.next != null && (
                <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800">
                  <dt>{t("result.nextPrime")}</dt>
                  <dd className="tabular-nums">{result.next.toString()}</dd>
                </div>
              )}
            </dl>
          </div>
        ) : null}
      </div>
    </div>
  );
}
