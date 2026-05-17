"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

const TO_ROMAN: [number, string][] = [
  [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
  [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
  [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
];

function toRoman(n: number): string | null {
  if (!Number.isInteger(n) || n < 1 || n > 3999) return null;
  let out = "";
  let v = n;
  for (const [val, sym] of TO_ROMAN) {
    while (v >= val) {
      out += sym;
      v -= val;
    }
  }
  return out;
}

function fromRoman(s: string): number | null {
  const cleaned = s.trim().toUpperCase();
  if (!/^[MDCLXVI]+$/.test(cleaned)) return null;
  // Validate canonical form by re-encoding
  const map: Record<string, number> = { M: 1000, D: 500, C: 100, L: 50, X: 10, V: 5, I: 1 };
  let total = 0;
  for (let i = 0; i < cleaned.length; i++) {
    const cur = map[cleaned[i]!]!;
    const next = i + 1 < cleaned.length ? map[cleaned[i + 1]!]! : 0;
    if (cur < next) total -= cur;
    else total += cur;
  }
  if (total < 1 || total > 3999) return null;
  if (toRoman(total) !== cleaned) return null;
  return total;
}

type Mode = "toRoman" | "fromRoman";

export default function RomanNumeralConverter() {
  const t = useTranslations("tools.roman-numeral-converter");
  const [mode, setMode] = useState<Mode>("toRoman");
  const [input, setInput] = useState("");

  const result = useMemo(() => {
    if (!input.trim()) return { ok: true as const, out: "" };
    if (mode === "toRoman") {
      const n = parseInt(input, 10);
      if (!isFinite(n)) return { ok: false as const, error: t("error.invalidNumber") };
      const r = toRoman(n);
      if (r === null) return { ok: false as const, error: t("error.outOfRange") };
      return { ok: true as const, out: r };
    } else {
      const n = fromRoman(input);
      if (n === null) return { ok: false as const, error: t("error.invalidRoman") };
      return { ok: true as const, out: String(n) };
    }
  }, [mode, input, t]);

  return (
    <div>
      <div className="mb-3 inline-flex rounded-md border border-slate-300 dark:border-slate-700">
        <button onClick={() => setMode("toRoman")} className={`px-3 py-1.5 text-sm ${mode === "toRoman" ? "bg-brand-600 text-white" : ""}`}>
          {t("mode.toRoman")}
        </button>
        <button onClick={() => setMode("fromRoman")} className={`px-3 py-1.5 text-sm ${mode === "fromRoman" ? "bg-brand-600 text-white" : ""}`}>
          {t("mode.fromRoman")}
        </button>
      </div>

      <label className="block">
        <span className="text-sm font-medium">{mode === "toRoman" ? t("input.number") : t("input.roman")}</span>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode === "toRoman" ? "2026" : "MMXXVI"}
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-mono text-lg dark:border-slate-700 dark:bg-slate-900"
        />
      </label>

      <div aria-live="polite" className={`mt-4 rounded-lg border p-4 ${result.ok ? "border-brand-200 bg-brand-50 dark:border-brand-900 dark:bg-brand-900/20" : "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/20"}`}>
        {result.ok ? (
          <>
            <div className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">{mode === "toRoman" ? t("result.roman") : t("result.number")}</div>
            <div className="mt-1 font-mono text-4xl font-bold tabular-nums">{result.out || "—"}</div>
          </>
        ) : (
          <div className="text-sm text-red-700 dark:text-red-300">{result.error}</div>
        )}
      </div>
    </div>
  );
}
