"use client";

import { useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";

export default function DownPaymentCalculator() {
  const t = useTranslations("tools.down-payment-calculator");
  const locale = useLocale();
  const [price, setPrice] = useState("");
  const [percent, setPercent] = useState("");

  const result = useMemo(() => {
    const p = parseFloat(price), r = parseFloat(percent);
    if (![p, r].every(isFinite) || p < 0 || r < 0) return null;
    const down = (p * r) / 100;
    return { down, loan: p - down };
  }, [price, percent]);

  const fmt = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }), [locale]);

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">{t("input.price")}</span>
          <input inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="300000"
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.percent")}</span>
          <input inputMode="decimal" value={percent} onChange={(e) => setPercent(e.target.value)} placeholder="20"
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
        </label>
      </div>
      <div className="mt-6 rounded-lg bg-brand-50 p-4 dark:bg-slate-800">
        {result === null ? (
          <p className="text-slate-600 dark:text-slate-400">{t("result.empty")}</p>
        ) : (
          <dl className="grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-slate-600 dark:text-slate-400">{t("result.down")}</dt>
              <dd className="text-2xl font-bold">{fmt.format(result.down)}</dd>
            </div>
            <div>
              <dt className="text-sm text-slate-600 dark:text-slate-400">{t("result.loan")}</dt>
              <dd className="text-2xl font-bold">{fmt.format(result.loan)}</dd>
            </div>
          </dl>
        )}
      </div>
    </div>
  );
}
