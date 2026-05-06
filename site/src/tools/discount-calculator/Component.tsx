"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

export default function DiscountCalculator() {
  const t = useTranslations("tools.discount-calculator");
  const locale = useLocale();
  const [original, setOriginal] = useState("");
  const [discountPct, setDiscountPct] = useState("20");
  const [taxPct, setTaxPct] = useState("0");

  const result = useMemo(() => {
    const o = parseFloat(original);
    const d = parseFloat(discountPct);
    const tx = parseFloat(taxPct);
    if (![o, d, tx].every(isFinite) || o < 0 || d < 0 || tx < 0) return null;
    const saved = (o * d) / 100;
    const afterDiscount = o - saved;
    const tax = (afterDiscount * tx) / 100;
    const finalPrice = afterDiscount + tax;
    return { saved, afterDiscount, tax, finalPrice };
  }, [original, discountPct, taxPct]);

  const currency = useMemo(
    () => new Intl.NumberFormat(locale, { style: "currency", currency: locale === "ja" ? "JPY" : "USD", maximumFractionDigits: locale === "ja" ? 0 : 2 }),
    [locale],
  );

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block">
          <span className="text-sm font-medium">{t("input.original")}</span>
          <input inputMode="decimal" value={original} onChange={(e) => setOriginal(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" placeholder="100" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.discountPct")}</span>
          <input inputMode="decimal" value={discountPct} onChange={(e) => setDiscountPct(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.taxPct")}</span>
          <input inputMode="decimal" value={taxPct} onChange={(e) => setTaxPct(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
        </label>
      </div>

      <div aria-live="polite" className={`mt-6 rounded-lg border p-4 ${result ? "border-brand-200 bg-brand-50 dark:border-brand-900 dark:bg-brand-900/20" : "border-slate-200 dark:border-slate-800"}`}>
        {result ? (
          <dl className="grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-wider text-slate-500">{t("result.finalPrice")}</dt>
              <dd className="mt-1 text-3xl font-bold tabular-nums">{currency.format(result.finalPrice)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-slate-500">{t("result.saved")}</dt>
              <dd className="mt-1 text-3xl font-bold tabular-nums text-emerald-600">{currency.format(result.saved)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-slate-500">{t("result.afterDiscount")}</dt>
              <dd className="mt-1 text-xl font-semibold tabular-nums">{currency.format(result.afterDiscount)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-slate-500">{t("result.tax")}</dt>
              <dd className="mt-1 text-xl font-semibold tabular-nums">{currency.format(result.tax)}</dd>
            </div>
          </dl>
        ) : (
          <div className="text-sm text-slate-500">{t("empty")}</div>
        )}
      </div>
    </div>
  );
}
