"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

const PRESETS = [10, 15, 18, 20, 25];

export default function TipCalculator() {
  const t = useTranslations("tools.tip-calculator");
  const locale = useLocale();
  const [bill, setBill] = useState("");
  const [tipPct, setTipPct] = useState("18");
  const [people, setPeople] = useState("1");

  const result = useMemo(() => {
    const b = parseFloat(bill);
    const p = parseFloat(tipPct);
    const n = Math.max(1, parseInt(people, 10) || 1);
    if (!isFinite(b) || !isFinite(p) || b < 0) return null;
    const tip = (b * p) / 100;
    const total = b + tip;
    return { tip, total, perPerson: total / n };
  }, [bill, tipPct, people]);

  const currency = useMemo(
    () => new Intl.NumberFormat(locale, { style: "currency", currency: locale === "ja" ? "JPY" : "USD" }),
    [locale],
  );

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block sm:col-span-1">
          <span className="text-sm font-medium">{t("input.bill")}</span>
          <input
            inputMode="decimal"
            value={bill}
            onChange={(e) => setBill(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
            placeholder="50.00"
          />
        </label>
        <label className="block sm:col-span-1">
          <span className="text-sm font-medium">{t("input.tipPct")}</span>
          <input
            inputMode="decimal"
            value={tipPct}
            onChange={(e) => setTipPct(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          />
          <div className="mt-2 flex flex-wrap gap-1">
            {PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => setTipPct(String(p))}
                className="rounded border border-slate-300 px-2 py-1 text-xs hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                {p}%
              </button>
            ))}
          </div>
        </label>
        <label className="block sm:col-span-1">
          <span className="text-sm font-medium">{t("input.people")}</span>
          <input
            inputMode="numeric"
            value={people}
            onChange={(e) => setPeople(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          />
        </label>
      </div>

      <div
        aria-live="polite"
        className={`mt-6 rounded-lg border p-4 ${
          result ? "border-brand-200 bg-brand-50 dark:border-brand-900 dark:bg-brand-900/20" : "border-slate-200 dark:border-slate-800"
        }`}
      >
        {result ? (
          <dl className="grid gap-3 sm:grid-cols-3">
            <div>
              <dt className="text-xs uppercase tracking-wider text-slate-500">{t("result.tip")}</dt>
              <dd className="mt-1 text-2xl font-bold tabular-nums">{currency.format(result.tip)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-slate-500">{t("result.total")}</dt>
              <dd className="mt-1 text-2xl font-bold tabular-nums">{currency.format(result.total)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-slate-500">{t("result.perPerson")}</dt>
              <dd className="mt-1 text-2xl font-bold tabular-nums">{currency.format(result.perPerson)}</dd>
            </div>
          </dl>
        ) : (
          <div className="text-sm text-slate-500">{t("empty")}</div>
        )}
      </div>
    </div>
  );
}
