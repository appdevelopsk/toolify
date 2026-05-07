"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

export default function CryptoProfitCalculator() {
  const t = useTranslations("tools.crypto-profit-calculator");
  const locale = useLocale();
  const [amount, setAmount] = useState("0.5");
  const [buyPrice, setBuyPrice] = useState("60000");
  const [sellPrice, setSellPrice] = useState("75000");
  const [feePct, setFeePct] = useState("0.2");

  const result = useMemo(() => {
    const a = parseFloat(amount);
    const bp = parseFloat(buyPrice);
    const sp = parseFloat(sellPrice);
    const fp = parseFloat(feePct) / 100;
    if (![a, bp, sp, fp].every(isFinite) || a <= 0 || bp <= 0 || sp <= 0) return null;
    const cost = a * bp;
    const gross = a * sp;
    const buyFee = cost * fp;
    const sellFee = gross * fp;
    const totalFees = buyFee + sellFee;
    const netProfit = gross - cost - totalFees;
    const roi = (netProfit / (cost + buyFee)) * 100;
    return { cost, gross, totalFees, netProfit, roi };
  }, [amount, buyPrice, sellPrice, feePct]);

  const fmt = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }), [locale]);

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">{t("input.amount")}</span>
          <input type="number" step="0.0001" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.feePct")}</span>
          <input type="number" step="0.01" value={feePct} onChange={(e) => setFeePct(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.buyPrice")}</span>
          <input type="number" value={buyPrice} onChange={(e) => setBuyPrice(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.sellPrice")}</span>
          <input type="number" value={sellPrice} onChange={(e) => setSellPrice(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900" />
        </label>
      </div>

      <div aria-live="polite" className="mt-6 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
        {result ? (
          <dl className="grid gap-2 text-sm">
            <div className={`flex justify-between rounded px-3 py-2 ${result.netProfit >= 0 ? "bg-emerald-50 dark:bg-emerald-900/20" : "bg-rose-50 dark:bg-rose-900/20"}`}>
              <dt className="font-medium">{t("result.netProfit")}</dt>
              <dd className="tabular-nums text-2xl font-bold">{fmt.format(result.netProfit)}</dd>
            </div>
            <div className={`flex justify-between rounded px-3 py-2 ${result.roi >= 0 ? "bg-emerald-50 dark:bg-emerald-900/20" : "bg-rose-50 dark:bg-rose-900/20"}`}>
              <dt className="font-medium">{t("result.roi")}</dt>
              <dd className="tabular-nums text-lg font-bold">{fmt.format(result.roi)}%</dd>
            </div>
            <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800"><dt>{t("result.cost")}</dt><dd className="tabular-nums">{fmt.format(result.cost)}</dd></div>
            <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800"><dt>{t("result.gross")}</dt><dd className="tabular-nums">{fmt.format(result.gross)}</dd></div>
            <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800"><dt>{t("result.totalFees")}</dt><dd className="tabular-nums">{fmt.format(result.totalFees)}</dd></div>
          </dl>
        ) : (
          <div className="text-sm text-slate-500">{t("empty")}</div>
        )}
      </div>
    </div>
  );
}
