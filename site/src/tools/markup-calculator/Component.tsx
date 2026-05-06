"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

export default function MarkupCalculator() {
  const t = useTranslations("tools.markup-calculator");
  const locale = useLocale();
  const [cost, setCost] = useState("");
  const [markupPct, setMarkupPct] = useState("30");

  const result = useMemo(() => {
    const c = parseFloat(cost);
    const m = parseFloat(markupPct);
    if (![c, m].every(isFinite) || c < 0) return null;
    const profit = (c * m) / 100;
    const sellPrice = c + profit;
    const marginPct = sellPrice === 0 ? 0 : (profit / sellPrice) * 100;
    return { profit, sellPrice, marginPct };
  }, [cost, markupPct]);

  const currency = useMemo(
    () => new Intl.NumberFormat(locale, { style: "currency", currency: locale === "ja" ? "JPY" : "USD", maximumFractionDigits: locale === "ja" ? 0 : 2 }),
    [locale],
  );
  const fmt = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }), [locale]);

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">{t("input.cost")}</span>
          <input inputMode="decimal" value={cost} onChange={(e) => setCost(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" placeholder="100" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.markupPct")}</span>
          <input inputMode="decimal" value={markupPct} onChange={(e) => setMarkupPct(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
        </label>
      </div>
      <div aria-live="polite" className={`mt-6 rounded-lg border p-4 ${result ? "border-brand-200 bg-brand-50 dark:border-brand-900 dark:bg-brand-900/20" : "border-slate-200 dark:border-slate-800"}`}>
        {result ? (
          <dl className="grid gap-3 sm:grid-cols-3">
            <div>
              <dt className="text-xs uppercase tracking-wider text-slate-500">{t("result.sellPrice")}</dt>
              <dd className="mt-1 text-3xl font-bold tabular-nums">{currency.format(result.sellPrice)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-slate-500">{t("result.profit")}</dt>
              <dd className="mt-1 text-2xl font-bold tabular-nums text-emerald-600">{currency.format(result.profit)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-slate-500">{t("result.margin")}</dt>
              <dd className="mt-1 text-2xl font-bold tabular-nums">{fmt.format(result.marginPct)}%</dd>
            </div>
          </dl>
        ) : (
          <div className="text-sm text-slate-500">{t("empty")}</div>
        )}
      </div>
    </div>
  );
}
