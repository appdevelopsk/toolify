"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

export default function StockProfitCalculator() {
  const t = useTranslations("tools.stock-profit-calculator");
  const locale = useLocale();
  const [shares, setShares] = useState("100");
  const [buyPrice, setBuyPrice] = useState("150");
  const [sellPrice, setSellPrice] = useState("180");
  const [buyCommission, setBuyCommission] = useState("0");
  const [sellCommission, setSellCommission] = useState("0");
  const [dividends, setDividends] = useState("250");
  const [taxPct, setTaxPct] = useState("20.315");

  const result = useMemo(() => {
    const sh = parseFloat(shares);
    const bp = parseFloat(buyPrice);
    const sp = parseFloat(sellPrice);
    const bc = parseFloat(buyCommission);
    const sc = parseFloat(sellCommission);
    const div = parseFloat(dividends);
    const tax = parseFloat(taxPct) / 100;
    if (![sh, bp, sp, bc, sc, div, tax].every(isFinite) || sh <= 0) return null;
    const cost = sh * bp + bc;
    const gross = sh * sp - sc;
    const capitalGain = gross - cost;
    const totalGain = capitalGain + div;
    const taxOnGain = capitalGain > 0 ? capitalGain * tax : 0;
    const taxOnDiv = div > 0 ? div * tax : 0;
    const totalTax = taxOnGain + taxOnDiv;
    const afterTax = totalGain - totalTax;
    const roi = (afterTax / cost) * 100;
    return { cost, gross, capitalGain, dividends: div, totalGain, totalTax, afterTax, roi };
  }, [shares, buyPrice, sellPrice, buyCommission, sellCommission, dividends, taxPct]);

  const fmt = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }), [locale]);

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">{t("input.shares")}</span>
          <input type="number" value={shares} onChange={(e) => setShares(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.dividends")}</span>
          <input type="number" value={dividends} onChange={(e) => setDividends(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.buyPrice")}</span>
          <input type="number" value={buyPrice} onChange={(e) => setBuyPrice(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.sellPrice")}</span>
          <input type="number" value={sellPrice} onChange={(e) => setSellPrice(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.buyCommission")}</span>
          <input type="number" value={buyCommission} onChange={(e) => setBuyCommission(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.sellCommission")}</span>
          <input type="number" value={sellCommission} onChange={(e) => setSellCommission(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-sm font-medium">{t("input.taxPct")}</span>
          <input type="number" step="0.001" value={taxPct} onChange={(e) => setTaxPct(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900" />
        </label>
      </div>

      <div aria-live="polite" className="mt-6 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
        {result ? (
          <dl className="grid gap-2 text-sm">
            <div className={`flex justify-between rounded px-3 py-2 ${result.afterTax >= 0 ? "bg-emerald-50 dark:bg-emerald-900/20" : "bg-rose-50 dark:bg-rose-900/20"}`}>
              <dt className="font-medium">{t("result.afterTax")}</dt>
              <dd className="tabular-nums text-2xl font-bold">{fmt.format(result.afterTax)}</dd>
            </div>
            <div className={`flex justify-between rounded px-3 py-2 ${result.roi >= 0 ? "bg-emerald-50 dark:bg-emerald-900/20" : "bg-rose-50 dark:bg-rose-900/20"}`}>
              <dt className="font-medium">{t("result.roi")}</dt>
              <dd className="tabular-nums text-lg font-bold">{fmt.format(result.roi)}%</dd>
            </div>
            <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800"><dt>{t("result.cost")}</dt><dd className="tabular-nums">{fmt.format(result.cost)}</dd></div>
            <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800"><dt>{t("result.gross")}</dt><dd className="tabular-nums">{fmt.format(result.gross)}</dd></div>
            <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800"><dt>{t("result.capitalGain")}</dt><dd className="tabular-nums">{fmt.format(result.capitalGain)}</dd></div>
            <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800"><dt>{t("result.dividendsLabel")}</dt><dd className="tabular-nums">{fmt.format(result.dividends)}</dd></div>
            <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800"><dt>{t("result.totalGain")}</dt><dd className="tabular-nums">{fmt.format(result.totalGain)}</dd></div>
            <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800"><dt>{t("result.totalTax")}</dt><dd className="tabular-nums">−{fmt.format(result.totalTax)}</dd></div>
          </dl>
        ) : (
          <div className="text-sm text-slate-500">{t("empty")}</div>
        )}
      </div>
    </div>
  );
}
