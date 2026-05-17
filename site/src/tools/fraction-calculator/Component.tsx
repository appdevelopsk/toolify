"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

type Op = "+" | "-" | "*" | "/";

function gcd(a: bigint, b: bigint): bigint {
  a = a < 0n ? -a : a;
  b = b < 0n ? -b : b;
  while (b !== 0n) {
    [a, b] = [b, a % b];
  }
  return a;
}

function simplify(n: bigint, d: bigint): { n: bigint; d: bigint } {
  if (d === 0n) return { n, d };
  const g = gcd(n, d);
  let nn = n / g;
  let dd = d / g;
  if (dd < 0n) {
    nn = -nn;
    dd = -dd;
  }
  return { n: nn, d: dd };
}

function compute(n1: bigint, d1: bigint, op: Op, n2: bigint, d2: bigint): { n: bigint; d: bigint } | null {
  if (d1 === 0n || d2 === 0n) return null;
  if (op === "+") return simplify(n1 * d2 + n2 * d1, d1 * d2);
  if (op === "-") return simplify(n1 * d2 - n2 * d1, d1 * d2);
  if (op === "*") return simplify(n1 * n2, d1 * d2);
  if (op === "/") {
    if (n2 === 0n) return null;
    return simplify(n1 * d2, d1 * n2);
  }
  return null;
}

function toMixed(n: bigint, d: bigint): { whole: bigint; n: bigint; d: bigint } {
  const sign = (n < 0n) !== (d < 0n) ? -1n : 1n;
  const an = n < 0n ? -n : n;
  const ad = d < 0n ? -d : d;
  const whole = sign * (an / ad);
  const rem = an % ad;
  return { whole, n: rem, d: ad };
}

export default function FractionCalculator() {
  const t = useTranslations("tools.fraction-calculator");
  const locale = useLocale();
  const [n1, setN1] = useState("1");
  const [d1, setD1] = useState("2");
  const [op, setOp] = useState<Op>("+");
  const [n2, setN2] = useState("3");
  const [d2, setD2] = useState("4");

  const result = useMemo(() => {
    try {
      const N1 = BigInt(n1.trim());
      const D1 = BigInt(d1.trim());
      const N2 = BigInt(n2.trim());
      const D2 = BigInt(d2.trim());
      const r = compute(N1, D1, op, N2, D2);
      if (!r) return null;
      const decimal = Number(r.n) / Number(r.d);
      const mixed = toMixed(r.n, r.d);
      return { ...r, decimal, mixed };
    } catch {
      return null;
    }
  }, [n1, d1, op, n2, d2]);

  const fmt = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 8 }), [locale]);

  function FracInput({ n, d, setN, setD }: { n: string; d: string; setN: (v: string) => void; setD: (v: string) => void }) {
    return (
      <div className="flex flex-col items-center">
        <input value={n} onChange={(e) => setN(e.target.value)} className="w-24 rounded border border-slate-300 px-2 py-1 text-center font-mono text-xl tabular-nums dark:border-slate-700 dark:bg-slate-900" />
        <div className="my-1 h-px w-24 bg-slate-400" />
        <input value={d} onChange={(e) => setD(e.target.value)} className="w-24 rounded border border-slate-300 px-2 py-1 text-center font-mono text-xl tabular-nums dark:border-slate-700 dark:bg-slate-900" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-center gap-3">
        <FracInput n={n1} d={d1} setN={setN1} setD={setD1} />
        <select value={op} onChange={(e) => setOp(e.target.value as Op)} className="rounded border border-slate-300 px-3 py-2 font-mono text-2xl dark:border-slate-700 dark:bg-slate-900">
          <option value="+">+</option>
          <option value="-">−</option>
          <option value="*">×</option>
          <option value="/">÷</option>
        </select>
        <FracInput n={n2} d={d2} setN={setN2} setD={setD2} />
      </div>

      <div aria-live="polite" className="mt-6 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
        {result ? (
          <div>
            <div className="rounded bg-emerald-50 px-3 py-3 text-center dark:bg-emerald-900/20">
              <div className="text-xs font-medium text-emerald-900 dark:text-emerald-200">{t("result.simplified")}</div>
              <div className="font-mono text-3xl">
                <span className="inline-block align-middle text-center">
                  <div>{result.n.toString()}</div>
                  <div className="border-t border-slate-700 dark:border-slate-300">{result.d.toString()}</div>
                </span>
              </div>
            </div>
            <dl className="mt-4 grid gap-2 text-sm">
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800">
                <dt>{t("result.decimal")}</dt>
                <dd className="tabular-nums">{fmt.format(result.decimal)}</dd>
              </div>
              {result.mixed.whole !== 0n && (
                <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800">
                  <dt>{t("result.mixed")}</dt>
                  <dd className="tabular-nums font-mono">
                    {result.mixed.whole.toString()}
                    {result.mixed.n !== 0n && (
                      <span className="ml-1">{(result.mixed.n < 0n ? -result.mixed.n : result.mixed.n).toString()}/{result.mixed.d.toString()}</span>
                    )}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        ) : (
          <div className="text-sm text-slate-600 dark:text-slate-400">{t("empty")}</div>
        )}
      </div>
    </div>
  );
}
