"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

const PRESETS: { id: string; rate: number }[] = [
  { id: "JP-std", rate: 10 },
  { id: "JP-reduced", rate: 8 },
  { id: "UK", rate: 20 },
  { id: "DE", rate: 19 },
  { id: "FR", rate: 20 },
  { id: "AU", rate: 10 },
  { id: "CA", rate: 5 },
  { id: "CN", rate: 13 },
];

type Mode = "addVat" | "removeVat";

export default function VatCalculator() {
  const t = useTranslations("tools.vat-calculator");
  const locale = useLocale();
  const [amount, setAmount] = useState("10000");
  const [rate, setRate] = useState("10");
  const [mode, setMode] = useState<Mode>("addVat");

  const result = useMemo(() => {
    const a = parseFloat(amount);
    const r = parseFloat(rate);
    if (![a, r].every(isFinite) || a < 0 || r < 0) return null;
    const rDec = r / 100;
    if (mode === "addVat") {
      const vat = a * rDec;
      return { net: a, vat, gross: a + vat };
    }
    const net = a / (1 + rDec);
    const vat = a - net;
    return { net, vat, gross: a };
  }, [amount, rate, mode]);

  const fmt = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }), [locale]);

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2">
        {(["addVat", "removeVat"] as Mode[]).map((m) => (
          <button key={m} onClick={() => setMode(m)} className={`rounded px-3 py-1 text-sm ${mode === m ? "bg-brand-600 text-white" : "border border-slate-300 dark:border-slate-700"}`}>
            {t(`mode.${m}`)}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">{mode === "addVat" ? t("input.netAmount") : t("input.grossAmount")}</span>
          <input type="number" step="any" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.ratePct")}</span>
          <input type="number" step="0.5" value={rate} onChange={(e) => setRate(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900" />
        </label>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button key={p.id} onClick={() => setRate(String(p.rate))} className="rounded border border-slate-300 px-3 py-1 text-xs hover:border-brand-500 dark:border-slate-700">
            {t(`preset.${p.id}`)} {p.rate}%
          </button>
        ))}
      </div>

      <div aria-live="polite" className="mt-6 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
        {result ? (
          <dl className="grid gap-2 text-sm">
            <div className="flex justify-between rounded bg-emerald-50 px-3 py-2 dark:bg-emerald-900/20">
              <dt className="font-medium">{t("result.gross")}</dt>
              <dd className="tabular-nums text-2xl font-bold">{fmt.format(result.gross)}</dd>
            </div>
            <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800">
              <dt>{t("result.net")}</dt>
              <dd className="tabular-nums">{fmt.format(result.net)}</dd>
            </div>
            <div className="flex justify-between border-b border-slate-200 py-1 dark:border-slate-800">
              <dt>{t("result.vat")}</dt>
              <dd className="tabular-nums">{fmt.format(result.vat)}</dd>
            </div>
          </dl>
        ) : (
          <div className="text-sm text-slate-600 dark:text-slate-400">{t("empty")}</div>
        )}
      </div>
    </div>
  );
}
