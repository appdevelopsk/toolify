"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

type Direction = "ascending" | "descending";

export default function TextSorter() {
  const t = useTranslations("tools.text-sorter");
  const [input, setInput] = useState("");
  const [direction, setDirection] = useState<Direction>("ascending");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [removeDups, setRemoveDups] = useState(false);
  const [removeEmpty, setRemoveEmpty] = useState(false);
  const [trim, setTrim] = useState(false);
  const [copied, setCopied] = useState(false);

  const sorted = useMemo(() => {
    let lines = input.split("\n");
    if (trim) lines = lines.map((l) => l.trim());
    if (removeEmpty) lines = lines.filter((l) => l.length > 0);
    if (removeDups) {
      const seen = new Set<string>();
      lines = lines.filter((l) => {
        const key = caseSensitive ? l : l.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }
    lines.sort((a, b) => {
      const x = caseSensitive ? a : a.toLowerCase();
      const y = caseSensitive ? b : b.toLowerCase();
      return x < y ? -1 : x > y ? 1 : 0;
    });
    if (direction === "descending") lines.reverse();
    return lines;
  }, [input, direction, caseSensitive, removeDups, removeEmpty, trim]);

  const lineCount = sorted.length;
  const outputText = sorted.join("\n");

  async function copyOutput() {
    if (!outputText) return;
    await navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">{t("label.input")}</span>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={10}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-mono text-sm dark:border-slate-700 dark:bg-slate-900"
          />
        </label>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">{t("label.output")}</span>
          <pre className="flex-1 overflow-auto whitespace-pre-wrap rounded border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm dark:border-slate-800 dark:bg-slate-950">
            {outputText || " "}
          </pre>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
        <label className="block">
          <span className="mr-2 font-medium">{t("option.direction")}</span>
          <select
            value={direction}
            onChange={(e) => setDirection(e.target.value as Direction)}
            className="rounded border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-900"
          >
            <option value="ascending">{t("option.dirAsc")}</option>
            <option value="descending">{t("option.dirDesc")}</option>
          </select>
        </label>

        <label className="flex items-center gap-1">
          <input type="checkbox" checked={caseSensitive} onChange={(e) => setCaseSensitive(e.target.checked)} />
          {t("option.caseSensitive")}
        </label>
        <label className="flex items-center gap-1">
          <input type="checkbox" checked={removeDups} onChange={(e) => setRemoveDups(e.target.checked)} />
          {t("option.removeDups")}
        </label>
        <label className="flex items-center gap-1">
          <input type="checkbox" checked={removeEmpty} onChange={(e) => setRemoveEmpty(e.target.checked)} />
          {t("option.removeEmpty")}
        </label>
        <label className="flex items-center gap-1">
          <input type="checkbox" checked={trim} onChange={(e) => setTrim(e.target.checked)} />
          {t("option.trim")}
        </label>
      </div>

      <div aria-live="polite" className="mt-4 flex items-center justify-between">
        <span className="text-sm text-slate-600 dark:text-slate-400">
          {t("stat.lines", { count: lineCount })}
        </span>
        <button
          onClick={copyOutput}
          disabled={!outputText.trim()}
          className="rounded border border-slate-300 px-3 py-1 text-sm hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          {copied ? t("action.copied") : t("action.copy")}
        </button>
      </div>
    </div>
  );
}
