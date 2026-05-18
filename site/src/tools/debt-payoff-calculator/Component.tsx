"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

type Tab = "fixedPayment" | "fixedTerm";

interface AmortizationRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

interface PayoffResult {
  months: number;
  payoffDate: string;
  totalInterest: number;
  totalPaid: number;
  monthlyPayment: number;
  rows: AmortizationRow[];
  totalsRow: { payment: number; principal: number; interest: number };
}

function buildAmortizationSummary(
  balance: number,
  monthlyRate: number,
  payment: number,
  totalMonths: number,
): { rows: AmortizationRow[]; totalsRow: { payment: number; principal: number; interest: number } } {
  let remaining = balance;
  let totalPayment = 0;
  let totalPrincipal = 0;
  let totalInterest = 0;

  // Collect all rows to determine last month correctly
  const allRows: AmortizationRow[] = [];
  for (let m = 1; m <= totalMonths; m++) {
    const interestCharge = remaining * monthlyRate;
    const principalPaid = Math.min(payment - interestCharge, remaining);
    const actualPayment = principalPaid + interestCharge;
    remaining = Math.max(0, remaining - principalPaid);

    allRows.push({
      month: m,
      payment: actualPayment,
      principal: principalPaid,
      interest: interestCharge,
      balance: remaining,
    });

    totalPayment += actualPayment;
    totalPrincipal += principalPaid;
    totalInterest += interestCharge;

    if (remaining <= 0) break;
  }

  // Build summary: first 3 + last month (if > 3)
  const rows: AmortizationRow[] = [];
  const firstThree = allRows.slice(0, Math.min(3, allRows.length));
  rows.push(...firstThree);
  if (allRows.length > 3) {
    const lastRow = allRows[allRows.length - 1];
    if (lastRow) rows.push(lastRow);
  }

  return {
    rows,
    totalsRow: { payment: totalPayment, principal: totalPrincipal, interest: totalInterest },
  };
}

function calcFixedPayment(balance: number, monthlyRate: number, payment: number): PayoffResult | { error: string } {
  const monthlyInterest = balance * monthlyRate;
  if (payment <= monthlyInterest) {
    return { error: "paymentTooLow" };
  }

  let months: number;
  if (monthlyRate === 0) {
    months = Math.ceil(balance / payment);
  } else {
    months = Math.ceil(-Math.log(1 - (monthlyRate * balance) / payment) / Math.log(1 + monthlyRate));
  }
  if (!isFinite(months) || months <= 0) return { error: "paymentTooLow" };

  const { rows, totalsRow } = buildAmortizationSummary(balance, monthlyRate, payment, months);
  const totalPaid = totalsRow.payment;
  const totalInterest = totalsRow.interest;

  const now = new Date();
  now.setMonth(now.getMonth() + months);
  const payoffDate = now.toLocaleDateString("en-US", { year: "numeric", month: "long" });

  return { months, payoffDate, totalInterest, totalPaid, monthlyPayment: payment, rows, totalsRow };
}

function calcFixedTerm(balance: number, monthlyRate: number, months: number): PayoffResult | { error: string } {
  if (months <= 0 || !isFinite(months)) return { error: "invalidInput" };

  let payment: number;
  if (monthlyRate === 0) {
    payment = balance / months;
  } else {
    const factor = Math.pow(1 + monthlyRate, months);
    payment = (balance * monthlyRate * factor) / (factor - 1);
  }
  if (!isFinite(payment) || payment <= 0) return { error: "invalidInput" };

  const { rows, totalsRow } = buildAmortizationSummary(balance, monthlyRate, payment, months);
  const totalPaid = totalsRow.payment;
  const totalInterest = totalsRow.interest;

  const now = new Date();
  now.setMonth(now.getMonth() + months);
  const payoffDate = now.toLocaleDateString("en-US", { year: "numeric", month: "long" });

  return { months, payoffDate, totalInterest, totalPaid, monthlyPayment: payment, rows, totalsRow };
}

