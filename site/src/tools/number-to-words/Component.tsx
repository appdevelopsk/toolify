"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

// ---- Conversion logic ----

const ONES = [
  "", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
  "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen",
  "seventeen", "eighteen", "nineteen",
];

const TENS = [
  "", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety",
];

const MAGNITUDES = [
  "", "thousand", "million", "billion", "trillion", "quadrillion",
];

// MAX: 999 quadrillion (15 digits integer part)
const MAX_INT = 999_999_999_999_999_999n; // BigInt ceiling

function threeDigitsToWords(n: number): string {
  if (n === 0) return "";
  const h = Math.floor(n / 100);
  const rem = n % 100;
  const t = Math.floor(rem / 10);
  const o = rem % 10;

  const parts: string[] = [];
  if (h > 0) parts.push(`${ONES[h]} hundred`);

  if (rem < 20) {
    if (ONES[rem]) parts.push(ONES[rem]!);
  } else {
    const tensWord = TENS[t]!;
    const onesWord = o > 0 ? ONES[o]! : "";
    parts.push(onesWord ? `${tensWord}-${onesWord}` : tensWord);
  }

  return parts.join(" ");
}

function integerToWords(absInt: bigint): string {
  if (absInt === 0n) return "zero";

  const groups: number[] = [];
  let remaining = absInt;
  while (remaining > 0n) {
    groups.push(Number(remaining % 1000n));
    remaining = remaining / 1000n;
  }

  const parts: string[] = [];
  for (let i = groups.length - 1; i >= 0; i--) {
    const g = groups[i]!;
    if (g === 0) continue;
    const words = threeDigitsToWords(g);
    const mag = MAGNITUDES[i]!;
    parts.push(mag ? `${words} ${mag}` : words);
  }

  return parts.join(" ");
}

type ConvertResult =
  | { ok: true; words: string; formatted: string; wordCount: number }
  | { ok: false; error: string };

function convert(raw: string, errorMsg: string): ConvertResult {
  const trimmed = raw.trim();
  if (!trimmed) return { ok: true, words: "", formatted: "", wordCount: 0 };

  const negative = trimmed.startsWith("-");
  const unsigned = negative ? trimmed.slice(1) : trimmed;

  // Validate format: digits, optional single decimal point
  if (!/^\d+(\.\d+)?$/.test(unsigned)) {
    return { ok: false, error: errorMsg };
  }

  const [intPart, fracPart] = unsigned.split(".");
  const intVal = intPart ? BigInt(intPart) : 0n;

  // Range check
  if (intVal > MAX_INT) {
    return { ok: false, error: errorMsg };
  }

  // Build words
  const intWords = integerToWords(intVal === 0n && !fracPart ? 0n : intVal);
  let words = intVal === 0n && fracPart ? "zero" : intWords;

  if (negative) words = `negative ${words}`;

  if (fracPart) {
    const digitWords = fracPart.split("").map((d) => ONES[parseInt(d, 10)]!).join(" ");
    words = `${words} point ${digitWords}`;
  }

  // Formatted number with commas
  let formatted: string;
  try {
    const numericValue = parseFloat(trimmed);
    if (fracPart) {
      formatted = new Intl.NumberFormat("en-US", {
        minimumFractionDigits: fracPart.length,
        maximumFractionDigits: fracPart.length,
      }).format(numericValue);
    } else {
      formatted = new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 0,
      }).format(numericValue);
    }
  } catch {
    formatted = trimmed;
  }

  const wordCount = words.split(/\s+/).filter(Boolean).length;
  return { ok: true, words, formatted, wordCount };
}

// ---- Component ----

export default function NumberToWordsConverter() {
  const t = useTranslations("tools.number-to-words");
  const [input, setInput] = useState("");

  const result = useMemo(
    () => convert(input, t("error.outOfRange")),
    [input, t]
  );

  return (
    <div>
      <label className="block">
        <span className="text-sm font-medium">{t("input.label")}</span>
        <input
          type="text"
          inputMode="decimal"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="1234567"
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-mono text-lg dark:border-slate-700 dark:bg-slate-900"
        />
      </label>

      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{t("note.englishOnly")}</p>

      <div
        aria-live="polite"
        className={`mt-4 rounded-lg border p-4 ${
          result.ok
            ? "border-brand-200 bg-brand-50 dark:border-brand-900 dark:bg-brand-900/20"
            : "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
        }`}
      >
        {result.ok ? (
          result.words ? (
            <div className="space-y-3">
              <div>
                <div className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  {t("output.words")}
                </div>
                <div className="mt-1 text-xl font-semibold leading-snug capitalize">
                  {result.words}
                </div>
              </div>
              <div className="flex flex-wrap gap-6">
                <div>
                  <div className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    {t("output.formatted")}
                  </div>
                  <div className="mt-0.5 font-mono text-lg tabular-nums">{result.formatted}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    {t("output.wordCount")}
                  </div>
                  <div className="mt-0.5 font-mono text-lg tabular-nums">{result.wordCount}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-slate-400 dark:text-slate-500">—</div>
          )
        ) : (
          <div className="text-sm text-red-700 dark:text-red-300">{result.error}</div>
        )}
      </div>
    </div>
  );
}
