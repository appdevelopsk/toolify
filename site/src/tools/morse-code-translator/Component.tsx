"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

const MORSE: Record<string, string> = {
  A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.", G: "--.",
  H: "....", I: "..", J: ".---", K: "-.-", L: ".-..", M: "--", N: "-.",
  O: "---", P: ".--.", Q: "--.-", R: ".-.", S: "...", T: "-", U: "..-",
  V: "...-", W: ".--", X: "-..-", Y: "-.--", Z: "--..",
  "0": "-----", "1": ".----", "2": "..---", "3": "...--", "4": "....-",
  "5": ".....", "6": "-....", "7": "--...", "8": "---..", "9": "----.",
  ".": ".-.-.-", ",": "--..--", "?": "..--..", "'": ".----.", "!": "-.-.--",
  "/": "-..-.", "(": "-.--.", ")": "-.--.-", "&": ".-...", ":": "---...",
  ";": "-.-.-.", "=": "-...-", "+": ".-.-.", "-": "-....-", "_": "..--.-",
  '"': ".-..-.", "$": "...-..-", "@": ".--.-.", " ": "/",
};

const REVERSE_MORSE: Record<string, string> = Object.fromEntries(
  Object.entries(MORSE).map(([k, v]) => [v, k])
);

function textToMorse(text: string): string {
  return text
    .toUpperCase()
    .split("")
    .map((ch) => MORSE[ch] ?? "?")
    .join(" ");
}

function morseToText(morse: string): string {
  return morse
    .trim()
    .split("   ")
    .map((word) =>
      word
        .split(" ")
        .map((code) => (code === "/" ? " " : (REVERSE_MORSE[code] ?? "?")))
        .join("")
    )
    .join(" ");
}

type Mode = "encode" | "decode";

export default function MorseCodeTranslator() {
  const t = useTranslations("tools.morse-code-translator");
  const [mode, setMode] = useState<Mode>("encode");
  const [input, setInput] = useState("");

  const output = useMemo(() => {
    if (!input.trim()) return "";
    return mode === "encode" ? textToMorse(input) : morseToText(input);
  }, [input, mode]);

  const placeholder = mode === "encode" ? t("placeholder.text") : t("placeholder.morse");

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(["encode", "decode"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); setInput(""); }}
            className={
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors " +
              (mode === m
                ? "bg-brand-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700")
            }
          >
            {t(`mode.${m}`)}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            {mode === "encode" ? t("label.text") : t("label.morse")}
          </span>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            rows={6}
            className="w-full rounded border border-slate-300 px-3 py-2 font-mono text-sm dark:border-slate-700 dark:bg-slate-900"
          />
        </label>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {mode === "encode" ? t("label.morse") : t("label.text")}
            </span>
            {output && (
              <button
                onClick={() => navigator.clipboard.writeText(output)}
                className="text-xs text-brand-600 hover:underline dark:text-brand-400"
              >
                {t("action.copy")}
              </button>
            )}
          </div>
          <div
            aria-live="polite"
            className="min-h-[144px] w-full rounded border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm break-all dark:border-slate-800 dark:bg-slate-900"
          >
            {output || (
              <span className="text-slate-400 dark:text-slate-600">{t("output.empty")}</span>
            )}
          </div>
        </div>
      </div>

      {mode === "decode" && (
        <p className="text-xs text-slate-600 dark:text-slate-400">
          {t("hint.decode")}
        </p>
      )}
    </div>
  );
}
