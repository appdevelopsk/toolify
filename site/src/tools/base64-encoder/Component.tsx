"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

type Mode = "encode" | "decode";

function encode(text: string, urlSafe: boolean): string {
  try {
    const bytes = new TextEncoder().encode(text);
    let binary = "";
    for (const b of bytes) binary += String.fromCharCode(b);
    let out = btoa(binary);
    if (urlSafe) out = out.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    return out;
  } catch {
    return "";
  }
}
function decode(text: string, urlSafe: boolean): string | null {
  try {
    let s = text.trim();
    if (urlSafe) {
      s = s.replace(/-/g, "+").replace(/_/g, "/");
      while (s.length % 4 !== 0) s += "=";
    }
    const binary = atob(s);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
}

export default function Base64Encoder() {
  const t = useTranslations("tools.base64-encoder");
  const [mode, setMode] = useState<Mode>("encode");
  const [text, setText] = useState("");
  const [urlSafe, setUrlSafe] = useState(false);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    if (!text) return "";
    return mode === "encode" ? encode(text, urlSafe) : decode(text, urlSafe) ?? "";
  }, [mode, text, urlSafe]);
  const error = mode === "decode" && text && decode(text, urlSafe) === null;

  async function copy() {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-md border border-slate-300 dark:border-slate-700">
          <button onClick={() => setMode("encode")} className={`px-3 py-1.5 text-sm ${mode === "encode" ? "bg-brand-600 text-white" : ""}`}>
            {t("mode.encode")}
          </button>
          <button onClick={() => setMode("decode")} className={`px-3 py-1.5 text-sm ${mode === "decode" ? "bg-brand-600 text-white" : ""}`}>
            {t("mode.decode")}
          </button>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={urlSafe} onChange={(e) => setUrlSafe(e.target.checked)} />
          {t("urlSafe")}
        </label>
      </div>

      <label className="block">
        <span className="text-sm font-medium">{mode === "encode" ? t("input.plain") : t("input.encoded")}</span>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={6} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-mono text-sm dark:border-slate-700 dark:bg-slate-900" />
      </label>

      <div aria-live="polite" className="mt-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{mode === "encode" ? t("output.encoded") : t("output.plain")}</span>
          {result && (
            <button onClick={copy} className="text-xs hover:underline">
              {copied ? t("copied") : t("copy")}
            </button>
          )}
        </div>
        <pre className={`mt-1 min-h-[80px] overflow-x-auto rounded border px-3 py-2 font-mono text-sm ${error ? "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/20" : "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950"}`}>
          {error ? t("invalidInput") : result || " "}
        </pre>
      </div>
    </div>
  );
}
