"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

export default function LoanCalculator() {
  const t = useTranslations("tools.loan-calculator");
  const locale = useLocale();
  const [principal, setPrincipal] = useState("250000");
  const [ratePct, setRatePct] = useState("4.5");
  const [years, setYears] = useState("30");

  const result = useMemo(() => {
    const P = parseFloat(principal);
    const r = parseFloat(ratePct) / 100 / 12;
    const n = parseFloat(years) * 12;
    if (![P, r, n].every(isFinite) || P <= 0 || n <= 0) return null;
    if (r === 0) {
      const monthly = P / n;
      return { monthly, totalPaid: monthly * n, totalInterest: 0 };
    }
    const monthly = (P * r) / (1 - Math.pow(1 + r, -n));
    const totalPaid = monthly * n;
    const totalInterest = totalPaid - P;
    return { monthly, totalPaid, totalInterest };
  }, [principal, ratePct, years]);

  const currency = useMemo(
    () => new Intl.NumberFormat(locale, { style: "currency", currency: locale === "ja" ? "JPY" : "USD", maximumFractionDigits: 0 }),
    [locale],
  );
  const cents = useMemo(
    () => new Intl.NumberFormat(locale, { style: "currency", currency: locale === "ja" ? "JPY" : "USD", maximumFractionDigits: locale === "ja" ? 0 : 2 }),
    [locale],
  );

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block">
          <span className="text-sm font-medium">{t("input.principal")}</span>
          <input inputMode="decimal" value={principal} onChange={(e) => setPrincipal(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.ratePct")}</span>
          <input inputMode="decimal" value={ratePct} onChange={(e) => setRatePct(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.years")}</span>
          <input inputMode="decimal" value={years} onChange={(e) => setYears(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
        </label>
      </div>

      <div aria-live="polite" className={`mt-6 rounded-lg border p-4 ${result ? "border-brand-200 bg-brand-50 dark:border-brand-900 dark:bg-brand-900/20" : "border-slate-200 dark:border-slate-800"}`}>
        {result ? (
          <dl className="grid gap-3 sm:grid-cols-3">
            <div>
              <dt className="text-xs uppercase tracking-wider text-slate-500">{t("result.monthly")}</dt>
              <dd className="mt-1 text-3xl font-bold tabular-nums">{cents.format(result.monthly)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-slate-500">{t("result.totalPaid")}</dt>
              <dd className="mt-1 text-2xl font-bold tabular-nums">{currency.format(result.totalPaid)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-slate-500">{t("result.totalInterest")}</dt>
              <dd className="mt-1 text-2xl font-bold tabular-nums text-amber-600">{currency.format(result.totalInterest)}</dd>
            </div>
          </dl>
        ) : (
          <div className="text-sm text-slate-500">{t("empty")}</div>
        )}
      </div>
    </div>
  );
}
