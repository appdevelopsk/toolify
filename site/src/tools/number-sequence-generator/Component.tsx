"use client";

import { useMemo, useState, useCallback } from "react";
import { useTranslations } from "next-intl";

// ── Sequence generators ────────────────────────────────────────────────────

type SeqType = "arithmetic" | "geometric" | "fibonacci" | "square" | "prime" | "triangular";

function genArithmetic(a: number, d: number, n: number): number[] {
  return Array.from({ length: n }, (_, i) => a + i * d);
}

function genGeometric(a: number, r: number, n: number): number[] {
  const result: number[] = [];
  let current = a;
  for (let i = 0; i < n; i++) {
    result.push(current);
    current *= r;
  }
  return result;
}

function genFibonacci(a: number, b: number, n: number): number[] {
  if (n === 0) return [];
  if (n === 1) return [a];
  const result = [a, b];
  for (let i = 2; i < n; i++) {
    result.push(result[i - 1]! + result[i - 2]!);
  }
  return result;
}

function genSquare(n: number): number[] {
  return Array.from({ length: n }, (_, i) => (i + 1) * (i + 1));
}

function genPrimes(n: number): number[] {
  const primes: number[] = [];
  let candidate = 2;
  while (primes.length < n) {
    let isPrime = true;
    for (let i = 0; i < primes.length; i++) {
      const p = primes[i]!;
      if (p * p > candidate) break;
      if (candidate % p === 0) { isPrime = false; break; }
    }
    if (isPrime) primes.push(candidate);
    candidate++;
  }
  return primes;
}

function genTriangular(n: number): number[] {
  return Array.from({ length: n }, (_, i) => ((i + 1) * (i + 2)) / 2);
}

function nthTermFormula(type: SeqType, a: number, d: number, r: number): string {
  switch (type) {
    case "arithmetic":  return `a(n) = ${a} + (n−1)×${d}`;
    case "geometric":   return `a(n) = ${a} × ${r}^(n−1)`;
    case "fibonacci":   return "a(n) = a(n−1) + a(n−2)";
    case "square":      return "a(n) = n²";
    case "prime":       return "No closed-form formula";
    case "triangular":  return "a(n) = n(n+1)/2";
  }
}

function formatNum(n: number): string {
  if (!isFinite(n)) return "∞";
  if (Math.abs(n) > 1e15) return n.toExponential(3);
  if (Number.isInteger(n)) return n.toLocaleString("en");
  return +n.toPrecision(6) + "";
}

// ── Component ──────────────────────────────────────────────────────────────

