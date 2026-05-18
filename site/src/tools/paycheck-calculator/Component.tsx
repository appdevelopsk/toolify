"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

type FilingStatus = "single" | "mfj" | "hoh";
type PayFrequency = "weekly" | "biweekly" | "semimonthly" | "monthly";

const PAY_PERIODS: Record<PayFrequency, number> = {
  weekly: 52,
  biweekly: 26,
  semimonthly: 24,
  monthly: 12,
};

// 2024 US Federal Tax Brackets
const BRACKETS: Record<FilingStatus, Array<{ max: number; rate: number }>> = {
  single: [
    { max: 11600, rate: 0.10 },
    { max: 47150, rate: 0.12 },
    { max: 100525, rate: 0.22 },
    { max: 191950, rate: 0.24 },
    { max: 243725, rate: 0.32 },
    { max: 609350, rate: 0.35 },
    { max: Infinity, rate: 0.37 },
  ],
  mfj: [
    { max: 23200, rate: 0.10 },
    { max: 94300, rate: 0.12 },
    { max: 201050, rate: 0.22 },
    { max: 383900, rate: 0.24 },
    { max: 487450, rate: 0.32 },
    { max: 731200, rate: 0.35 },
    { max: Infinity, rate: 0.37 },
  ],
  hoh: [
    { max: 16550, rate: 0.10 },
    { max: 63100, rate: 0.12 },
    { max: 100500, rate: 0.22 },
    { max: 191950, rate: 0.24 },
    { max: 243700, rate: 0.32 },
    { max: 609350, rate: 0.35 },
    { max: Infinity, rate: 0.37 },
  ],
};

const STANDARD_DEDUCTIONS: Record<FilingStatus, number> = {
  single: 14600,
  mfj: 29200,
  hoh: 21900,
};

const SS_WAGE_BASE = 168600;
const SS_RATE = 0.062;
const MEDICARE_RATE = 0.0145;
const ADDL_MEDICARE_RATE = 0.009;
const ADDL_MEDICARE_THRESHOLD: Record<FilingStatus, number> = {
  single: 200000,
  mfj: 250000,
  hoh: 200000,
};
const STATE_TAX_RATE = 0.05;

function calcFederalTax(taxableIncome: number, status: FilingStatus): number {
  if (taxableIncome <= 0) return 0;
  const brackets = BRACKETS[status];
  let tax = 0;
  let prev = 0;
  for (const bracket of brackets) {
    const chunk = Math.min(taxableIncome, bracket.max) - prev;
    if (chunk <= 0) break;
    tax += chunk * bracket.rate;
    prev = bracket.max;
    if (taxableIncome <= bracket.max) break;
  }
  return tax;
}

