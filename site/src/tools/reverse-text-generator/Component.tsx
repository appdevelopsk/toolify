"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

type Mode = "chars" | "words" | "lines";

function reverseText(input: string, mode: Mode): string {
  if (!input) return "";
  switch (mode) {
    case "chars":
      // Use Array.from to correctly handle multi-codepoint characters (e.g. emoji, CJK)
      return Array.from(input).reverse().join("");
    case "words":
      return input
        .split(/(\s+)/)
        .reverse()
        .join("");
    case "lines":
      return input.split("\n").reverse().join("\n");
  }
}

export default function ReverseTextGenerator() {
  const t = useTranslations("tools.reverse-text-generator");
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<Mode>("chars");
  const [copied, setCopied] = useState(false);

  const reversed = useMemo(() => reverseText(input, mode), [input, mode]);

  const charCount = useMemo(() => Array.from(input).length, [input]);

  async function copyResult() {
    if (!reversed) return;
    await navigator.clipboard.writeText(reversed);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">{t("input.text")}</span>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={8}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-mono text-sm dark:border-slate-700 dark:bg-slate-900"
            placeholder="Type or paste text here…"
          />
        </label>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">{t("result.reversed")}</span>
          <textarea
            readOnly
            value={reversed}
            rows={8}
            className="flex-1 rounded border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm dark:border-slate-800 dark:bg-slate-950"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
        <label className="block">
          <span className="mr-2 font-medium">{t("input.mode")}</span>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as Mode)}
            className="rounded border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-900"
          >
            <option value="chars">{t("modes.chars")}</option>
            <option value="words">{t("modes.words")}</option>
            <option value="lines">{t("modes.lines")}</option>
          </select>
        </label>
      </div>

      <div aria-live="polite" className="mt-4 flex items-center justify-between">
        <span className="text-sm text-slate-600 dark:text-slate-400">
          {charCount} {charCount === 1 ? "character" : "characters"}
        </span>
        <button
          onClick={copyResult}
          disabled={!reversed}
          className="rounded border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          {copied ? t("button.copied") : t("button.copy")}
        </button>
      </div>
    </div>
  );
}
