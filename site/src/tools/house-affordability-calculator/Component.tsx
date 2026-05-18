"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

export default function HouseAffordabilityCalculator() {
  const t = useTranslations("tools.house-affordability-calculator");
  const locale = useLocale();

  const [annualIncome, setAnnualIncome] = useState("100000");
  const [monthlyDebt, setMonthlyDebt] = useState("500");
  const [downPayment, setDownPayment] = useState("60000");
  const [loanTerm, setLoanTerm] = useState<"15" | "30">("30");
  const [ratePct, setRatePct] = useState("7.0");
  const [taxRatePct, setTaxRatePct] = useState("1.2");
  const [insuranceAnnual, setInsuranceAnnual] = useState("1200");
  const [hoaMonthly, setHoaMonthly] = useState("0");

  const result = useMemo(() => {
    const income = parseFloat(annualIncome);
    const debt = parseFloat(monthlyDebt);
    const dp = parseFloat(downPayment);
    const r = parseFloat(ratePct) / 100 / 12;
    const n = parseFloat(loanTerm) * 12;
    const taxRate = parseFloat(taxRatePct) / 100;
    const ins = parseFloat(insuranceAnnual);
    const hoa = parseFloat(hoaMonthly);

    if (![income, debt, dp, r, n, taxRate, ins, hoa].every(isFinite)) return null;
    if (income <= 0) return { error: "incomeRequired" as const };
    if (r <= 0) return { error: "rateRequired" as const };
    if (debt < 0 || dp < 0 || taxRate < 0 || ins < 0 || hoa < 0) return { error: "invalidInput" as const };

    const grossMonthly = income / 12;

    // 28% front-end: max total housing payment (P&I + tax + ins + HOA)
    const frontEndMaxTotal = grossMonthly * 0.28;
    // 36% back-end: max total debt including housing
    const backEndMaxTotal = grossMonthly * 0.36 - debt;

    // Effective max total housing payment (before knowing home price for tax)
    // We iterate to solve for home price because tax depends on home price.
    // Approach: solve for max P&I first, then back out home price.
    // Fixed monthly non-P&I costs that don't depend on home price: ins/12 + hoa
    const fixedMonthly = ins / 12 + hoa;

    // Max P&I given each rule (ignoring property tax for the initial estimate)
    const frontEndMaxPI_noTax = frontEndMaxTotal - fixedMonthly;
    const backEndMaxPI_noTax = backEndMaxTotal - fixedMonthly;

    // Pick the binding constraint
    const effectiveMaxPI_noTax = Math.min(frontEndMaxPI_noTax, backEndMaxPI_noTax);

    if (effectiveMaxPI_noTax <= 0) {
      return { error: "invalidInput" as const };
    }

    // Back-calculate max loan from max P&I payment
    // Loan = P&I * ((1+r)^n - 1) / (r * (1+r)^n)
    const factor = (Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n));

    // Iterative solve: tax depends on home price, home price depends on tax
    // Start with no-tax estimate and iterate
    let maxLoan = effectiveMaxPI_noTax * factor;
    let maxHomePrice = maxLoan + dp;

    for (let i = 0; i < 20; i++) {
      const monthlyTax = (maxHomePrice * taxRate) / 12;
      const frontEndMaxPI = frontEndMaxTotal - fixedMonthly - monthlyTax;
      const backEndMaxPI = backEndMaxTotal - fixedMonthly - monthlyTax;
      const effectiveMaxPI = Math.min(frontEndMaxPI, backEndMaxPI);
      if (effectiveMaxPI <= 0) {
        return { error: "invalidInput" as const };
      }
      const newLoan = effectiveMaxPI * factor;
      const newHomePrice = newLoan + dp;
      if (Math.abs(newHomePrice - maxHomePrice) < 1) break;
      maxHomePrice = newHomePrice;
      maxLoan = newLoan;
    }

    const monthlyTax = (maxHomePrice * taxRate) / 12;
    const frontEndMaxPIFinal = frontEndMaxTotal - fixedMonthly - monthlyTax;
    const backEndMaxPIFinal = backEndMaxTotal - fixedMonthly - monthlyTax;
    const bindingMaxPI = Math.min(frontEndMaxPIFinal, backEndMaxPIFinal);

    if (bindingMaxPI <= 0) {
      return { error: "invalidInput" as const };
    }

    maxLoan = bindingMaxPI * factor;
    maxHomePrice = maxLoan + dp;

    const monthlyPI = bindingMaxPI;
    const totalMonthly = monthlyPI + monthlyTax + ins / 12 + hoa;
    const limitingRule = frontEndMaxPIFinal <= backEndMaxPIFinal ? "frontEnd" : "backEnd";

    // Front-end home price (28% limit)
    const frontEndLoan = Math.max(0, frontEndMaxPIFinal) * factor;
    const frontEndHomePrice = frontEndLoan + dp;

    // Back-end home price (36% limit)
    const backEndLoan = Math.max(0, backEndMaxPIFinal) * factor;
    const backEndHomePrice = backEndLoan + dp;

    const needsPMI = dp < maxHomePrice * 0.2;

    return {
      maxHomePrice,
      maxLoanAmount: maxLoan,
      monthlyPI,
      totalMonthly,
      monthlyTax,
      monthlyIns: ins / 12,
      monthlyHoa: hoa,
      frontEndHomePrice,
      backEndHomePrice,
      limitingRule,
      needsPMI,
      error: null,
    };
  }, [annualIncome, monthlyDebt, downPayment, loanTerm, ratePct, taxRatePct, insuranceAnnual, hoaMonthly]);

  const currency = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: "currency",
        currency: locale === "ja" ? "JPY" : "USD",
        maximumFractionDigits: 0,
      }),
    [locale],
  );

  const cents = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: "currency",
        currency: locale === "ja" ? "JPY" : "USD",
        maximumFractionDigits: locale === "ja" ? 0 : 2,
      }),
    [locale],
  );

  const hasError = result && result.error;
  const hasResult = result && !result.error;

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="text-sm font-medium">{t("input.annualIncome")}</span>
          <input
            inputMode="decimal"
            value={annualIncome}
            onChange={(e) => setAnnualIncome(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          />
        </label>

        <label className="block sm:col-span-2">
          <span className="text-sm font-medium">{t("input.monthlyDebt")}</span>
          <span className="mt-0.5 block text-xs text-slate-500">{t("input.monthlyDebtHint")}</span>
          <input
            inputMode="decimal"
            value={monthlyDebt}
            onChange={(e) => setMonthlyDebt(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">{t("input.downPayment")}</span>
          <input
            inputMode="decimal"
            value={downPayment}
            onChange={(e) => setDownPayment(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">{t("input.ratePct")}</span>
          <input
            inputMode="decimal"
            value={ratePct}
            onChange={(e) => setRatePct(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          />
        </label>

        <div className="block sm:col-span-2">
          <span className="text-sm font-medium">{t("input.loanTerm")}</span>
          <div className="mt-2 flex gap-4">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="loanTerm"
                value="30"
                checked={loanTerm === "30"}
                onChange={() => setLoanTerm("30")}
                className="accent-brand-600"
              />
              <span className="text-sm">{t("input.loanTerm30")}</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="loanTerm"
                value="15"
                checked={loanTerm === "15"}
                onChange={() => setLoanTerm("15")}
                className="accent-brand-600"
              />
              <span className="text-sm">{t("input.loanTerm15")}</span>
            </label>
          </div>
        </div>

        <label className="block">
          <span className="text-sm font-medium">{t("input.taxRatePct")}</span>
          <input
            inputMode="decimal"
            value={taxRatePct}
            onChange={(e) => setTaxRatePct(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">{t("input.insuranceAnnual")}</span>
          <input
            inputMode="decimal"
            value={insuranceAnnual}
            onChange={(e) => setInsuranceAnnual(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">{t("input.hoaMonthly")}</span>
          <input
            inputMode="decimal"
            value={hoaMonthly}
            onChange={(e) => setHoaMonthly(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          />
        </label>
      </div>

      <div
        aria-live="polite"
        className={`mt-6 rounded-lg border p-4 ${
          hasResult
            ? "border-brand-200 bg-brand-50 dark:border-brand-900 dark:bg-brand-900/20"
            : "border-slate-200 dark:border-slate-800"
        }`}
      >
        {hasError ? (
          <div className="text-sm text-red-600 dark:text-red-400">{t(`error.${result.error}`)}</div>
        ) : hasResult ? (
          <>
            <div className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">
              {t("result.maxHomePrice")}
            </div>
            <div className="mt-1 text-4xl font-bold tabular-nums">{currency.format(result.maxHomePrice)}</div>

            {result.needsPMI && (
              <div className="mt-3 rounded border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
                {t("result.pmiWarning")}
              </div>
            )}

            <div className="mt-4">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                {t("result.breakdown")}
              </div>
              <dl className="grid gap-2 text-sm sm:grid-cols-2">
                <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800">
                  <dt>{t("result.maxLoanAmount")}</dt>
                  <dd className="tabular-nums">{currency.format(result.maxLoanAmount)}</dd>
                </div>
                <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800">
                  <dt>{t("result.monthlyPI")}</dt>
                  <dd className="tabular-nums">{cents.format(result.monthlyPI)}</dd>
                </div>
                <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800">
                  <dt>{t("result.propertyTax")}</dt>
                  <dd className="tabular-nums">{cents.format(result.monthlyTax)}</dd>
                </div>
                <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800">
                  <dt>{t("result.insurance")}</dt>
                  <dd className="tabular-nums">{cents.format(result.monthlyIns)}</dd>
                </div>
                {result.monthlyHoa > 0 && (
                  <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800">
                    <dt>{t("result.hoa")}</dt>
                    <dd className="tabular-nums">{cents.format(result.monthlyHoa)}</dd>
                  </div>
                )}
                <div className="flex justify-between border-b border-slate-200 py-1 font-semibold dark:border-slate-800">
                  <dt>{t("result.totalMonthly")}</dt>
                  <dd className="tabular-nums">{cents.format(result.totalMonthly)}</dd>
                </div>
              </dl>
            </div>

            <div className="mt-4">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                {t("result.limitingFactor")}:{" "}
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  {t(`result.${result.limitingRule}`)}
                </span>
              </div>
              <dl className="grid gap-2 text-sm sm:grid-cols-2">
                <div
                  className={`flex justify-between rounded px-2 py-1 ${
                    result.limitingRule === "frontEnd"
                      ? "bg-brand-100 font-semibold dark:bg-brand-900/30"
                      : "border border-slate-200 dark:border-slate-800"
                  }`}
                >
                  <dt>{t("result.frontEndLimit")}</dt>
                  <dd className="tabular-nums">{currency.format(result.frontEndHomePrice)}</dd>
                </div>
                <div
                  className={`flex justify-between rounded px-2 py-1 ${
                    result.limitingRule === "backEnd"
                      ? "bg-brand-100 font-semibold dark:bg-brand-900/30"
                      : "border border-slate-200 dark:border-slate-800"
                  }`}
                >
                  <dt>{t("result.backEndLimit")}</dt>
                  <dd className="tabular-nums">{currency.format(result.backEndHomePrice)}</dd>
                </div>
              </dl>
            </div>
          </>
        ) : (
          <div className="text-sm text-slate-600 dark:text-slate-400">{t("empty")}</div>
        )}
      </div>
    </div>
  );
}
