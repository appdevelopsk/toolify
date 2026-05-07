"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

interface Row { label: string; value: string }

const ASSET_DEFAULTS: { id: string; label: string }[] = [
  { id: "cash", label: "asset.cash" },
  { id: "investments", label: "asset.investments" },
  { id: "retirement", label: "asset.retirement" },
  { id: "realEstate", label: "asset.realEstate" },
  { id: "vehicles", label: "asset.vehicles" },
  { id: "otherAssets", label: "asset.other" },
];

const LIABILITY_DEFAULTS: { id: string; label: string }[] = [
  { id: "mortgage", label: "liability.mortgage" },
  { id: "studentLoans", label: "liability.student" },
  { id: "creditCards", label: "liability.creditCards" },
  { id: "autoLoans", label: "liability.autoLoans" },
  { id: "otherDebt", label: "liability.other" },
];

export default function NetWorthCalculator() {
  const t = useTranslations("tools.net-worth-calculator");
  const locale = useLocale();
  const [assets, setAssets] = useState<Record<string, string>>({});
  const [liabilities, setLiabilities] = useState<Record<string, string>>({});

  const result = useMemo(() => {
    const sumAssets = ASSET_DEFAULTS.reduce((s, x) => s + (parseFloat(assets[x.id] ?? "0") || 0), 0);
    const sumLiabilities = LIABILITY_DEFAULTS.reduce((s, x) => s + (parseFloat(liabilities[x.id] ?? "0") || 0), 0);
    return { sumAssets, sumLiabilities, netWorth: sumAssets - sumLiabilities };
  }, [assets, liabilities]);

  const fmt = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }), [locale]);

  return (
    <div>
      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <h3 className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{t("section.assets")}</h3>
          <div className="mt-3 space-y-2">
            {ASSET_DEFAULTS.map((x) => (
              <label key={x.id} className="flex items-center gap-3">
                <span className="flex-1 text-sm">{t(x.label)}</span>
                <input
                  type="number"
                  value={assets[x.id] ?? ""}
                  onChange={(e) => setAssets((prev) => ({ ...prev, [x.id]: e.target.value }))}
                  className="w-32 rounded border border-slate-300 px-2 py-1 text-right tabular-nums dark:border-slate-700 dark:bg-slate-900"
                />
              </label>
            ))}
          </div>
          <div className="mt-3 flex justify-between border-t border-slate-200 pt-2 dark:border-slate-800">
            <span className="font-medium">{t("totalAssets")}</span>
            <span className="tabular-nums font-bold">{fmt.format(result.sumAssets)}</span>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-bold text-rose-700 dark:text-rose-400">{t("section.liabilities")}</h3>
          <div className="mt-3 space-y-2">
            {LIABILITY_DEFAULTS.map((x) => (
              <label key={x.id} className="flex items-center gap-3">
                <span className="flex-1 text-sm">{t(x.label)}</span>
                <input
                  type="number"
                  value={liabilities[x.id] ?? ""}
                  onChange={(e) => setLiabilities((prev) => ({ ...prev, [x.id]: e.target.value }))}
                  className="w-32 rounded border border-slate-300 px-2 py-1 text-right tabular-nums dark:border-slate-700 dark:bg-slate-900"
                />
              </label>
            ))}
          </div>
          <div className="mt-3 flex justify-between border-t border-slate-200 pt-2 dark:border-slate-800">
            <span className="font-medium">{t("totalLiabilities")}</span>
            <span className="tabular-nums font-bold">{fmt.format(result.sumLiabilities)}</span>
          </div>
        </section>
      </div>

      <div aria-live="polite" className="mt-6 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
        <div className={`rounded p-4 text-center ${result.netWorth >= 0 ? "bg-emerald-50 dark:bg-emerald-900/20" : "bg-rose-50 dark:bg-rose-900/20"}`}>
          <div className="text-sm font-medium">{t("result.netWorth")}</div>
          <div className="tabular-nums text-4xl font-bold">{fmt.format(result.netWorth)}</div>
          <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            {t("result.formula")}: {fmt.format(result.sumAssets)} − {fmt.format(result.sumLiabilities)}
          </div>
        </div>
      </div>
    </div>
  );
}
