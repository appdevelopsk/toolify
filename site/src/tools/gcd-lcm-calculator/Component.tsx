"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

function gcd(a: bigint, b: bigint): bigint {
  a = a < 0n ? -a : a;
  b = b < 0n ? -b : b;
  while (b !== 0n) {
    [a, b] = [b, a % b];
  }
  return a;
}

function lcm(a: bigint, b: bigint): bigint {
  if (a === 0n || b === 0n) return 0n;
  const g = gcd(a, b);
  return (a / g) * b < 0n ? -((a / g) * b) : (a / g) * b;
}

function parseInputs(s: string): bigint[] {
  return s
    .split(/[\s,;]+/)
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => {
      try {
        return BigInt(t);
      } catch {
        return null;
      }
    })
    .filter((b): b is bigint => b !== null);
}

function primeFactors(n: bigint): bigint[] {
  const out: bigint[] = [];
  let x = n < 0n ? -n : n;
  while (x % 2n === 0n) {
    out.push(2n);
    x /= 2n;
  }
  let i = 3n;
  while (i * i <= x) {
    while (x % i === 0n) {
      out.push(i);
      x /= i;
    }
    i += 2n;
  }
  if (x > 1n) out.push(x);
  return out;
}

function groupFactors(factors: bigint[]): { p: bigint; e: number }[] {
  const m = new Map<string, { p: bigint; e: number }>();
  for (const p of factors) {
    const k = p.toString();
    if (m.has(k)) m.get(k)!.e++;
    else m.set(k, { p, e: 1 });
  }
  return Array.from(m.values());
}

export default function GcdLcmCalculator() {
  const t = useTranslations("tools.gcd-lcm-calculator");
  const locale = useLocale();
  const [input, setInput] = useState("12, 18, 24");

  const result = useMemo(() => {
    const xs = parseInputs(input);
    if (xs.length < 2) return null;
    const allZero = xs.every((x) => x === 0n);
    if (allZero) return null;
    const g = xs.reduce((a, b) => gcd(a, b));
    let l: bigint | null = 0n;
    try {
      l = xs.reduce((a, b) => lcm(a, b));
    } catch {
      l = null;
    }
    const factorizations = xs.map((x) => ({ n: x, factors: primeFactors(x), grouped: groupFactors(primeFactors(x)) }));
    return { gcd: g, lcm: l, count: xs.length, values: xs, factorizations };
  }, [input]);

  const fmt = useMemo(() => new Intl.NumberFormat(locale), [locale]);

  return (
    <div>
      <label className="block">
        <span className="text-sm font-medium">{t("input.numbers")}</span>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={2}
          placeholder="12, 18, 24"
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-mono text-base tabular-nums dark:border-slate-700 dark:bg-slate-900"
        />
        <span className="text-xs text-slate-600 dark:text-slate-400">{t("input.hint")}</span>
      </label>

      <div aria-live="polite" className="mt-6 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
        {result ? (
          <div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded bg-emerald-50 p-3 dark:bg-emerald-900/20">
                <div className="text-xs font-medium text-emerald-900 dark:text-emerald-200">{t("result.gcd")}</div>
                <div className="font-mono text-3xl font-bold tabular-nums">{result.gcd.toString()}</div>
              </div>
              <div className="rounded bg-amber-50 p-3 dark:bg-amber-900/20">
                <div className="text-xs font-medium text-amber-900 dark:text-amber-200">{t("result.lcm")}</div>
                <div className="font-mono text-3xl font-bold tabular-nums">{result.lcm == null ? "—" : result.lcm.toString()}</div>
              </div>
            </div>
            <h3 className="mt-4 text-sm font-medium">{t("result.factorizations")}</h3>
            <ul className="mt-2 space-y-1">
              {result.factorizations.map((f, i) => (
                <li key={i} className="font-mono text-sm">
                  <span className="font-bold">{f.n.toString()}</span> ={" "}
                  {f.grouped.length === 0 ? (
                    "1"
                  ) : (
                    f.grouped.map((g, j) => (
                      <span key={j}>
                        {j > 0 ? " × " : ""}
                        {g.p.toString()}
                        {g.e > 1 && <sup>{g.e}</sup>}
                      </span>
                    ))
                  )}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="text-sm text-slate-600 dark:text-slate-400">{t("empty")}</div>
        )}
      </div>
    </div>
  );
}
