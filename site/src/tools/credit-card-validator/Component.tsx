"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

const CARD_PATTERNS: { brand: string; re: RegExp; lengths: number[] }[] = [
  { brand: "Visa", re: /^4/, lengths: [13, 16, 19] },
  { brand: "Mastercard", re: /^(5[1-5]|2(2[2-9][0-9]|[3-6][0-9]{2}|7[01][0-9]|720))/, lengths: [16] },
  { brand: "Amex", re: /^3[47]/, lengths: [15] },
  { brand: "Discover", re: /^(6011|65|64[4-9])/, lengths: [16, 19] },
  { brand: "JCB", re: /^35(2[89]|[3-8][0-9])/, lengths: [16, 19] },
  { brand: "Diners", re: /^(36|30[0-5]|3095|38|39)/, lengths: [14, 16, 19] },
  { brand: "UnionPay", re: /^62/, lengths: [16, 17, 18, 19] },
];

function luhnValid(digits: string): boolean {
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i]!, 10);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

function detectBrand(digits: string): string | null {
  for (const p of CARD_PATTERNS) {
    if (p.re.test(digits) && p.lengths.includes(digits.length)) return p.brand;
  }
  // Allow brand detect even if length wrong (so we can show "wrong length")
  for (const p of CARD_PATTERNS) {
    if (p.re.test(digits)) return p.brand;
  }
  return null;
}

function format(digits: string, brand: string | null): string {
  if (brand === "Amex") {
    // 4-6-5
    return digits.replace(/^(\d{0,4})(\d{0,6})(\d{0,5}).*/, (_, a, b, c) => [a, b, c].filter(Boolean).join(" "));
  }
  // Default 4-4-4-4 etc.
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
}

export default function CreditCardValidator() {
  const t = useTranslations("tools.credit-card-validator");
  const [input, setInput] = useState("");

  const result = useMemo(() => {
    const digits = input.replace(/\D/g, "");
    if (!digits) return null;
    const brand = detectBrand(digits);
    const lengthOk = brand ? CARD_PATTERNS.find((p) => p.brand === brand)?.lengths.includes(digits.length) ?? false : false;
    const luhn = digits.length >= 12 ? luhnValid(digits) : false;
    return {
      digits,
      brand,
      lengthOk,
      luhn,
      formatted: format(digits, brand),
      valid: brand !== null && lengthOk && luhn,
    };
  }, [input]);

  return (
    <div>
      <div className="mb-4 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
        {t("warning")}
      </div>

      <label className="block">
        <span className="text-sm font-medium">{t("input.cardNumber")}</span>
        <input
          inputMode="numeric"
          autoComplete="off"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="4111 1111 1111 1111"
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-mono text-base tabular-nums dark:border-slate-700 dark:bg-slate-900"
        />
      </label>

      <div aria-live="polite" className="mt-6">
        {result ? (
          <div className={`rounded-lg border p-4 ${result.valid ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-900/20" : "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/20"}`}>
            <div className="flex items-center gap-2">
              <span className={`text-2xl ${result.valid ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                {result.valid ? "✓" : "✗"}
              </span>
              <span className="text-lg font-bold">
                {result.valid ? t("status.valid") : t("status.invalid")}
              </span>
            </div>
            <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800"><dt>{t("breakdown.brand")}</dt><dd className="font-mono">{result.brand ?? t("breakdown.unknown")}</dd></div>
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800"><dt>{t("breakdown.length")}</dt><dd className="font-mono">{result.digits.length}{result.lengthOk ? " ✓" : " ✗"}</dd></div>
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800"><dt>{t("breakdown.luhn")}</dt><dd className="font-mono">{result.luhn ? "✓" : "✗"}</dd></div>
              <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800"><dt>{t("breakdown.formatted")}</dt><dd className="font-mono">{result.formatted}</dd></div>
            </dl>
          </div>
        ) : (
          <div className="rounded-lg border border-slate-200 p-4 text-sm text-slate-600 dark:text-slate-400 dark:border-slate-800">{t("empty")}</div>
        )}
      </div>
    </div>
  );
}
