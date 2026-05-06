"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

type Mode = "encode" | "decode";

function process(text: string, mode: Mode): { ok: true; out: string } | { ok: false; error: string } {
  if (!text) return { ok: true, out: "" };
  try {
    const out = mode === "encode" ? encodeURIComponent(text) : decodeURIComponent(text);
    return { ok: true, out };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export default function UrlEncoder() {
  const t = useTranslations("tools.url-encoder");
  const [mode, setMode] = useState<Mode>("encode");
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => process(text, mode), [text, mode]);

  async function copy() {
    if (!result.ok || !result.out) return;
    await navigator.clipboard.writeText(result.out);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <div>
      <div className="mb-3 inline-flex rounded-md border border-slate-300 dark:border-slate-700">
        <button onClick={() => setMode("encode")} className={`px-3 py-1.5 text-sm ${mode === "encode" ? "bg-brand-600 text-white" : ""}`}>
          {t("mode.encode")}
        </button>
        <button onClick={() => setMode("decode")} className={`px-3 py-1.5 text-sm ${mode === "decode" ? "bg-brand-600 text-white" : ""}`}>
          {t("mode.decode")}
        </button>
      </div>

      <label className="block">
        <span className="text-sm font-medium">{mode === "encode" ? t("input.plain") : t("input.encoded")}</span>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={5} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-mono text-sm dark:border-slate-700 dark:bg-slate-900" />
      </label>

      <div aria-live="polite" className="mt-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{mode === "encode" ? t("output.encoded") : t("output.plain")}</span>
          {result.ok && result.out && (
            <button onClick={copy} className="text-xs hover:underline">
              {copied ? t("copied") : t("copy")}
            </button>
          )}
        </div>
        {result.ok ? (
          <pre className="mt-1 min-h-[80px] overflow-x-auto whitespace-pre-wrap break-all rounded border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm dark:border-slate-800 dark:bg-slate-950">
            {result.out || " "}
          </pre>
        ) : (
          <pre className="mt-1 rounded border border-red-300 bg-red-50 px-3 py-2 font-mono text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">{t("error")}: {result.error}</pre>
        )}
      </div>
    </div>
  );
}
