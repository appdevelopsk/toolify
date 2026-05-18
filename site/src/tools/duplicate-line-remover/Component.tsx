"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

export default function DuplicateLineRemover() {
  const t = useTranslations("tools.duplicate-line-remover");
  const [input, setInput] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [trimLines, setTrimLines] = useState(true);
  const [keepFirst, setKeepFirst] = useState(true);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    if (!input) return null;
    const lines = input.split("\n");
    const originalCount = lines.length;

    const processed = trimLines ? lines.map((l) => l.trim()) : [...lines];

    const seen = new Map<string, number>();
    processed.forEach((line, i) => {
      const key = caseSensitive ? line : line.toLowerCase();
      if (!seen.has(key)) {
        seen.set(key, i);
      } else if (!keepFirst) {
        seen.set(key, i);
      }
    });

    const keptIndices = new Set(seen.values());
    const deduped = processed.filter((_, i) => keptIndices.has(i));

    const removedCount = originalCount - deduped.length;
    const remainingCount = deduped.length;
    const cleaned = deduped.join("\n");

    return { cleaned, originalCount, removedCount, remainingCount };
  }, [input, caseSensitive, trimLines, keepFirst]);

  async function copyResult() {
    if (!result?.cleaned) return;
    await navigator.clipboard.writeText(result.cleaned);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <div>
      <label className="block">
        <span className="text-sm font-medium">{t("input.text")}</span>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={10}
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-mono text-sm dark:border-slate-700 dark:bg-slate-900"
          placeholder="Paste lines here…"
        />
      </label>

      <div className="mt-3 flex flex-wrap gap-4 text-sm">
        <label className="flex items-center gap-1.5">
          <input
            type="checkbox"
            checked={caseSensitive}
            onChange={(e) => setCaseSensitive(e.target.checked)}
          />
          {t("input.caseSensitive")}
        </label>
        <label className="flex items-center gap-1.5">
          <input
            type="checkbox"
            checked={trimLines}
            onChange={(e) => setTrimLines(e.target.checked)}
          />
          {t("input.trimLines")}
        </label>
        <label className="flex items-center gap-1.5">
          <input
            type="checkbox"
            checked={keepFirst}
            onChange={(e) => setKeepFirst(e.target.checked)}
          />
          {t("input.keepFirst")}
        </label>
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
          <div className="flex flex-col gap-3">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {t("result.stats", {
                removed: result.removedCount,
                remaining: result.remainingCount,
              })}
            </p>
            <label className="block">
              <span className="text-sm font-medium">{t("result.cleaned")}</span>
              <textarea
                readOnly
                value={result.cleaned}
                rows={10}
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-mono text-sm dark:border-slate-700 dark:bg-slate-900"
              />
            </label>
            <div className="flex justify-end">
              <button
                onClick={copyResult}
                disabled={!result.cleaned}
                className="rounded border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                {copied ? t("button.copied") : t("button.copy")}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-600 dark:text-slate-400">{t("empty")}</p>
        )}
      </div>
    </div>
  );
}
