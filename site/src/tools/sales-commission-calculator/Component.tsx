"use client";

import { useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";

export default function SalesCommissionCalculator() {
  const t = useTranslations("tools.sales-commission-calculator");
  const locale = useLocale();
  const [amount, setAmount] = useState("");
  const [rate, setRate] = useState("");

  const result = useMemo(() => {
    const a = parseFloat(amount), r = parseFloat(rate);
    if (![a, r].every(isFinite) || a < 0 || r < 0) return null;
    const commission = (a * r) / 100;
    return { commission, net: a - commission };
  }, [amount, rate]);

  const fmt = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }), [locale]);

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">{t("input.amount")}</span>
          <input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="10000"
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.rate")}</span>
          <input inputMode="decimal" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="5"
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
        </label>
      </div>
      <div className="mt-6 rounded-lg bg-brand-50 p-4 dark:bg-slate-800">
        {result === null ? (
          <p className="text-slate-600 dark:text-slate-400">{t("result.empty")}</p>
        ) : (
          <dl className="grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-slate-600 dark:text-slate-400">{t("result.commission")}</dt>
              <dd className="text-2xl font-bold">{fmt.format(result.commission)}</dd>
            </div>
            <div>
              <dt className="text-sm text-slate-600 dark:text-slate-400">{t("result.net")}</dt>
              <dd className="text-2xl font-bold">{fmt.format(result.net)}</dd>
            </div>
          </dl>
        )}
      </div>
    </div>
  );
}
