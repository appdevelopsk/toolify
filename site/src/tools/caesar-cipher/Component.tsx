"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

function shiftChar(c: string, shift: number): string {
  const code = c.charCodeAt(0);
  if (code >= 65 && code <= 90) {
    return String.fromCharCode(((code - 65 + shift) % 26 + 26) % 26 + 65);
  }
  if (code >= 97 && code <= 122) {
    return String.fromCharCode(((code - 97 + shift) % 26 + 26) % 26 + 97);
  }
  return c;
}

function applyShift(text: string, shift: number): string {
  let out = "";
  for (const ch of text) out += shiftChar(ch, shift);
  return out;
}

export default function CaesarCipher() {
  const t = useTranslations("tools.caesar-cipher");
  const [text, setText] = useState("Hello, World!");
  const [shift, setShift] = useState(3);
  const [mode, setMode] = useState<"encode" | "decode">("encode");

  const result = useMemo(() => {
    const effective = mode === "encode" ? shift : -shift;
    return applyShift(text, effective);
  }, [text, shift, mode]);

  async function copy() {
    await navigator.clipboard.writeText(result);
  }

  return (
    <div>
      <div className="mb-4 inline-flex rounded-lg border border-slate-300 p-1 dark:border-slate-700">
        <button
          onClick={() => setMode("encode")}
          className={`rounded px-3 py-1 text-sm ${mode === "encode" ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900" : ""}`}
        >
          {t("mode.encode")}
        </button>
        <button
          onClick={() => setMode("decode")}
          className={`rounded px-3 py-1 text-sm ${mode === "decode" ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900" : ""}`}
        >
          {t("mode.decode")}
        </button>
      </div>

      <label className="block">
        <span className="text-sm font-medium">{t("input.text")}</span>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-mono dark:border-slate-700 dark:bg-slate-900"
        />
      </label>

      <label className="mt-4 block">
        <span className="text-sm font-medium">{t("input.shift")} ({shift})</span>
        <input
          type="range"
          min={-25}
          max={25}
          value={shift}
          onChange={(e) => setShift(parseInt(e.target.value, 10))}
          className="mt-1 w-full"
        />
      </label>

      <div className="mt-2 flex flex-wrap gap-2">
        {[3, 13, -3, -13].map((s) => (
          <button
            key={s}
            onClick={() => setShift(s)}
            className="rounded border border-slate-300 px-3 py-1 text-xs hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            {s === 13 || s === -13 ? "ROT13" : `${s > 0 ? "+" : ""}${s}`}
          </button>
        ))}
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{t("output")}</span>
          <button
            onClick={copy}
            className="rounded border border-slate-300 px-3 py-1 text-xs hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            {t("copy")}
          </button>
        </div>
        <pre className="mt-1 overflow-auto whitespace-pre-wrap break-words rounded border border-slate-200 bg-slate-50 p-3 font-mono text-sm dark:border-slate-800 dark:bg-slate-900/50">{result}</pre>
      </div>
    </div>
  );
}
