"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

// ─── Sig-fig logic ───────────────────────────────────────────────────────────

interface DigitInfo {
  char: string;
  significant: boolean;
  reason: string;
}

interface CountResult {
  count: number;
  digits: DigitInfo[];
  scientificNotation: string;
  ambiguousTrailingZeros: boolean;
  error?: string;
}

/**
 * Parse an input string (which may already be in scientific notation) and
 * return a canonical coefficient string + exponent so we can work on the
 * raw digit sequence.
 *
 * Returns null when the input cannot be interpreted as a finite number.
 */
function parseInput(raw: string): { coefficient: string; exponent: number } | null {
  const trimmed = raw.trim();
  if (trimmed === "" || trimmed === "-" || trimmed === "+") return null;

  // Accept scientific notation: 1.23e4, 1.23E-4, 1.23×10^4, 1.23*10^4
  const sciRegex = /^([+-]?\d+\.?\d*)(?:[eE×x*]\s*(?:10\^)?\s*([+-]?\d+))?$/;
  const match = trimmed.replace(/\s/g, "").match(sciRegex);
  if (!match) return null;

  const coeffStr: string = match[1] ?? "";
  const expStr: string | undefined = match[2];

  const exp = expStr !== undefined ? parseInt(expStr, 10) : 0;
  if (!isFinite(exp)) return null;

  // Validate coefficient
  const coefNum = parseFloat(coeffStr);
  if (!isFinite(coefNum)) return null;

  return { coefficient: coeffStr, exponent: exp };
}

/**
 * Count significant figures from the raw coefficient string.
 * Rules applied:
 *  1. Non-zero digits are always significant.
 *  2. Zeros between non-zero digits are significant (captive zeros).
 *  3. Leading zeros (before the first non-zero digit) are NOT significant.
 *  4. Trailing zeros AFTER a decimal point ARE significant.
 *  5. Trailing zeros in an integer (no decimal point) are ambiguous.
 */
function countSigFigs(raw: string): CountResult {
  const parsed = parseInput(raw);
  if (!parsed) {
    return {
      count: 0,
      digits: [],
      scientificNotation: "",
      ambiguousTrailingZeros: false,
      error: "invalid",
    };
  }

  const { coefficient, exponent } = parsed;

  // Strip sign for analysis
  const isNegative = coefficient.startsWith("-");
  const absCoeff = isNegative ? coefficient.slice(1) : coefficient;

  const hasDecimalPoint = absCoeff.includes(".");
  const parts = absCoeff.split(".");
  const intPart: string = parts[0] ?? "";
  const fracPart: string | undefined = parts[1];

  // Build ordered list of digit characters from intPart + fracPart
  // We annotate each character separately
  const allDigits: DigitInfo[] = [];

  // --- Integer part ---
  let foundFirstNonZero = false;
  for (let i = 0; i < intPart.length; i++) {
    const ch: string = intPart[i] ?? "";
    if (ch === "0") {
      if (!foundFirstNonZero) {
        allDigits.push({ char: ch, significant: false, reason: "leading" });
      } else {
        // Could be captive or trailing-in-integer
        allDigits.push({ char: ch, significant: false, reason: "trailing-int-candidate" });
      }
    } else {
      foundFirstNonZero = true;
      allDigits.push({ char: ch, significant: true, reason: "nonzero" });
    }
  }

  // --- Fractional part ---
  if (fracPart !== undefined) {
    for (let i = 0; i < fracPart.length; i++) {
      const ch: string = fracPart[i] ?? "";
      if (ch === "0") {
        if (!foundFirstNonZero) {
          allDigits.push({ char: ch, significant: false, reason: "leading" });
        } else {
          allDigits.push({ char: ch, significant: true, reason: "trailing-decimal" });
        }
      } else {
        foundFirstNonZero = true;
        allDigits.push({ char: ch, significant: true, reason: "nonzero" });
      }
    }
  }

  // Resolve "trailing-int-candidate": any zero in the integer part that came
  // after the first non-zero digit. Whether they are significant depends on
  // whether there is a decimal point in the original input.
  // Rule: trailing zeros in integer WITHOUT decimal point → ambiguous.
  // Rule: trailing zeros in integer WITH decimal point → significant (captive or trailing).
  let ambiguousTrailingZeros = false;

  // First pass: mark captive zeros (zeros between two non-zero digits) as significant.
  // We need to know the index of the last non-zero digit among all digits.
  const lastNonZeroIdx = (() => {
    for (let i = allDigits.length - 1; i >= 0; i--) {
      if (allDigits[i]?.reason === "nonzero") return i;
    }
    return -1;
  })();

  for (let i = 0; i < allDigits.length; i++) {
    const d: DigitInfo | undefined = allDigits[i];
    if (d === undefined) continue;
    if (d.reason === "trailing-int-candidate") {
      if (i < lastNonZeroIdx) {
        // There is a non-zero digit after this zero → captive
        d.significant = true;
        d.reason = "captive";
      } else {
        // Trailing zero in integer part
        if (hasDecimalPoint) {
          // e.g. "100." — decimal point present, trailing zeros are significant
          d.significant = true;
          d.reason = "trailing-decimal-int";
        } else {
          // Ambiguous — mark but don't count
          d.significant = false;
          d.reason = "ambiguous";
          ambiguousTrailingZeros = true;
        }
      }
    }
  }

  const significantDigits = allDigits.filter((d) => d.significant);
  const count = significantDigits.length;

  // Build scientific notation
  const numericValue = parseFloat(coefficient) * Math.pow(10, exponent);
  let scientificNotation = "";
  if (isFinite(numericValue) && numericValue !== 0) {
    // We want to preserve the sig-fig count in the notation
    const sci = numericValue.toExponential(Math.max(0, count - 1));
    scientificNotation = sci;
  } else if (numericValue === 0) {
    scientificNotation = "0";
  }

  return { count, digits: allDigits, scientificNotation, ambiguousTrailingZeros };
}

