"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

// Static exchange rates vs USD (approximate, 2025-06)
const RATES: Record<string, number> = {
  USD: 1.0,
  EUR: 0.921,
  GBP: 0.786,
  JPY: 144.5,
  CNY: 7.25,
  KRW: 1374,
  INR: 83.9,
  AUD: 1.548,
  CAD: 1.378,
  CHF: 0.896,
  SGD: 1.346,
  HKD: 7.784,
  BRL: 5.72,
  MXN: 17.15,
  THB: 35.8,
  ZAR: 18.7,
  SEK: 10.38,
  NOK: 10.82,
  DKK: 6.88,
  NZD: 1.696,
  TRY: 38.5,
  IDR: 16350,
  MYR: 4.73,
  PHP: 58.2,
  VND: 25950,
  AED: 3.673,
  SAR: 3.75,
  QAR: 3.64,
  EGP: 48.5,
  PKR: 278,
  BDT: 110,
};

const CURRENCY_NAMES: Record<string, string> = {
  USD: "US Dollar",
  EUR: "Euro",
  GBP: "British Pound",
  JPY: "Japanese Yen",
  CNY: "Chinese Yuan",
  KRW: "South Korean Won",
  INR: "Indian Rupee",
  AUD: "Australian Dollar",
  CAD: "Canadian Dollar",
  CHF: "Swiss Franc",
  SGD: "Singapore Dollar",
  HKD: "Hong Kong Dollar",
  BRL: "Brazilian Real",
  MXN: "Mexican Peso",
  THB: "Thai Baht",
  ZAR: "South African Rand",
  SEK: "Swedish Krona",
  NOK: "Norwegian Krone",
  DKK: "Danish Krone",
  NZD: "New Zealand Dollar",
  TRY: "Turkish Lira",
  IDR: "Indonesian Rupiah",
  MYR: "Malaysian Ringgit",
  PHP: "Philippine Peso",
  VND: "Vietnamese Dong",
  AED: "UAE Dirham",
  SAR: "Saudi Riyal",
  QAR: "Qatari Riyal",
  EGP: "Egyptian Pound",
  PKR: "Pakistani Rupee",
  BDT: "Bangladeshi Taka",
};

const QUICK_PAIRS: Array<{ from: string; to: string; label: string }> = [
  { from: "USD", to: "EUR", label: "USD↔EUR" },
  { from: "USD", to: "JPY", label: "USD↔JPY" },
  { from: "USD", to: "GBP", label: "USD↔GBP" },
  { from: "USD", to: "CNY", label: "USD↔CNY" },
  { from: "EUR", to: "JPY", label: "EUR↔JPY" },
];

const CURRENCIES = Object.keys(RATES);

export default function CurrencyConverter() {
  const t = useTranslations("tools.currency-converter");
  const locale = useLocale();

  const [amount, setAmount] = useState("100");
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("JPY");

  function handleSwap() {
    setFrom(to);
    setTo(from);
  }

  function applyPair(pair: (typeof QUICK_PAIRS)[number]) {
    setFrom(pair.from);
    setTo(pair.to);
  }

  const result = useMemo(() => {
    const amt = parseFloat(amount);
    if (!isFinite(amt) || amt < 0) return null;
    const fromRate = RATES[from];
    const toRate = RATES[to];
    if (!fromRate || !toRate) return null;
    const converted = amt * (toRate / fromRate);
    const rate = toRate / fromRate;
    const reverseRate = fromRate / toRate;
    return { converted, rate, reverseRate };
  }, [amount, from, to]);

  const fmtConverted = useMemo(() => {
    // For currencies with large values, use 0 decimal places
    const isLarge = ["JPY", "KRW", "IDR", "VND"].includes(to);
    return new Intl.NumberFormat(locale, {
      maximumFractionDigits: isLarge ? 0 : 4,
      minimumFractionDigits: isLarge ? 0 : 2,
    });
  }, [locale, to]);

  const fmtRate = useMemo(
    () => new Intl.NumberFormat(locale, { maximumFractionDigits: 6 }),
    [locale]
  );

  const selectClass =
    "mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900";
  const inputClass =
    "mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900";

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-1">
        {QUICK_PAIRS.map((p) => (
          <button
            key={p.label}
            onClick={() => applyPair(p)}
            className="rounded border border-slate-300 px-2 py-1 text-xs hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="text-sm font-medium">{t("input.amount")}</span>
          <input
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={inputClass}
            placeholder="100"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.from")}</span>
          <select value={from} onChange={(e) => setFrom(e.target.value)} className={selectClass}>
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c} — {CURRENCY_NAMES[c]}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.to")}</span>
          <select value={to} onChange={(e) => setTo(e.target.value)} className={selectClass}>
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c} — {CURRENCY_NAMES[c]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-3">
        <button
          onClick={handleSwap}
          className="rounded border border-slate-300 px-4 py-2 text-sm hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          ⇄ {t("button.swap")}
        </button>
      </div>

      <div
        aria-live="polite"
        className={`mt-6 rounded-lg border p-4 ${
          result
            ? "border-brand-200 bg-brand-50 dark:border-brand-900 dark:bg-brand-900/20"
            : "border-slate-200 dark:border-slate-800"
        }`}
      >
        {result ? (
          <div>
            <dl className="grid gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <dt className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  {t("result.converted")}
                </dt>
                <dd className="mt-1 text-3xl font-bold tabular-nums">
                  {fmtConverted.format(result.converted)}{" "}
                  <span className="text-lg font-semibold">{to}</span>
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  {t("result.rate")}
                </dt>
                <dd className="mt-1 text-sm font-medium tabular-nums">
                  1 {from} = {fmtRate.format(result.rate)} {to}
                </dd>
                <dd className="mt-1 text-sm font-medium tabular-nums text-slate-500">
                  1 {to} = {fmtRate.format(result.reverseRate)} {from}
                </dd>
              </div>
            </dl>
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
              {t("note.disclaimer")}
            </p>
          </div>
        ) : (
          <p className="text-sm text-slate-600 dark:text-slate-400">{t("empty")}</p>
        )}
      </div>
    </div>
  );
}
