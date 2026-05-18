"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

interface Factor {
  prime: number;
  exponent: number;
}

function factorize(n: number): Factor[] | null {
  if (!Number.isInteger(n) || n < 2 || n > 1_000_000_000) return null;
  const factors: Factor[] = [];
  let remaining = n;
  for (let p = 2; p * p <= remaining; p++) {
    if (remaining % p === 0) {
      let exp = 0;
      while (remaining % p === 0) { exp++; remaining /= p; }
      factors.push({ prime: p, exponent: exp });
    }
  }
  if (remaining > 1) factors.push({ prime: remaining, exponent: 1 });
  return factors;
}

function formatProduct(factors: Factor[]): string {
  return factors.map(({ prime, exponent }) =>
    exponent === 1 ? `${prime}` : `${prime}^${exponent}`
  ).join(" × ");
}

function formatSuperscript(exp: number): string {
  const sup = "⁰¹²³⁴⁵⁶⁷⁸⁹";
  return String(exp).split("").map((d) => sup[Number(d)] ?? d).join("");
}

export default function PrimeFactorization() {
  const t = useTranslations("tools.prime-factorization");
  const locale = useLocale();
  const [input, setInput] = useState("360");

  const fmt = useMemo(() => new Intl.NumberFormat(locale), [locale]);

  const result = useMemo(() => {
    const n = parseInt(input.trim(), 10);
    if (isNaN(n)) return null;
    if (n < 2) return { n, factors: null, error: "too-small" as const };
    if (n > 1_000_000_000) return { n, factors: null, error: "too-large" as const };
    const factors = factorize(n);
    return { n, factors, error: null };
  }, [input]);

  const inputClass = "rounded border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900";

  const isPrime = result?.factors?.length === 1 && result.factors[0]?.exponent === 1;

  return (
    <div className="space-y-5">
      <label className="block max-w-xs">
        <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
          {t("input.label")}
        </span>
        <input
          inputMode="numeric"
          value={input}
          onChange={(e) => setInput(e.target.value.replace(/[^0-9]/g, ""))}
          placeholder="360"
          className={inputClass + " w-full"}
        />
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t("input.hint")}</p>
      </label>

      {result?.error === "too-small" && (
        <p className="text-sm text-amber-700 dark:text-amber-400">{t("error.tooSmall")}</p>
      )}
      {result?.error === "too-large" && (
        <p className="text-sm text-amber-700 dark:text-amber-400">{t("error.tooLarge")}</p>
      )}

      {result?.factors && (
        <div aria-live="polite" className="space-y-4">
          {isPrime ? (
            <div className="rounded-lg bg-brand-50 p-4 dark:bg-brand-900/20">
              <p className="text-sm font-medium text-brand-700 dark:text-brand-300">{t("result.isPrime")}</p>
              <p className="mt-1 text-3xl font-bold text-brand-600 dark:text-brand-400">
                {fmt.format(result.n)}
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-lg bg-brand-50 p-4 dark:bg-brand-900/20">
                <p className="text-sm font-medium text-brand-700 dark:text-brand-300">
                  {t("result.factorization")}
                </p>
                <p className="mt-2 text-2xl font-bold text-brand-600 dark:text-brand-400 font-mono">
                  {fmt.format(result.n)} = {result.factors.map(({ prime, exponent }, i) => (
                    <span key={prime}>
                      {i > 0 && " × "}
                      <span>{prime}</span>
                      {exponent > 1 && <sup className="text-base">{formatSuperscript(exponent)}</sup>}
                    </span>
                  ))}
                </p>
              </div>

              <div className="overflow-x-auto rounded border border-slate-200 dark:border-slate-800">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800">
                    <tr>
                      <th className="px-4 py-2 text-left font-semibold text-slate-700 dark:text-slate-300">{t("col.prime")}</th>
                      <th className="px-4 py-2 text-left font-semibold text-slate-700 dark:text-slate-300">{t("col.exponent")}</th>
                      <th className="px-4 py-2 text-left font-semibold text-slate-700 dark:text-slate-300">{t("col.value")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {result.factors.map(({ prime, exponent }) => (
                      <tr key={prime} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="px-4 py-2 font-mono font-semibold">{prime}</td>
                        <td className="px-4 py-2 font-mono">
                          {exponent > 1 ? (
                            <span>{prime}<sup>{formatSuperscript(exponent)}</sup></span>
                          ) : "1"}
                        </td>
                        <td className="px-4 py-2 font-mono text-slate-600 dark:text-slate-400">
                          {fmt.format(Math.pow(prime, exponent))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t("result.notation", { text: formatProduct(result.factors) })}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