interface RoundResult {
  rounded: number;
  roundedStr: string;
  scientificNotation: string;
  error?: string;
}

function roundToSigFigs(raw: string, sigFigs: number): RoundResult {
  const parsed = parseInput(raw);
  if (!parsed) return { rounded: 0, roundedStr: "", scientificNotation: "", error: "invalid" };

  const numericValue = parseFloat(parsed.coefficient) * Math.pow(10, parsed.exponent);
  if (!isFinite(numericValue)) {
    return { rounded: 0, roundedStr: "", scientificNotation: "", error: "invalid" };
  }
  if (numericValue === 0) {
    return { rounded: 0, roundedStr: "0", scientificNotation: "0", error: undefined };
  }

  const magnitude = Math.floor(Math.log10(Math.abs(numericValue)));
  const factor = Math.pow(10, magnitude - (sigFigs - 1));
  const rounded = Math.round(numericValue / factor) * factor;

  const sci = rounded.toExponential(Math.max(0, sigFigs - 1));

  // Choose a readable decimal representation when the exponent is reasonable
  let roundedStr: string;
  if (magnitude >= -4 && magnitude < 12) {
    // Use toPrecision for "normal" sized numbers; avoid scientific notation in display
    roundedStr = parseFloat(rounded.toPrecision(sigFigs)).toString();
    // toPrecision may return sci notation for very small numbers; fall back
    if (roundedStr.includes("e") || roundedStr.includes("E")) {
      roundedStr = sci;
    }
  } else {
    roundedStr = sci;
  }

  return { rounded, roundedStr, scientificNotation: sci };
}

// ─── Component ───────────────────────────────────────────────────────────────

type TabId = "count" | "round";

