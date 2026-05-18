"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

type Mode = "encode" | "decode";
type Separator = "space" | "none" | "newline";

function textToBinary(text: string, sep: Separator): string {
  const bins = Array.from(text).map((ch) =>
    ch.charCodeAt(0).toString(2).padStart(8, "0")
  );
  if (sep === "space") return bins.join(" ");
  if (sep === "newline") return bins.join("\n");
  return bins.join("");
}

function binaryToText(binary: string): { result: string; error: string | null } {
  const cleaned = binary.trim().replace(/\s+/g, " ").replace(/[^01 ]/g, "");
  const groups = cleaned.includes(" ")
    ? cleaned.split(" ").filter(Boolean)
    : cleaned.match(/.{1,8}/g) ?? [];

  if (groups.length === 0) return { result: "", error: null };

  const chars: string[] = [];
  for (const g of groups) {
    if (g.length !== 8 || !/^[01]+$/.test(g)) {
      return { result: "", error: `Invalid byte: "${g}" — each byte must be exactly 8 binary digits` };
    }
    chars.push(String.fromCharCode(parseInt(g, 2)));
  }
  return { result: chars.join(""), error: null };
}

export default function TextToBinary() {
  const t = useTranslations("tools.text-to-binary");
  const [mode, setMode] = useState<Mode>("encode");
  const [input, setInput] = useState("");
  const [separator, setSeparator] = useState<Separator>("space");

  const output = useMemo(() => {
    if (!input.trim()) return { result: "", error: null };
    if (mode === "encode") {
      return { result: textToBinary(input, separator), error: null };
    } else {
      return binaryToText(input);
    }
  }, [input, mode, separator]);

  const handleCopy = () => {
    if (output.result) navigator.clipboard.writeText(output.result).catch(() => {});
  };

  const handleSwap = () => {
    if (output.result) {
      setInput(output.result);
      setMode((m) => (m === "encode" ? "decode" : "encode"));
    }
  };

  const inputClass =
    "w-full rounded border border-slate-300 px-3 py-2 font-mono text-sm dark:border-slate-700 dark:bg-slate-900";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex rounded border border-slate-300 overflow-hidden dark:border-slate-700">
          {(["encode", "decode"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setInput(""); }}
              className={
                "px-4 py-2 text-sm font-medium " +
                (mode === m
                  ? "bg-brand-600 text-white"
                  : "bg-white text-slate-700 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800")
              }
            >
              {t(`mode.${m}`)}
            </button>
          ))}
        </div>

        {mode === "encode" && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-600 dark:text-slate-400">{t("separator.label")}:</span>
            {(["space", "newline", "none"] as Separator[]).map((s) => (
              <label key={s} className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="sep"
                  checked={separator === s}
                  onChange={() => setSeparator(s)}
                  className="accent-brand-600"
                />
                <span className="text-slate-700 dark:text-slate-300">{t(`separator.${s}`)}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            {mode === "encode" ? t("label.inputText") : t("label.inputBinary")}
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={8}
            placeholder={mode === "encode" ? t("placeholder.text") : t("placeholder.binary")}
            className={inputClass}
          />
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {mode === "encode" ? t("label.outputBinary") : t("label.outputText")}
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleSwap}
                disabled={!output.result}
                className="text-xs text-brand-600 hover:text-brand-700 disabled:opacity-40 dark:text-brand-400"
              >
                ⇄ {t("action.swap")}
              </button>
              <button
                onClick={handleCopy}
                disabled={!output.result}
                className="text-xs text-brand-600 hover:text-brand-700 disabled:opacity-40 dark:text-brand-400"
              >
                {t("action.copy")}
              </button>
            </div>
          </div>
          {output.error ? (
            <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
              {output.error}
            </p>
          ) : (
            <textarea
              readOnly
              value={output.result}
              rows={8}
              className={inputClass + " bg-slate-50 dark:bg-slate-800/50"}
            />
          )}
        </div>
      </div>

      {output.result && !output.error && (
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {mode === "encode"
            ? t("stat.encoded", { chars: Array.from(input).length, bytes: output.result.replace(/\s/g, "").length / 8 })
            : t("stat.decoded", { chars: output.result.length })}
        </p>
      )}
    </div>
  );
}
