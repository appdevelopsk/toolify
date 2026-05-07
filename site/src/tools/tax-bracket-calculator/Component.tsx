"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

type Country = "JP" | "US-single" | "US-married";

// Brackets — 2025/2026 approximations. (上限, 税率).
// Real rates may differ slightly by year; users should verify with their tax authority.
const BRACKETS: Record<Country, { upper: number; rate: number }[]> = {
  JP: [
    { upper: 1_950_000, rate: 0.05 },
    { upper: 3_300_000, rate: 0.10 },
    { upper: 6_950_000, rate: 0.20 },
    { upper: 9_000_000, rate: 0.23 },
    { upper: 18_000_000, rate: 0.33 },
    { upper: 40_000_000, rate: 0.40 },
    { upper: Infinity, rate: 0.45 },
  ],
  "US-single": [
    { upper: 11_600, rate: 0.10 },
    { upper: 47_150, rate: 0.12 },
    { upper: 100_525, rate: 0.22 },
    { upper: 191_950, rate: 0.24 },
    { upper: 243_725, rate: 0.32 },
    { upper: 609_350, rate: 0.35 },
    { upper: Infinity, rate: 0.37 },
  ],
  "US-married": [
    { upper: 23_200, rate: 0.10 },
    { upper: 94_300, rate: 0.12 },
    { upper: 201_050, rate: 0.22 },
    { upper: 383_900, rate: 0.24 },
    { upper: 487_450, rate: 0.32 },
    { upper: 731_200, rate: 0.35 },
    { upper: Infinity, rate: 0.37 },
  ],
};

function calc(income: number, country: Country): { tax: number; effective: number; marginal: number; perBracket: { upper: number; rate: number; taxed: number; tax: number }[] } {
  const brackets = BRACKETS[country]!;
  let prevUpper = 0;
  let totalTax = 0;
  let marginal = 0;
  const perBracket: { upper: number; rate: number; taxed: number; tax: number }[] = [];
  for (const b of brackets) {
    if (income > prevUpper) {
      const taxed = Math.min(income, b.upper) - prevUpper;
      const tax = taxed * b.rate;
      totalTax += tax;
      marginal = b.rate;
      perBracket.push({ upper: b.upper, rate: b.rate, taxed, tax });
    } else {
      perBracket.push({ upper: b.upper, rate: b.rate, taxed: 0, tax: 0 });
    }
    prevUpper = b.upper;
  }
  const effective = income > 0 ? totalTax / income : 0;
  return { tax: totalTax, effective, marginal, perBracket };
}

export default function TaxBracketCalculator() {
  const t = useTranslations("tools.tax-bracket-calculator");
  const locale = useLocale();
  const [country, setCountry] = useState<Country>(locale === "ja" ? "JP" : "US-single");
  const [income, setIncome] = useState(country === "JP" ? "5000000" : "75000");

  const result = useMemo(() => {
    const v = parseFloat(income);
    if (!isFinite(v) || v < 0) return null;
    return calc(v, country);
  }, [income, country]);

  const fmt = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }), [locale]);
  const fmtPct = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 2, style: "percent" }), [locale]);

  return (
    <div>
      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">{t("input.country")}</span>
          <select value={country} onChange={(e) => setCountry(e.target.value as Country)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
            <option value="JP">{t("country.JP")}</option>
            <option value="US-single">{t("country.US-single")}</option>
            <option value="US-married">{t("country.US-married")}</option>
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.income")}</span>
          <input type="number" value={income} onChange={(e) => setIncome(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900" />
        </label>
      </div>

      <div aria-live="polite" className="mt-6 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
        {result ? (
          <div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded bg-rose-50 p-3 dark:bg-rose-900/20">
                <div className="text-xs font-medium">{t("result.tax")}</div>
                <div className="tabular-nums text-2xl font-bold">{fmt.format(result.tax)}</div>
              </div>
              <div className="rounded bg-amber-50 p-3 dark:bg-amber-900/20">
                <div className="text-xs font-medium">{t("result.effective")}</div>
                <div className="tabular-nums text-2xl font-bold">{fmtPct.format(result.effective)}</div>
              </div>
              <div className="rounded bg-emerald-50 p-3 dark:bg-emerald-900/20">
                <div className="text-xs font-medium">{t("result.marginal")}</div>
                <div className="tabular-nums text-2xl font-bold">{fmtPct.format(result.marginal)}</div>
              </div>
            </div>
            <h3 className="mt-4 text-sm font-medium">{t("result.byBracket")}</h3>
            <table className="mt-2 w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="py-1 text-left">{t("result.bracket")}</th>
                  <th className="py-1 text-right">{t("result.rate")}</th>
                  <th className="py-1 text-right">{t("result.taxed")}</th>
                  <th className="py-1 text-right">{t("result.taxOwed")}</th>
                </tr>
              </thead>
              <tbody>
                {result.perBracket.map((b, i) => {
                  const lower = i === 0 ? 0 : result.perBracket[i - 1]!.upper;
                  return (
                    <tr key={i} className={`border-b border-slate-100 dark:border-slate-800 ${b.taxed > 0 ? "" : "text-slate-400"}`}>
                      <td className="py-1 tabular-nums">{fmt.format(lower)}–{b.upper === Infinity ? "∞" : fmt.format(b.upper)}</td>
                      <td className="py-1 text-right tabular-nums">{fmtPct.format(b.rate)}</td>
                      <td className="py-1 text-right tabular-nums">{fmt.format(b.taxed)}</td>
                      <td className="py-1 text-right tabular-nums">{fmt.format(b.tax)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="mt-3 text-xs text-slate-500">{t("disclaimer")}</p>
          </div>
        ) : (
          <div className="text-sm text-slate-500">{t("empty")}</div>
        )}
      </div>
    </div>
  );
}