export default function SignificantFiguresCalculator() {
  const t = useTranslations("tools.significant-figures-calculator");
  const locale = useLocale();
  void locale; // used implicitly via next-intl formatting

  const [activeTab, setActiveTab] = useState<TabId>("count");

  // Tab 1: Count
  const [countInput, setCountInput] = useState("");

  // Tab 2: Round
  const [roundInput, setRoundInput] = useState("");
  const [sigFigsTarget, setSigFigsTarget] = useState("3");

  // ── Results ──
  const countResult = useMemo<CountResult | null>(() => {
    if (countInput.trim() === "") return null;
    return countSigFigs(countInput);
  }, [countInput]);

  const roundResult = useMemo<RoundResult | null>(() => {
    if (roundInput.trim() === "") return null;
    const n = parseInt(sigFigsTarget, 10);
    if (!isFinite(n) || n < 1 || n > 15) return null;
    return roundToSigFigs(roundInput, n);
  }, [roundInput, sigFigsTarget]);

  // Colour-coded digit display
  const digitDisplay = useMemo(() => {
    if (!countResult || countResult.error || countResult.digits.length === 0) return null;
    return countResult.digits;
  }, [countResult]);

  const tabBase =
    "px-4 py-2 text-sm font-medium rounded-t border-b-2 transition-colors focus:outline-none";
  const tabActive =
    "border-brand-500 text-brand-700 dark:border-brand-400 dark:text-brand-300 bg-white dark:bg-slate-900";
  const tabInactive =
    "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 bg-slate-50 dark:bg-slate-800/50";

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200 dark:border-slate-700 mb-6">
        <button
          onClick={() => setActiveTab("count")}
          className={`${tabBase} ${activeTab === "count" ? tabActive : tabInactive}`}
        >
          {t("tab.count")}
        </button>
        <button
          onClick={() => setActiveTab("round")}
          className={`${tabBase} ${activeTab === "round" ? tabActive : tabInactive}`}
        >
          {t("tab.round")}
        </button>
      </div>

      {/* ── Tab 1: Count Sig Figs ── */}
      {activeTab === "count" && (
        <div>
          <label className="block">
            <span className="text-sm font-medium">{t("input.number")}</span>
            <input
              type="text"
              inputMode="decimal"
              value={countInput}
              onChange={(e) => setCountInput(e.target.value)}
              placeholder={t("input.numberPlaceholder")}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-mono dark:border-slate-700 dark:bg-slate-900"
            />
            <span className="text-xs text-slate-500">{t("input.numberHint")}</span>
          </label>

          <div aria-live="polite" className="mt-6 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
            {!countResult ? (
              <p className="text-center text-slate-400">{t("empty")}</p>
            ) : countResult.error === "invalid" ? (
              <p className="text-center text-red-500">{t("error.invalid")}</p>
            ) : (
              <dl className="grid gap-4 text-sm">
                {/* Primary result */}
                <div className="rounded-lg bg-brand-50 p-4 dark:bg-brand-900/20">
                  <dt className="font-medium text-brand-800 dark:text-brand-200">
                    {t("result.sigFigCount")}
                  </dt>
                  <dd className="mt-1 text-4xl font-bold tabular-nums text-brand-700 dark:text-brand-300">
                    {countResult.count}
                  </dd>
                </div>

                {/* Digit-by-digit visual */}
                {digitDisplay && (
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                      {t("result.explanation")}
                    </p>
                    <div className="flex flex-wrap gap-1 font-mono text-lg">
                      {digitDisplay.map((d, i) => (
                        <span
                          key={i}
                          title={d.reason}
                          className={
                            d.char === "."
                              ? "text-slate-400"
                              : d.significant
                              ? "inline-flex items-center justify-center w-8 h-8 rounded bg-emerald-100 text-emerald-800 font-bold dark:bg-emerald-900/40 dark:text-emerald-300"
                              : d.reason === "ambiguous"
                              ? "inline-flex items-center justify-center w-8 h-8 rounded bg-yellow-100 text-yellow-800 font-bold dark:bg-yellow-900/40 dark:text-yellow-300"
                              : "inline-flex items-center justify-center w-8 h-8 rounded bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                          }
                        >
                          {d.char}
                        </span>
                      ))}
                    </div>
                    {/* Legend */}
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-600 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded bg-emerald-100 dark:bg-emerald-900/40 inline-block" />
                        {t("result.legendSignificant")}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded bg-slate-100 dark:bg-slate-800 inline-block" />
                        {t("result.legendNotSignificant")}
                      </span>
                      {countResult.ambiguousTrailingZeros && (
                        <span className="flex items-center gap-1">
                          <span className="w-3 h-3 rounded bg-yellow-100 dark:bg-yellow-900/40 inline-block" />
                          {t("result.legendAmbiguous")}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Secondary info */}
                <div className="grid gap-2 sm:grid-cols-2">
                  {countResult.scientificNotation && (
                    <div className="rounded border border-slate-200 px-3 py-2 dark:border-slate-700">
                      <dt className="text-xs text-slate-500">{t("result.scientificNotation")}</dt>
                      <dd className="mt-0.5 font-mono font-semibold">{countResult.scientificNotation}</dd>
                    </div>
                  )}
                  {countResult.ambiguousTrailingZeros && (
                    <div className="rounded border border-yellow-200 bg-yellow-50 px-3 py-2 dark:border-yellow-800 dark:bg-yellow-900/20">
                      <dt className="text-xs text-yellow-700 dark:text-yellow-400 font-medium">
                        {t("result.ambiguousNote")}
                      </dt>
                      <dd className="mt-0.5 text-xs text-yellow-600 dark:text-yellow-300">
                        {t("result.ambiguousNoteDetail")}
                      </dd>
                    </div>
                  )}
                </div>
              </dl>
            )}
          </div>
        </div>
      )}

      {/* ── Tab 2: Round to N Sig Figs ── */}
      {activeTab === "round" && (
        <div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium">{t("input.numberToRound")}</span>
              <input
                type="text"
                inputMode="decimal"
                value={roundInput}
                onChange={(e) => setRoundInput(e.target.value)}
                placeholder={t("input.numberToRoundPlaceholder")}
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-mono dark:border-slate-700 dark:bg-slate-900"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium">{t("input.sigFigsTarget")}</span>
              <input
                type="number"
                min={1}
                max={15}
                value={sigFigsTarget}
                onChange={(e) => setSigFigsTarget(e.target.value)}
                placeholder="3"
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2 tabular-nums dark:border-slate-700 dark:bg-slate-900"
              />
              <span className="text-xs text-slate-500">{t("input.sigFigsTargetHint")}</span>
            </label>
          </div>

          <div aria-live="polite" className="mt-6 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
            {!roundResult ? (
              <p className="text-center text-slate-400">{t("empty")}</p>
            ) : roundResult.error === "invalid" ? (
              <p className="text-center text-red-500">{t("error.invalid")}</p>
            ) : (
              <dl className="grid gap-4 text-sm">
                <div className="rounded-lg bg-brand-50 p-4 dark:bg-brand-900/20">
                  <dt className="font-medium text-brand-800 dark:text-brand-200">
                    {t("result.rounded")}
                  </dt>
                  <dd className="mt-1 text-3xl font-bold font-mono tabular-nums text-brand-700 dark:text-brand-300">
                    {roundResult.roundedStr}
                  </dd>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="rounded border border-slate-200 px-3 py-2 dark:border-slate-700">
                    <dt className="text-xs text-slate-500">{t("result.scientificNotation")}</dt>
                    <dd className="mt-0.5 font-mono font-semibold">{roundResult.scientificNotation}</dd>
                  </div>
                  <div className="rounded border border-slate-200 px-3 py-2 dark:border-slate-700">
                    <dt className="text-xs text-slate-500">{t("result.sigFigsUsed")}</dt>
                    <dd className="mt-0.5 font-semibold tabular-nums">{sigFigsTarget}</dd>
                  </div>
                </div>

                <div className="rounded bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-800/50 dark:text-slate-400">
                  <p>{t("result.roundExplanation", { input: roundInput, sigFigs: sigFigsTarget, result: roundResult.roundedStr })}</p>
                </div>
              </dl>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
