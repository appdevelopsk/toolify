"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default function TextReplace() {
  const t = useTranslations("tools.text-replace");
  const [text, setText] = useState("");
  const [find, setFind] = useState("");
  const [replace, setReplace] = useState("");
  const [useRegex, setUseRegex] = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(true);
  const [multiline, setMultiline] = useState(false);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    if (!find) return { text, count: 0, error: null as string | null };
    try {
      const flags = "g" + (caseSensitive ? "" : "i") + (multiline ? "m" : "");
      const re = new RegExp(useRegex ? find : escapeRegExp(find), flags);
      const matches = text.match(re);
      const count = matches?.length ?? 0;
      return { text: text.replace(re, replace), count, error: null };
    } catch (e) {
      return { text, count: 0, error: e instanceof Error ? e.message : String(e) };
    }
  }, [text, find, replace, useRegex, caseSensitive, multiline]);

  async function copyResult() {
    if (!result.text) return;
    await navigator.clipboard.writeText(result.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <div>
      <label className="block">
        <span className="text-sm font-medium">{t("input.text")}</span>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={6} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-mono text-sm dark:border-slate-700 dark:bg-slate-900" />
      </label>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">{t("input.find")}</span>
          <input value={find} onChange={(e) => setFind(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-mono text-sm dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.replace")}</span>
          <input value={replace} onChange={(e) => setReplace(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-mono text-sm dark:border-slate-700 dark:bg-slate-900" />
        </label>
      </div>

      <div className="mt-3 flex flex-wrap gap-3 text-sm">
        <label className="flex items-center gap-1"><input type="checkbox" checked={useRegex} onChange={(e) => setUseRegex(e.target.checked)} /> {t("opt.regex")}</label>
        <label className="flex items-center gap-1"><input type="checkbox" checked={caseSensitive} onChange={(e) => setCaseSensitive(e.target.checked)} /> {t("opt.caseSensitive")}</label>
        <label className="flex items-center gap-1"><input type="checkbox" checked={multiline} onChange={(e) => setMultiline(e.target.checked)} /> {t("opt.multiline")}</label>
      </div>

      {result.error && (
        <div className="mt-3 rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
          {t("error")}: {result.error}
        </div>
      )}

      <div aria-live="polite" className="mt-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{t("output.result")} ({t("output.matches", { n: result.count })})</span>
          {result.text && (
            <button onClick={copyResult} className="text-xs hover:underline">
              {copied ? t("copied") : t("copy")}
            </button>
          )}
        </div>
        <pre className="mt-1 max-h-[400px] overflow-auto whitespace-pre-wrap rounded border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm dark:border-slate-800 dark:bg-slate-950">{result.text || " "}</pre>
      </div>
    </div>
  );
}
