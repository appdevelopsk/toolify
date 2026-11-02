"use client";

import { useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { copyText } from "@/lib/clipboard/copyText";

type Mode = "format" | "minify";

function process(text: string, mode: Mode, indent: number): { ok: true; out: string } | { ok: false; error: string } {
  if (!text.trim()) return { ok: true, out: "" };
  try {
    const parsed = JSON.parse(text);
    const out = mode === "format" ? JSON.stringify(parsed, null, indent) : JSON.stringify(parsed);
    return { ok: true, out };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export default function JsonFormatter() {
  const t = useTranslations("tools.json-formatter");
  const [text, setText] = useState('{"hello": "world", "items": [1, 2, 3]}');
  const [mode, setMode] = useState<Mode>("format");
  const [indent, setIndent] = useState(2);
  const [copied, setCopied] = useState(false);
  const revision = useRef(0);
  const invalidateCopy = () => { revision.current += 1; setCopied(false); };

  const result = useMemo(() => process(text, mode, indent), [text, mode, indent]);
  // Never leave a successful copied state for a result that has changed.
  const displayedCopied = copied && result.ok && result.out.length > 0;

  async function copy() {
    if (!result.ok || !result.out) return;
    const requestRevision = revision.current;
    const success = await copyText(result.out);
    if (requestRevision === revision.current) setCopied(success);
  }

  const stats = useMemo(() => {
    if (!result.ok) return null;
    const inputBytes = new TextEncoder().encode(text).length;
    const outputBytes = new TextEncoder().encode(result.out).length;
    return { inputBytes, outputBytes };
  }, [text, result]);

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-md border border-slate-300 dark:border-slate-700">
          <button onClick={() => { setMode("format"); invalidateCopy(); }} className={`px-3 py-1.5 text-sm ${mode === "format" ? "bg-brand-600 text-white" : ""}`}>
            {t("mode.format")}
          </button>
          <button onClick={() => { setMode("minify"); setCopied(false); }} className={`px-3 py-1.5 text-sm ${mode === "minify" ? "bg-brand-600 text-white" : ""}`}>
            {t("mode.minify")}
          </button>
        </div>
        {mode === "format" && (
          <label className="flex items-center gap-2 text-sm">
            {t("indent")}:
            <select value={indent} onChange={(e) => { setIndent(parseInt(e.target.value, 10)); setCopied(false); }} className="rounded border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-900">
              <option value={2}>2</option>
              <option value={4}>4</option>
              <option value={8}>8</option>
            </select>
          </label>
        )}
      </div>

      <label className="block">
        <span className="text-sm font-medium">{t("input")}</span>
        <textarea value={text} onChange={(e) => { setText(e.target.value); setCopied(false); }} rows={6} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-mono text-sm dark:border-slate-700 dark:bg-slate-900" />
      </label>

      <div aria-live="polite" className="mt-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{t("output")}</span>
          {result.ok && result.out && (
            <button type="button" onClick={copy} className="min-h-11 rounded-lg border border-slate-300 px-4 text-sm font-medium hover:border-brand-500 hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-slate-700 dark:hover:bg-slate-800">
              {displayedCopied ? t("copied") : t("copy")}
            </button>
          )}
        </div>
        {result.ok ? (
          <pre className="mt-1 max-h-[400px] overflow-auto rounded border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm dark:border-slate-800 dark:bg-slate-950">{result.out || " "}</pre>
        ) : (
          <pre className="mt-1 rounded border border-red-300 bg-red-50 px-3 py-2 font-mono text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">{t("error")}: {result.error}</pre>
        )}
        {stats && (
          <div className="mt-2 text-xs text-slate-600 dark:text-slate-400 tabular-nums">
            {t("stats", { input: stats.inputBytes, output: stats.outputBytes })}
          </div>
        )}
      </div>
    </div>
  );
}
