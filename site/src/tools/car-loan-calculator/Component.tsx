"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

export default function CarLoanCalculator() {
  const t = useTranslations("tools.car-loan-calculator");
  const locale = useLocale();
  const [price, setPrice] = useState("3000000");
  const [downPayment, setDownPayment] = useState("500000");
  const [tradeIn, setTradeIn] = useState("0");
  const [ratePct, setRatePct] = useState("4.5");
  const [months, setMonths] = useState("60");

  const result = useMemo(() => {
    const p = parseFloat(price);
    const d = parseFloat(downPayment);
    const ti = parseFloat(tradeIn);
    const r = parseFloat(ratePct) / 100 / 12;
    const n = parseInt(months, 10);
    if (![p, d, ti].every(isFinite) || !isFinite(parseFloat(ratePct)) || !isFinite(n) || n <= 0) return null;
    const principal = p - d - ti;
    if (principal <= 0) return null;
    const monthly = r === 0 ? principal / n : (principal * r) / (1 - Math.pow(1 + r, -n));
    const total = monthly * n;
    const interest = total - principal;
    return { principal, monthly, total, interest };
  }, [price, downPayment, tradeIn, ratePct, months]);

  const fmt = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }), [locale]);

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">{t("input.price")}</span>
          <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.downPayment")}</span>
          <input type="number" value={downPayment} onChange={(e) => setDownPayment(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.tradeIn")}</span>
          <input type="number" value={tradeIn} onChange={(e) => setTradeIn(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.ratePct")}</span>
          <input type="number" step="0.1" value={ratePct} onChange={(e) => setRatePct(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.months")}</span>
          <select value={months} onChange={(e) => setMonths(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
            <option value="24">24 ({t("monthsUnit")})</option>
            <option value="36">36</option>
            <option value="48">48</option>
            <option value="60">60</option>
            <option value="72">72</option>
            <option value="84">84</option>
          </select>
        </label>
      </div>

      <div aria-live="polite" className="mt-6 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
        {result ? (
          <dl className="grid gap-2 text-sm">
            <div className="flex justify-between rounded bg-emerald-50 px-3 py-2 dark:bg-emerald-900/20">
              <dt className="font-medium">{t("result.monthly")}</dt>
              <dd className="tabular-nums text-lg font-bold">{fmt.format(result.monthly)}</dd>
            </div>
            <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800"><dt>{t("result.principal")}</dt><dd className="tabular-nums">{fmt.format(result.principal)}</dd></div>
            <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800"><dt>{t("result.interest")}</dt><dd className="tabular-nums">{fmt.format(result.interest)}</dd></div>
            <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800"><dt>{t("result.total")}</dt><dd className="tabular-nums">{fmt.format(result.total)}</dd></div>
          </dl>
        ) : (
          <div className="text-sm text-slate-600 dark:text-slate-400">{t("empty")}</div>
        )}
      </div>
    </div>
  );
}