export default function NumberSequenceGenerator() {
  const t = useTranslations("tools.number-sequence-generator");

  const [seqType, setSeqType] = useState<SeqType>("arithmetic");
  const [firstTerm, setFirstTerm] = useState("1");
  const [secondTerm, setSecondTerm] = useState("1");
  const [commonDiff, setCommonDiff] = useState("2");
  const [commonRatio, setCommonRatio] = useState("2");
  const [numTerms, setNumTerms] = useState("10");
  const [copied, setCopied] = useState(false);

  const sequence = useMemo(() => {
    const n = Math.min(50, Math.max(1, parseInt(numTerms) || 10));
    const a = parseFloat(firstTerm) || 0;
    const b = parseFloat(secondTerm) || 1;
    const d = parseFloat(commonDiff) || 0;
    const r = parseFloat(commonRatio) || 1;

    switch (seqType) {
      case "arithmetic":  return genArithmetic(a, d, n);
      case "geometric":   return genGeometric(a, r, n);
      case "fibonacci":   return genFibonacci(a, b, n);
      case "square":      return genSquare(n);
      case "prime":       return genPrimes(n);
      case "triangular":  return genTriangular(n);
    }
  }, [seqType, firstTerm, secondTerm, commonDiff, commonRatio, numTerms]);

  const sum = useMemo(() => sequence.reduce((acc, v) => acc + v, 0), [sequence]);

  const formula = useMemo(
    () =>
      nthTermFormula(
        seqType,
        parseFloat(firstTerm) || 0,
        parseFloat(commonDiff) || 0,
        parseFloat(commonRatio) || 1,
      ),
    [seqType, firstTerm, commonDiff, commonRatio],
  );

  const seqString = sequence.map(formatNum).join(", ");

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(seqString).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [seqString]);

  const inputClass =
    "w-full rounded border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900";

  const SEQ_TYPES: SeqType[] = ["arithmetic", "geometric", "fibonacci", "square", "prime", "triangular"];

  return (
    <div className="space-y-5">
      {/* Sequence type */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          {t("input.type")}
        </label>
        <div className="flex flex-wrap gap-2">
          {SEQ_TYPES.map((s) => (
            <button
              key={s}
              onClick={() => setSeqType(s)}
              className={`rounded border px-3 py-1.5 text-sm font-medium transition-colors ${
                seqType === s
                  ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-300"
                  : "border-slate-300 hover:border-brand-400 dark:border-slate-700 dark:hover:border-brand-600"
              }`}
            >
              {t(`type.${s}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Parameters */}
      <div className="grid gap-3 sm:grid-cols-3">
        {(seqType === "arithmetic" || seqType === "geometric" || seqType === "fibonacci") && (
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              {t("input.firstTerm")}
            </label>
            <input
              type="number"
              value={firstTerm}
              onChange={(e) => setFirstTerm(e.target.value)}
              className={inputClass}
            />
          </div>
        )}

        {seqType === "fibonacci" && (
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              {t("input.secondTerm")}
            </label>
            <input
              type="number"
              value={secondTerm}
              onChange={(e) => setSecondTerm(e.target.value)}
              className={inputClass}
            />
          </div>
        )}

        {seqType === "arithmetic" && (
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              {t("input.commonDiff")}
            </label>
            <input
              type="number"
              value={commonDiff}
              onChange={(e) => setCommonDiff(e.target.value)}
              className={inputClass}
            />
          </div>
        )}

        {seqType === "geometric" && (
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              {t("input.commonRatio")}
            </label>
            <input
              type="number"
              value={commonRatio}
              onChange={(e) => setCommonRatio(e.target.value)}
              className={inputClass}
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
            {t("input.terms")} (1–50)
          </label>
          <input
            type="number"
            min={1}
            max={50}
            value={numTerms}
            onChange={(e) => setNumTerms(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      {/* Result */}
      <div aria-live="polite" className="space-y-3">
        {/* Sequence display */}
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {t("result.sequence")}
            </span>
            <button
              onClick={handleCopy}
              className="rounded border border-slate-300 dark:border-slate-600 px-3 py-1 text-xs font-medium hover:bg-white dark:hover:bg-slate-700 transition-colors"
            >
              {copied ? t("copied") : t("copy")}
            </button>
          </div>
          <div className="px-4 py-3 font-mono text-sm leading-relaxed break-words text-slate-800 dark:text-slate-200">
            {seqString}
          </div>
        </div>

        {/* Term chips (visual) */}
        {sequence.length <= 20 && (
          <div className="flex flex-wrap gap-1.5">
            {sequence.map((v, i) => (
              <span
                key={i}
                className="inline-block rounded bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 px-2.5 py-1 text-sm font-mono text-brand-700 dark:text-brand-300"
              >
                {formatNum(v)}
              </span>
            ))}
          </div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 px-4 py-3">
            <p className="text-xs text-slate-500 dark:text-slate-400">{t("result.sum")}</p>
            <p className="mt-0.5 font-mono font-bold text-slate-800 dark:text-slate-100 truncate">
              {formatNum(sum)}
            </p>
          </div>
          <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 px-4 py-3 sm:col-span-2">
            <p className="text-xs text-slate-500 dark:text-slate-400">{t("result.nth", { n: "n" })}</p>
            <p className="mt-0.5 font-mono text-sm text-slate-700 dark:text-slate-300 break-all">
              {formula}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
