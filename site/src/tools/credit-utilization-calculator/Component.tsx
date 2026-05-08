"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

interface Card {
  id: string;
  balance: string;
  limit: string;
}

let nextId = 1;
const newCard = (balance = "", limit = ""): Card => ({ id: String(nextId++), balance, limit });

export default function CreditUtilizationCalculator() {
  const t = useTranslations("tools.credit-utilization-calculator");
  const locale = useLocale();
  const [cards, setCards] = useState<Card[]>([
    newCard("500", "5000"),
    newCard("1200", "10000"),
  ]);

  const result = useMemo(() => {
    const perCard = cards.map((c) => {
      const bal = parseFloat(c.balance) || 0;
      const lim = parseFloat(c.limit) || 0;
      return { id: c.id, bal, lim, pct: lim > 0 ? (bal / lim) * 100 : null };
    });
    const totalBal = perCard.reduce((s, c) => s + c.bal, 0);
    const totalLim = perCard.reduce((s, c) => s + c.lim, 0);
    const overallPct = totalLim > 0 ? (totalBal / totalLim) * 100 : null;
    let category: "excellent" | "good" | "fair" | "poor" | null = null;
    if (overallPct !== null) {
      if (overallPct < 10) category = "excellent";
      else if (overallPct < 30) category = "good";
      else if (overallPct < 50) category = "fair";
      else category = "poor";
    }
    return { perCard, totalBal, totalLim, overallPct, category };
  }, [cards]);

  const fmt = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }), [locale]);
  const fmt0 = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }), [locale]);

  return (
    <div>
      <h2 className="text-sm font-semibold">{t("input.cardsHeading")}</h2>
      <div className="mt-2 space-y-2">
        {cards.map((c, i) => (
          <div key={c.id} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto] items-end">
            <label className="block">
              <span className="text-xs text-slate-600 dark:text-slate-400">{t("input.balance")} #{i + 1}</span>
              <input type="number" inputMode="decimal" value={c.balance}
                onChange={(e) => setCards((arr) => arr.map((x) => x.id === c.id ? { ...x, balance: e.target.value } : x))}
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-mono tabular-nums dark:border-slate-700 dark:bg-slate-900" />
            </label>
            <label className="block">
              <span className="text-xs text-slate-600 dark:text-slate-400">{t("input.limit")} #{i + 1}</span>
              <input type="number" inputMode="decimal" value={c.limit}
                onChange={(e) => setCards((arr) => arr.map((x) => x.id === c.id ? { ...x, limit: e.target.value } : x))}
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-mono tabular-nums dark:border-slate-700 dark:bg-slate-900" />
            </label>
            <button onClick={() => setCards((arr) => arr.filter((x) => x.id !== c.id))}
              disabled={cards.length <= 1} aria-label={t("removeCard")}
              className="px-2 py-2 text-slate-500 hover:text-rose-600 disabled:opacity-30">×</button>
          </div>
        ))}
      </div>
      <button onClick={() => setCards((arr) => [...arr, newCard()])}
        className="mt-3 rounded border border-slate-300 px-3 py-1 text-sm hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800">
        + {t("addCard")}
      </button>

      <div aria-live="polite" className={`mt-6 rounded-lg border p-4 ${
        !result.category ? "border-slate-200 dark:border-slate-800" :
        result.category === "excellent" ? "border-emerald-300 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-900/20" :
        result.category === "good" ? "border-lime-300 bg-lime-50 dark:border-lime-900 dark:bg-lime-900/20" :
        result.category === "fair" ? "border-amber-300 bg-amber-50 dark:border-amber-900 dark:bg-amber-900/20" :
        "border-rose-300 bg-rose-50 dark:border-rose-900 dark:bg-rose-900/20"
      }`}>
        {result.overallPct === null ? (
          <div className="text-sm text-slate-500">{t("empty")}</div>
        ) : (
          <>
            <dl className="grid gap-2 text-sm sm:grid-cols-2">
              <div className="flex justify-between border-b border-slate-200/60 py-1 sm:col-span-2">
                <dt className="font-medium">{t("result.overall")}</dt>
                <dd className="tabular-nums text-2xl font-bold">{fmt.format(result.overallPct)}%</dd>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 py-1">
                <dt>{t("result.totalBalance")}</dt>
                <dd className="tabular-nums">{fmt0.format(result.totalBal)}</dd>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 py-1">
                <dt>{t("result.totalLimit")}</dt>
                <dd className="tabular-nums">{fmt0.format(result.totalLim)}</dd>
              </div>
              {result.category && (
                <div className="sm:col-span-2 mt-2">
                  <div className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">{t("result.scoreImpact")}</div>
                  <div className="text-lg font-bold">{t(`category.${result.category}`)}</div>
                  <p className="mt-1 text-sm">{t(`categoryNote.${result.category}`)}</p>
                </div>
              )}
            </dl>

            {result.perCard.some((c) => c.pct !== null && c.pct >= 30) && (
              <div className="mt-4 border-t border-slate-200/60 pt-3">
                <div className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">{t("result.highCards")}</div>
                <ul className="mt-1 space-y-1 text-sm">
                  {result.perCard.filter((c) => c.pct !== null && c.pct >= 30).map((c, i) => (
                    <li key={c.id} className="flex justify-between">
                      <span>#{result.perCard.indexOf(c) + 1}</span>
                      <span className="tabular-nums">{fmt.format(c.pct!)}%</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
