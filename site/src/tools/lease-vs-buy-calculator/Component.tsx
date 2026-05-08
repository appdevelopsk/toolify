"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

function loanPayment(principal: number, monthlyRate: number, months: number): number {
  if (monthlyRate === 0) return principal / months;
  return (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
}

function loanBalanceAfter(principal: number, monthlyRate: number, totalMonths: number, monthsPaid: number): number {
  if (monthsPaid >= totalMonths) return 0;
  if (monthlyRate === 0) return principal * (1 - monthsPaid / totalMonths);
  const payment = loanPayment(principal, monthlyRate, totalMonths);
  // remaining balance after `monthsPaid` payments (closed-form)
  return principal * Math.pow(1 + monthlyRate, monthsPaid) - payment * (Math.pow(1 + monthlyRate, monthsPaid) - 1) / monthlyRate;
}

export default function LeaseVsBuyCalculator() {
  const t = useTranslations("tools.lease-vs-buy-calculator");
  const locale = useLocale();

  const [carPrice, setCarPrice] = useState("35000");
  const [downPayment, setDownPayment] = useState("5000");
  const [holdYears, setHoldYears] = useState("3");

  // Lease
  const [leaseMonthly, setLeaseMonthly] = useState("450");
  const [leaseTermMonths, setLeaseTermMonths] = useState("36");

  // Buy
  const [buyAprPct, setBuyAprPct] = useState("7.0");
  const [buyTermYears, setBuyTermYears] = useState("5");
  const [resaleValuePct, setResaleValuePct] = useState("55");

  const result = useMemo(() => {
    const price = parseFloat(carPrice);
    const down = parseFloat(downPayment);
    const hYears = parseFloat(holdYears);
    const lMon = parseFloat(leaseMonthly);
    const lTerm = Math.round(parseFloat(leaseTermMonths));
    const apr = parseFloat(buyAprPct);
    const bTerm = Math.round(parseFloat(buyTermYears) * 12);
    const resalePct = parseFloat(resaleValuePct);

    if (![price, down, hYears, lMon, lTerm, apr, bTerm, resalePct].every((v) => Number.isFinite(v) && v >= 0)) return null;
    if (price <= 0 || hYears <= 0 || lTerm <= 0 || bTerm <= 0) return null;
    if (down >= price) return null;

    const holdMonths = Math.round(hYears * 12);

    // ─── LEASE ─────
    // Cost over hold period: lease payments while leased + (re-lease costs if hold > term).
    // Simple model: if hold ≤ term, you only pay for hold months. If hold > term, you re-lease at the same monthly rate.
    const leaseTotal = lMon * holdMonths;

    // ─── BUY ─────
    const principal = price - down;
    const monthlyRate = apr / 100 / 12;
    const buyMonthly = loanPayment(principal, monthlyRate, bTerm);

    // Cash out over hold period: down payment + monthly payments (capped at loan term)
    const monthsPaid = Math.min(holdMonths, bTerm);
    const cashOut = down + buyMonthly * monthsPaid;

    // Residual balance still owed (if hold < loan term)
    const remainingLoanBalance = loanBalanceAfter(principal, monthlyRate, bTerm, monthsPaid);

    // Resale value at end of hold period
    const resaleValue = price * (resalePct / 100);

    // Net cost of buying = cash out + remaining loan balance - resale value
    // (i.e., what you actually paid net of what you can recover by selling)
    const buyTotal = cashOut + remainingLoanBalance - resaleValue;

    const delta = leaseTotal - buyTotal;
    const winner = delta > 0 ? "buy" : delta < 0 ? "lease" : "tie";

    return {
      leaseTotal,
      leaseMonthly: lMon,
      buyMonthly,
      cashOut,
      remainingLoanBalance,
      resaleValue,
      buyTotal,
      delta: Math.abs(delta),
      winner,
      holdMonths,
    };
  }, [carPrice, downPayment, holdYears, leaseMonthly, leaseTermMonths, buyAprPct, buyTermYears, resaleValuePct]);

  const currency = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: locale === "ja" ? "JPY" : locale === "ko" ? "KRW" : locale === "zh-CN" || locale === "zh-TW" ? "CNY" : "USD",
    maximumFractionDigits: 0,
  });

  return (
    <div className="space-y-4">
      <fieldset className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
        <legend className="px-2 text-sm font-semibold">{t("commonHeading")}</legend>
        <div className="grid gap-3 md:grid-cols-3">
          <label className="block">
            <span className="text-sm font-medium">{t("input.carPrice")}</span>
            <input type="number" inputMode="decimal" value={carPrice} onChange={(e) => setCarPrice(e.target.value)} className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
          </label>
          <label className="block">
            <span className="text-sm font-medium">{t("input.downPayment")}</span>
            <input type="number" inputMode="decimal" value={downPayment} onChange={(e) => setDownPayment(e.target.value)} className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
          </label>
          <label className="block">
            <span className="text-sm font-medium">{t("input.holdYears")}</span>
            <input type="number" inputMode="decimal" step="0.5" value={holdYears} onChange={(e) => setHoldYears(e.target.value)} className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
          </label>
        </div>
      </fieldset>

      <div className="grid gap-4 md:grid-cols-2">
        <fieldset className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
          <legend className="px-2 text-sm font-semibold">{t("leaseHeading")}</legend>
          <div className="space-y-3">
            <label className="block">
              <span className="text-sm font-medium">{t("input.leaseMonthly")}</span>
              <input type="number" inputMode="decimal" value={leaseMonthly} onChange={(e) => setLeaseMonthly(e.target.value)} className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
            </label>
            <label className="block">
              <span className="text-sm font-medium">{t("input.leaseTermMonths")}</span>
              <input type="number" inputMode="numeric" value={leaseTermMonths} onChange={(e) => setLeaseTermMonths(e.target.value)} className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
            </label>
          </div>
        </fieldset>

        <fieldset className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
          <legend className="px-2 text-sm font-semibold">{t("buyHeading")}</legend>
          <div className="space-y-3">
            <label className="block">
              <span className="text-sm font-medium">{t("input.buyAprPct")}</span>
              <input type="number" inputMode="decimal" step="0.01" value={buyAprPct} onChange={(e) => setBuyAprPct(e.target.value)} className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
            </label>
            <label className="block">
              <span className="text-sm font-medium">{t("input.buyTermYears")}</span>
              <input type="number" inputMode="decimal" step="0.5" value={buyTermYears} onChange={(e) => setBuyTermYears(e.target.value)} className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
            </label>
            <label className="block">
              <span className="text-sm font-medium">{t("input.resaleValuePct")}</span>
              <input type="number" inputMode="decimal" value={resaleValuePct} onChange={(e) => setResaleValuePct(e.target.value)} className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
            </label>
          </div>
        </fieldset>
      </div>

      {result === null ? (
        <p className="rounded bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-900/20 dark:text-amber-200">{t("empty")}</p>
      ) : (
        <div className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <div className={`rounded border-2 p-4 ${result.winner === "lease" ? "border-emerald-400 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-900/30" : "border-slate-200 dark:border-slate-800"}`}>
              <div className="flex items-baseline justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wider">{t("result.leaseHeading")}</h3>
                {result.winner === "lease" && <span className="rounded bg-emerald-600 px-2 py-0.5 text-xs font-medium text-white">{t("result.cheaperBadge")}</span>}
              </div>
              <div className="mt-2 font-mono text-2xl">{currency.format(result.leaseTotal)}</div>
              <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t("result.leaseExplain", { months: result.holdMonths, monthly: currency.format(result.leaseMonthly) })}</div>
            </div>

            <div className={`rounded border-2 p-4 ${result.winner === "buy" ? "border-emerald-400 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-900/30" : "border-slate-200 dark:border-slate-800"}`}>
              <div className="flex items-baseline justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wider">{t("result.buyHeading")}</h3>
                {result.winner === "buy" && <span className="rounded bg-emerald-600 px-2 py-0.5 text-xs font-medium text-white">{t("result.cheaperBadge")}</span>}
              </div>
              <div className="mt-2 font-mono text-2xl">{currency.format(result.buyTotal)}</div>
              <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t("result.buyExplain", { monthly: currency.format(result.buyMonthly) })}</div>
            </div>
          </div>

          <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800/50">
            <h3 className="text-sm font-semibold">{t("result.detailHeading")}</h3>
            <dl className="mt-2 grid gap-2 text-sm md:grid-cols-2">
              <div className="flex justify-between gap-3">
                <dt className="text-slate-600 dark:text-slate-400">{t("result.cashOut")}</dt>
                <dd className="font-mono">{currency.format(result.cashOut)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-600 dark:text-slate-400">{t("result.remainingLoanBalance")}</dt>
                <dd className="font-mono">{currency.format(result.remainingLoanBalance)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-600 dark:text-slate-400">{t("result.resaleValue")}</dt>
                <dd className="font-mono">−{currency.format(result.resaleValue)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="font-medium">{t("result.deltaLabel")}</dt>
                <dd className={`font-mono font-semibold ${result.winner === "lease" ? "text-emerald-700 dark:text-emerald-300" : result.winner === "buy" ? "text-emerald-700 dark:text-emerald-300" : ""}`}>
                  {result.winner === "tie" ? "—" : t(`result.${result.winner}Wins`, { delta: currency.format(result.delta) })}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      )}
    </div>
  );
}