export default function DebtPayoffCalculator() {
  const t = useTranslations("tools.debt-payoff-calculator");
  const locale = useLocale();

  const [tab, setTab] = useState<Tab>("fixedPayment");
  const [balance, setBalance] = useState("5000");
  const [ratePct, setRatePct] = useState("18");
  const [monthlyPayment, setMonthlyPayment] = useState("150");
  const [termMonths, setTermMonths] = useState("36");

  const currency = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: "currency",
        currency: locale === "ja" ? "JPY" : "USD",
        maximumFractionDigits: locale === "ja" ? 0 : 2,
      }),
    [locale],
  );

  const result = useMemo((): PayoffResult | { error: string } | null => {
    const P = parseFloat(balance);
    const r = parseFloat(ratePct) / 100 / 12;
    if (!isFinite(P) || P <= 0 || !isFinite(r) || r < 0) return null;

    if (tab === "fixedPayment") {
      const pmt = parseFloat(monthlyPayment);
      if (!isFinite(pmt) || pmt <= 0) return null;
      return calcFixedPayment(P, r, pmt);
    } else {
      const n = parseInt(termMonths, 10);
      if (!isFinite(n) || n <= 0) return null;
      return calcFixedTerm(P, r, n);
    }
  }, [tab, balance, ratePct, monthlyPayment, termMonths]);

  const minPaymentHint = useMemo(() => {
    const P = parseFloat(balance);
    const r = parseFloat(ratePct) / 100 / 12;
    if (!isFinite(P) || P <= 0 || !isFinite(r) || r < 0) return "";
    return currency.format(P * r);
  }, [balance, ratePct, currency]);

  const isError = result !== null && "error" in result;
  const isSuccess = result !== null && !("error" in result);
  const data = isSuccess ? (result as PayoffResult) : null;

  const tabBase =
    "px-4 py-2 text-sm font-medium rounded-t-lg border border-b-0 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500";
  const tabActive = "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-brand-700 dark:text-brand-400";
  const tabInactive =
    "bg-slate-100 dark:bg-slate-800 border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700";

  return (
    <div>
      {/* Tab strip */}
      <div className="flex gap-1 border-b border-slate-300 dark:border-slate-700">
        {(["fixedPayment", "fixedTerm"] as Tab[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`${tabBase} ${tab === key ? tabActive : tabInactive}`}
            aria-selected={tab === key}
            role="tab"
          >
            {t(`tabs.${key}`)}
          </button>
        ))}
      </div>

      {/* Inputs */}
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {/* Balance — always shown */}
        <label className="block">
          <span className="text-sm font-medium">{t("input.balance")}</span>
          <input
            inputMode="decimal"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          />
        </label>

        {/* APR — always shown */}
        <label className="block">
          <span className="text-sm font-medium">{t("input.ratePct")}</span>
          <input
            inputMode="decimal"
            value={ratePct}
            onChange={(e) => setRatePct(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          />
        </label>

        {/* Third input changes by tab */}
        {tab === "fixedPayment" ? (
          <label className="block">
            <span className="text-sm font-medium">{t("input.monthlyPayment")}</span>
            <input
              inputMode="decimal"
              value={monthlyPayment}
              onChange={(e) => setMonthlyPayment(e.target.value)}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
            />
          </label>
        ) : (
          <label className="block">
            <span className="text-sm font-medium">{t("input.months")}</span>
            <input
              inputMode="numeric"
              value={termMonths}
              onChange={(e) => setTermMonths(e.target.value)}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
            />
          </label>
        )}
      </div>

      {/* Results */}
      <div
        aria-live="polite"
        className={`mt-6 rounded-lg border p-4 ${
          isSuccess
            ? "border-brand-200 bg-brand-50 dark:border-brand-900 dark:bg-brand-900/20"
            : isError
              ? "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/20"
              : "border-slate-200 dark:border-slate-800"
        }`}
      >
        {isError ? (
          <p className="text-sm text-red-700 dark:text-red-400">
            {(result as { error: string }).error === "paymentTooLow"
              ? t("error.paymentTooLow", { minPayment: minPaymentHint })
              : t("error.invalidInput")}
          </p>
        ) : data ? (
          <>
            {/* Summary grid */}
            <dl className={`grid gap-3 ${tab === "fixedPayment" ? "sm:grid-cols-4" : "sm:grid-cols-4"}`}>
              {tab === "fixedPayment" ? (
                <div>
                  <dt className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    {t("result.monthsToPayoff")}
                  </dt>
                  <dd className="mt-1 text-3xl font-bold tabular-nums">{data.months}</dd>
                </div>
              ) : (
                <div>
                  <dt className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    {t("result.monthlyPayment")}
                  </dt>
                  <dd className="mt-1 text-3xl font-bold tabular-nums">{currency.format(data.monthlyPayment)}</dd>
                </div>
              )}
              <div>
                <dt className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  {t("result.payoffDate")}
                </dt>
                <dd className="mt-1 text-xl font-bold">{data.payoffDate}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  {t("result.totalInterest")}
                </dt>
                <dd className="mt-1 text-2xl font-bold tabular-nums text-amber-700 dark:text-amber-400">
                  {currency.format(data.totalInterest)}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  {t("result.totalPaid")}
                </dt>
                <dd className="mt-1 text-2xl font-bold tabular-nums">{currency.format(data.totalPaid)}</dd>
              </div>
            </dl>

            {/* Amortization summary table */}
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-sm">
                <caption className="mb-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {t("table.caption")}
                </caption>
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    {["month", "payment", "principal", "interest", "balance"].map((col) => (
                      <th
                        key={col}
                        scope="col"
                        className="pb-2 pr-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 first:text-left dark:text-slate-400"
                      >
                        {t(`table.${col}`)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((row, idx) => {
                    // Insert ellipsis row between month 3 and last month when there are 4 display rows
                    const isLastRow = idx === data.rows.length - 1 && data.rows.length === 4;
                    return (
                      <>
                        {isLastRow && (
                          <tr key="ellipsis" aria-hidden="true">
                            {[0, 1, 2, 3, 4].map((c) => (
                              <td key={c} className="py-1 pr-4 text-right text-slate-400 first:text-left">
                                {c === 0 ? t("table.ellipsis") : ""}
                              </td>
                            ))}
                          </tr>
                        )}
                        <tr
                          key={row.month}
                          className="border-b border-slate-100 last:border-0 dark:border-slate-800"
                        >
                          <td className="py-1.5 pr-4 tabular-nums">{row.month}</td>
                          <td className="py-1.5 pr-4 text-right tabular-nums">{currency.format(row.payment)}</td>
                          <td className="py-1.5 pr-4 text-right tabular-nums">{currency.format(row.principal)}</td>
                          <td className="py-1.5 pr-4 text-right tabular-nums text-amber-700 dark:text-amber-400">
                            {currency.format(row.interest)}
                          </td>
                          <td className="py-1.5 text-right tabular-nums">{currency.format(row.balance)}</td>
                        </tr>
                      </>
                    );
                  })}
                  {/* Totals row */}
                  <tr className="border-t-2 border-slate-300 font-semibold dark:border-slate-600">
                    <td className="pt-2 pr-4 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {t("table.totals")}
                    </td>
                    <td className="pt-2 pr-4 text-right tabular-nums">{currency.format(data.totalsRow.payment)}</td>
                    <td className="pt-2 pr-4 text-right tabular-nums">{currency.format(data.totalsRow.principal)}</td>
                    <td className="pt-2 pr-4 text-right tabular-nums text-amber-700 dark:text-amber-400">
                      {currency.format(data.totalsRow.interest)}
                    </td>
                    <td className="pt-2 text-right tabular-nums">{currency.format(0)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="text-sm text-slate-600 dark:text-slate-400">{t("empty")}</div>
        )}
      </div>
    </div>
  );
}
