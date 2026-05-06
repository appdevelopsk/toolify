"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

type Mode = "all" | "letters" | "words";

export default function CharacterFrequency() {
  const t = useTranslations("tools.character-frequency");
  const locale = useLocale();
  const [text, setText] = useState("");
  const [mode, setMode] = useState<Mode>("letters");
  const [caseSensitive, setCaseSensitive] = useState(false);

  const data = useMemo(() => {
    if (!text) return [];
    const counts = new Map<string, number>();
    if (mode === "words") {
      const words = text.trim().split(/\s+/).filter(Boolean);
      for (const w of words) {
        const key = caseSensitive ? w : w.toLowerCase();
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
    } else {
      for (const ch of text) {
        if (mode === "letters" && !/\p{L}|\p{N}/u.test(ch)) continue;
        const key = caseSensitive ? ch : ch.toLowerCase();
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
    }
    const total = [...counts.values()].reduce((a, b) => a + b, 0);
    return [...counts.entries()]
      .map(([item, count]) => ({ item, count, pct: total === 0 ? 0 : (count / total) * 100 }))
      .sort((a, b) => b.count - a.count);
  }, [text, mode, caseSensitive]);

  const fmt = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }), [locale]);
  const top = data.slice(0, 50);
  const totalShown = top.reduce((a, b) => a + b.count, 0);
  const grandTotal = data.reduce((a, b) => a + b.count, 0);

  return (
    <div>
      <label className="block">
        <span className="text-sm font-medium">{t("input.text")}</span>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={6} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-mono text-sm dark:border-slate-700 dark:bg-slate-900" />
      </label>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-md border border-slate-300 dark:border-slate-700">
          <button onClick={() => setMode("all")} className={`px-3 py-1.5 text-sm ${mode === "all" ? "bg-brand-600 text-white" : ""}`}>{t("mode.all")}</button>
          <button onClick={() => setMode("letters")} className={`px-3 py-1.5 text-sm ${mode === "letters" ? "bg-brand-600 text-white" : ""}`}>{t("mode.letters")}</button>
          <button onClick={() => setMode("words")} className={`px-3 py-1.5 text-sm ${mode === "words" ? "bg-brand-600 text-white" : ""}`}>{t("mode.words")}</button>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={caseSensitive} onChange={(e) => setCaseSensitive(e.target.checked)} />
          {t("caseSensitive")}
        </label>
      </div>

      {data.length > 0 && (
        <div aria-live="polite" className="mt-6">
          <div className="mb-2 text-xs text-slate-500">
            {t("stats.unique", { n: fmt.format(data.length) })} · {t("stats.total", { n: fmt.format(grandTotal) })}{data.length > top.length ? ` · ${t("stats.showingTop", { n: top.length })}` : ""}
          </div>
          <div className="overflow-hidden rounded border border-slate-200 dark:border-slate-800">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 dark:bg-slate-900">
                <tr>
                  <th className="px-3 py-2 text-left">{t("col.item")}</th>
                  <th className="px-3 py-2 text-right">{t("col.count")}</th>
                  <th className="px-3 py-2 text-right">%</th>
                </tr>
              </thead>
              <tbody>
                {top.map((row, i) => (
                  <tr key={i} className="border-t border-slate-200 dark:border-slate-800">
                    <td className="px-3 py-1.5 font-mono">{row.item === " " ? <span className="text-slate-400">[space]</span> : row.item}</td>
                    <td className="px-3 py-1.5 text-right tabular-nums">{fmt.format(row.count)}</td>
                    <td className="px-3 py-1.5 text-right tabular-nums">{fmt.format(row.pct)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data.length > top.length && (
            <div className="mt-2 text-xs text-slate-500">{t("stats.remainingCount", { n: fmt.format(grandTotal - totalShown) })}</div>
          )}
        </div>
      )}
    </div>
  );
}
