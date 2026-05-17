"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

type Mode = "addTax" | "fromTotal";

export default function SalesTaxCalculator() {
  const t = useTranslations("tools.sales-tax-calculator");
  const locale = useLocale();
  const [mode, setMode] = useState<Mode>("addTax");
  const [amount, setAmount] = useState("");
  const [taxPct, setTaxPct] = useState(locale === "ja" ? "10" : "8.875");

  const result = useMemo(() => {
    const a = parseFloat(amount);
    const r = parseFloat(taxPct) / 100;
    if (![a, r].every(isFinite) || a < 0 || r < 0) return null;
    if (mode === "addTax") {
      const tax = a * r;
      return { net: a, tax, gross: a + tax };
    } else {
      const net = a / (1 + r);
      const tax = a - net;
      return { net, tax, gross: a };
    }
  }, [mode, amount, taxPct]);

  const currency = useMemo(
    () => new Intl.NumberFormat(locale, { style: "currency", currency: locale === "ja" ? "JPY" : "USD", maximumFractionDigits: locale === "ja" ? 0 : 2 }),
    [locale],
  );

  return (
    <div>
      <div className="mb-4 inline-flex rounded-md border border-slate-300 dark:border-slate-700">
        <button onClick={() => setMode("addTax")} className={`px-3 py-1.5 text-sm ${mode === "addTax" ? "bg-brand-600 text-white" : ""}`}>
          {t("mode.addTax")}
        </button>
        <button onClick={() => setMode("fromTotal")} className={`px-3 py-1.5 text-sm ${mode === "fromTotal" ? "bg-brand-600 text-white" : ""}`}>
          {t("mode.fromTotal")}
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">{mode === "addTax" ? t("input.amountNet") : t("input.amountGross")}</span>
          <input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.taxPct")}</span>
          <input inputMode="decimal" value={taxPct} onChange={(e) => setTaxPct(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
        </label>
      </div>

      <div aria-live="polite" className={`mt-6 rounded-lg border p-4 ${result ? "border-brand-200 bg-brand-50 dark:border-brand-900 dark:bg-brand-900/20" : "border-slate-200 dark:border-slate-800"}`}>
        {result ? (
          <dl className="grid gap-3 sm:grid-cols-3">
            <div>
              <dt className="text-xs uppercase tracking-wider text-slate-500">{t("result.net")}</dt>
              <dd className="mt-1 text-2xl font-bold tabular-nums">{currency.format(result.net)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-slate-500">{t("result.tax")}</dt>
              <dd className="mt-1 text-2xl font-bold tabular-nums text-amber-700">{currency.format(result.tax)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-slate-500">{t("result.gross")}</dt>
              <dd className="mt-1 text-2xl font-bold tabular-nums">{currency.format(result.gross)}</dd>
            </div>
          </dl>
        ) : (
          <div className="text-sm text-slate-500">{t("empty")}</div>
        )}
      </div>
    </div>
  );
}