export default function PaycheckCalculator() {
  const t = useTranslations("tools.paycheck-calculator");
  const locale = useLocale();

  const [salary, setSalary] = useState("75000");
  const [filingStatus, setFilingStatus] = useState<FilingStatus>("single");
  const [payFrequency, setPayFrequency] = useState<PayFrequency>("biweekly");
  const [additionalWithholding, setAdditionalWithholding] = useState("");

  const result = useMemo(() => {
    const grossAnnual = parseFloat(salary);
    if (!isFinite(grossAnnual) || grossAnnual <= 0) return null;

    const periods = PAY_PERIODS[payFrequency];
    const grossPerPaycheck = grossAnnual / periods;

    // Federal income tax
    const standardDeduction = STANDARD_DEDUCTIONS[filingStatus];
    const taxableIncome = Math.max(0, grossAnnual - standardDeduction);
    const annualFederalTax = calcFederalTax(taxableIncome, filingStatus);
    const federalTaxPerPaycheck = annualFederalTax / periods;

    // State tax estimate
    const annualStateTax = grossAnnual * STATE_TAX_RATE;
    const stateTaxPerPaycheck = annualStateTax / periods;

    // Social Security
    const ssTaxableWages = Math.min(grossAnnual, SS_WAGE_BASE);
    const annualSS = ssTaxableWages * SS_RATE;
    const ssPerPaycheck = annualSS / periods;

    // Medicare
    const threshold = ADDL_MEDICARE_THRESHOLD[filingStatus];
    const baseAnnualMedicare = grossAnnual * MEDICARE_RATE;
    const addlAnnualMedicare = Math.max(0, grossAnnual - threshold) * ADDL_MEDICARE_RATE;
    const annualMedicare = baseAnnualMedicare + addlAnnualMedicare;
    const medicarePerPaycheck = annualMedicare / periods;

    const addlWithholding = parseFloat(additionalWithholding) || 0;

    const netPerPaycheck =
      grossPerPaycheck -
      federalTaxPerPaycheck -
      stateTaxPerPaycheck -
      ssPerPaycheck -
      medicarePerPaycheck -
      addlWithholding;

    const annualNet = netPerPaycheck * periods;

    return {
      grossPerPaycheck,
      federalTaxPerPaycheck,
      stateTaxPerPaycheck,
      ssPerPaycheck,
      medicarePerPaycheck,
      netPerPaycheck,
      annualFederalTax,
      annualStateTax,
      annualSS,
      annualMedicare,
      annualNet,
    };
  }, [salary, filingStatus, payFrequency, additionalWithholding]);

  const fmt = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2,
      }),
    [locale]
  );

  const inputClass =
    "mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900";
  const selectClass =
    "mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900";

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">{t("input.salary")}</span>
          <input
            inputMode="decimal"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            className={inputClass}
            placeholder="75000"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.filingStatus")}</span>
          <select
            value={filingStatus}
            onChange={(e) => setFilingStatus(e.target.value as FilingStatus)}
            className={selectClass}
          >
            <option value="single">{t("statuses.single")}</option>
            <option value="mfj">{t("statuses.mfj")}</option>
            <option value="hoh">{t("statuses.hoh")}</option>
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.payFrequency")}</span>
          <select
            value={payFrequency}
            onChange={(e) => setPayFrequency(e.target.value as PayFrequency)}
            className={selectClass}
          >
            <option value="weekly">{t("frequencies.weekly")}</option>
            <option value="biweekly">{t("frequencies.biweekly")}</option>
            <option value="semimonthly">{t("frequencies.semimonthly")}</option>
            <option value="monthly">{t("frequencies.monthly")}</option>
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.additionalWithholding")}</span>
          <input
            inputMode="decimal"
            value={additionalWithholding}
            onChange={(e) => setAdditionalWithholding(e.target.value)}
            className={inputClass}
            placeholder="0"
          />
        </label>
      </div>

      <div
        aria-live="polite"
        className={`mt-6 rounded-lg border p-4 ${
          result
            ? "border-brand-200 bg-brand-50 dark:border-brand-900 dark:bg-brand-900/20"
            : "border-slate-200 dark:border-slate-800"
        }`}
      >
        {result ? (
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Per Paycheck
            </h3>
            <dl className="grid gap-3 sm:grid-cols-3">
              <div>
                <dt className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  {t("result.gross")}
                </dt>
                <dd className="mt-1 text-xl font-bold tabular-nums">
                  {fmt.format(result.grossPerPaycheck)}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  {t("result.federalTax")}
                </dt>
                <dd className="mt-1 text-xl font-bold tabular-nums text-red-600 dark:text-red-400">
                  −{fmt.format(result.federalTaxPerPaycheck)}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  {t("result.stateTax")}
                </dt>
                <dd className="mt-1 text-xl font-bold tabular-nums text-red-600 dark:text-red-400">
                  −{fmt.format(result.stateTaxPerPaycheck)}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  {t("result.socialSecurity")}
                </dt>
                <dd className="mt-1 text-xl font-bold tabular-nums text-red-600 dark:text-red-400">
                  −{fmt.format(result.ssPerPaycheck)}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  {t("result.medicare")}
                </dt>
                <dd className="mt-1 text-xl font-bold tabular-nums text-red-600 dark:text-red-400">
                  −{fmt.format(result.medicarePerPaycheck)}
                </dd>
              </div>
              <div className="sm:col-span-3 border-t border-brand-200 pt-3 dark:border-brand-800">
                <dt className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  {t("result.net")}
                </dt>
                <dd className="mt-1 text-3xl font-bold tabular-nums text-green-700 dark:text-green-400">
                  {fmt.format(result.netPerPaycheck)}
                </dd>
              </div>
            </dl>
            <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-700">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Annual totals
              </p>
              <dl className="grid gap-2 text-sm sm:grid-cols-3">
                <div>
                  <dt className="text-xs text-slate-500">{t("result.federalTax")}</dt>
                  <dd className="font-medium">{fmt.format(result.annualFederalTax)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">{t("result.stateTax")}</dt>
                  <dd className="font-medium">{fmt.format(result.annualStateTax)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">{t("result.annualNet")}</dt>
                  <dd className="font-bold text-green-700 dark:text-green-400">
                    {fmt.format(result.annualNet)}
                  </dd>
                </div>
              </dl>
            </div>
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
              {t("note.stateDisclaimer")}
            </p>
          </div>
        ) : (
          <p className="text-sm text-slate-600 dark:text-slate-400">{t("empty")}</p>
        )}
      </div>
    </div>
  );
}
