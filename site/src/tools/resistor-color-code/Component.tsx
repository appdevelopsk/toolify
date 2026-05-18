"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

// ── Color definitions ──────────────────────────────────────────────────────

type ColorName =
  | "black" | "brown" | "red" | "orange" | "yellow"
  | "green" | "blue" | "violet" | "gray" | "white"
  | "gold" | "silver" | "none";

interface ColorDef {
  name: ColorName;
  hex: string;
  textClass: string;
  digit: number | null;
  multiplier: number | null;
  tolerance: string | null;
}

const COLORS: ColorDef[] = [
  { name: "black",  hex: "#222222", textClass: "text-white",  digit: 0, multiplier: 1,        tolerance: null     },
  { name: "brown",  hex: "#7B3F00", textClass: "text-white",  digit: 1, multiplier: 10,       tolerance: "±1%"    },
  { name: "red",    hex: "#C0392B", textClass: "text-white",  digit: 2, multiplier: 100,      tolerance: "±2%"    },
  { name: "orange", hex: "#E67E22", textClass: "text-white",  digit: 3, multiplier: 1000,     tolerance: "±3%"    },
  { name: "yellow", hex: "#F1C40F", textClass: "text-black",  digit: 4, multiplier: 10000,    tolerance: "±4%"    },
  { name: "green",  hex: "#27AE60", textClass: "text-white",  digit: 5, multiplier: 100000,   tolerance: "±0.5%"  },
  { name: "blue",   hex: "#2980B9", textClass: "text-white",  digit: 6, multiplier: 1000000,  tolerance: "±0.25%" },
  { name: "violet", hex: "#8E44AD", textClass: "text-white",  digit: 7, multiplier: 10000000, tolerance: "±0.1%"  },
  { name: "gray",   hex: "#7F8C8D", textClass: "text-white",  digit: 8, multiplier: 100000000,tolerance: "±0.05%" },
  { name: "white",  hex: "#ECF0F1", textClass: "text-black",  digit: 9, multiplier: 1000000000,tolerance: null    },
  { name: "gold",   hex: "#CFB53B", textClass: "text-black",  digit: null, multiplier: 0.1,   tolerance: "±5%"    },
  { name: "silver", hex: "#BDC3C7", textClass: "text-black",  digit: null, multiplier: 0.01,  tolerance: "±10%"   },
  { name: "none",   hex: "transparent", textClass: "text-slate-600", digit: null, multiplier: null, tolerance: "±20%" },
];

const COLOR_MAP = new Map<ColorName, ColorDef>(COLORS.map((c) => [c.name, c]));

const DIGIT_COLORS = COLORS.filter((c) => c.digit !== null);
const MULTIPLIER_COLORS = COLORS.filter((c) => c.multiplier !== null && c.name !== "none");
const TOLERANCE_COLORS = COLORS.filter((c) => c.tolerance !== null);

// E24 preferred values (mantissa 1.0–9.1)
const E24_MANTISSA = [
  1.0, 1.1, 1.2, 1.3, 1.5, 1.6, 1.8, 2.0, 2.2, 2.4, 2.7, 3.0,
  3.3, 3.6, 3.9, 4.3, 4.7, 5.1, 5.6, 6.2, 6.8, 7.5, 8.2, 9.1,
];

function formatResistance(ohms: number): string {
  if (ohms >= 1_000_000) return `${+(ohms / 1_000_000).toPrecision(3)} MΩ`;
  if (ohms >= 1_000)     return `${+(ohms / 1_000).toPrecision(3)} kΩ`;
  return `${+ohms.toPrecision(3)} Ω`;
}

function nearestE24(ohms: number): number | null {
  if (ohms <= 0) return null;
  const exp = Math.floor(Math.log10(ohms));
  const mantissa = ohms / Math.pow(10, exp);
  let bestDiff = Infinity;
  let best = 0;
  for (const m of E24_MANTISSA) {
    const diff = Math.abs(m - mantissa);
    if (diff < bestDiff) { bestDiff = diff; best = m; }
  }
  return +(best * Math.pow(10, exp)).toPrecision(3);
}

function ohmsToFourBand(ohms: number): [ColorName, ColorName, ColorName, ColorName] | null {
  const std = nearestE24(ohms);
  if (std === null) return null;
  // Find multiplier exponent
  for (let exp = -2; exp <= 9; exp++) {
    const mult = Math.pow(10, exp);
    const digits = std / mult;
    const d1 = Math.round(digits / 10);
    const d2 = Math.round(digits % 10);
    if (d1 >= 1 && d1 <= 9 && d2 >= 0 && d2 <= 9 && Math.abs(d1 * 10 + d2 - digits) < 0.01) {
      const multColor = MULTIPLIER_COLORS.find((c) => c.multiplier === mult);
      const c1 = DIGIT_COLORS.find((c) => c.digit === d1);
      const c2 = DIGIT_COLORS.find((c) => c.digit === d2);
      if (multColor && c1 && c2) {
        return [c1.name, c2.name, multColor.name, "gold"];
      }
    }
  }
  return null;
}

function ohmsToFiveBand(ohms: number): [ColorName, ColorName, ColorName, ColorName, ColorName] | null {
  const std = nearestE24(ohms);
  if (std === null) return null;
  for (let exp = -2; exp <= 8; exp++) {
    const mult = Math.pow(10, exp);
    const digits = std / mult;
    const d1 = Math.round(digits / 100);
    const d2 = Math.round((digits % 100) / 10);
    const d3 = Math.round(digits % 10);
    if (d1 >= 1 && d1 <= 9 && d2 >= 0 && d2 <= 9 && d3 >= 0 && d3 <= 9
        && Math.abs(d1 * 100 + d2 * 10 + d3 - digits) < 0.1) {
      const multColor = MULTIPLIER_COLORS.find((c) => c.multiplier === mult);
      const c1 = DIGIT_COLORS.find((c) => c.digit === d1);
      const c2 = DIGIT_COLORS.find((c) => c.digit === d2);
      const c3 = DIGIT_COLORS.find((c) => c.digit === d3);
      if (multColor && c1 && c2 && c3) {
        return [c1.name, c2.name, c3.name, multColor.name, "brown"];
      }
    }
  }
  return null;
}

// ── Sub-components ─────────────────────────────────────────────────────────

function ColorBand({ color, width = "w-10" }: { color: ColorName; width?: string }) {
  const def = COLOR_MAP.get(color)!;
  return (
    <div
      className={`${width} h-16 rounded-sm border border-black/20`}
      style={{ backgroundColor: def.hex }}
      title={color}
    />
  );
}

function ResistorVisual({ bands }: { bands: ColorName[] }) {
  return (
    <div className="flex items-center gap-0 my-4">
      {/* left lead */}
      <div className="h-1 w-8 bg-slate-400 dark:bg-slate-500" />
      {/* body */}
      <div className="flex items-center gap-1.5 rounded-full bg-amber-100 dark:bg-amber-900/50 border border-amber-300 dark:border-amber-700 px-3 py-3">
        {bands.map((b, i) => (
          <ColorBand key={i} color={b} />
        ))}
      </div>
      {/* right lead */}
      <div className="h-1 w-8 bg-slate-400 dark:bg-slate-500" />
    </div>
  );
}

function ColorSelect({
  label,
  value,
  options,
  onChange,
  t,
}: {
  label: string;
  value: ColorName;
  options: ColorDef[];
  onChange: (v: ColorName) => void;
  t: ReturnType<typeof useTranslations>;
}) {
  const def = COLOR_MAP.get(value)!;
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-slate-600 dark:text-slate-400">{label}</label>
      <div className="relative flex items-center">
        <span
          className="absolute left-2 h-4 w-4 rounded-sm border border-black/20 shrink-0"
          style={{ backgroundColor: def.hex }}
        />
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as ColorName)}
          className="w-full rounded border border-slate-300 pl-8 pr-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900"
        >
          {options.map((c) => (
            <option key={c.name} value={c.name}>
              {t(`colors.${c.name}`)}
              {c.digit !== null ? ` (${c.digit})` : ""}
              {c.multiplier !== null && c.digit === null
                ? ` (×${c.multiplier < 1 ? c.multiplier : c.multiplier >= 1e9 ? "1G" : c.multiplier >= 1e8 ? "100M" : c.multiplier >= 1e7 ? "10M" : c.multiplier >= 1e6 ? "1M" : c.multiplier >= 1e5 ? "100K" : c.multiplier >= 1e4 ? "10K" : c.multiplier >= 1e3 ? "1K" : c.multiplier})`
                : ""}
              {c.tolerance !== null && c.digit === null && c.multiplier === null ? ` (${c.tolerance})` : ""}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

type Mode = "decode" | "encode";
type BandCount = 4 | 5;

export default function ResistorColorCode() {
  const t = useTranslations("tools.resistor-color-code");
  const [mode, setMode] = useState<Mode>("decode");
  const [bandCount, setBandCount] = useState<BandCount>(4);

  // Decode state
  const [d1, setD1] = useState<ColorName>("brown");
  const [d2, setD2] = useState<ColorName>("black");
  const [d3, setD3] = useState<ColorName>("black");
  const [mult, setMult] = useState<ColorName>("red");
  const [tol, setTol] = useState<ColorName>("gold");

  // Encode state
  const [encValue, setEncValue] = useState("4700");
  const [encUnit, setEncUnit] = useState<"Ω" | "kΩ" | "MΩ">("Ω");

  // ── Decode calculation ──
  const decodeResult = useMemo(() => {
    const c1 = COLOR_MAP.get(d1)!;
    const c2 = COLOR_MAP.get(d2)!;
    const c3 = COLOR_MAP.get(d3)!;
    const cm = COLOR_MAP.get(mult)!;
    const ct = COLOR_MAP.get(tol)!;
    if (c1.digit === null || c2.digit === null) return null;
    if (bandCount === 5 && c3.digit === null) return null;
    if (cm.multiplier === null) return null;
    const significand =
      bandCount === 4
        ? c1.digit * 10 + c2.digit
        : c1.digit * 100 + c2.digit * 10 + c3.digit!;
    const ohms = significand * cm.multiplier;
    const tolPct = ct.tolerance ? parseFloat(ct.tolerance.replace("±", "").replace("%", "")) : 20;
    const min = ohms * (1 - tolPct / 100);
    const max = ohms * (1 + tolPct / 100);
    return { ohms, tolStr: ct.tolerance ?? "±20%", min, max };
  }, [d1, d2, d3, mult, tol, bandCount]);

  const decodeBands: ColorName[] =
    bandCount === 4 ? [d1, d2, mult, tol] : [d1, d2, d3, mult, tol];

  // ── Encode calculation ──
  type EncodeError = { error: "invalidValue" | "noMatch" };
  type EncodeOk = { ohms: number; four: ReturnType<typeof ohmsToFourBand>; five: ReturnType<typeof ohmsToFiveBand> };
  const encodeResult = useMemo((): EncodeError | EncodeOk => {
    const v = parseFloat(encValue);
    if (isNaN(v) || v <= 0) return { error: "invalidValue" as const };
    const multiplier = encUnit === "kΩ" ? 1000 : encUnit === "MΩ" ? 1_000_000 : 1;
    const ohms = v * multiplier;
    const four = ohmsToFourBand(ohms);
    const five = ohmsToFiveBand(ohms);
    if (!four && !five) return { error: "noMatch" as const };
    return { ohms, four, five };
  }, [encValue, encUnit]);

  const encodeBands: ColorName[] =
    encodeResult && "ohms" in encodeResult
      ? bandCount === 4
        ? (encodeResult.four ?? encodeResult.five?.slice(0, 4) ?? []) as ColorName[]
        : (encodeResult.five ?? []) as ColorName[]
      : [];

  const inputClass =
    "rounded border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900";

  return (
    <div className="space-y-5">
      {/* Mode & band count toggles */}
      <div className="flex flex-wrap gap-3">
        <div className="inline-flex rounded border border-slate-300 dark:border-slate-700 overflow-hidden text-sm">
          {(["decode", "encode"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-4 py-1.5 font-medium transition-colors ${
                mode === m
                  ? "bg-brand-600 text-white"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {t(`mode.${m}`)}
            </button>
          ))}
        </div>
        <div className="inline-flex rounded border border-slate-300 dark:border-slate-700 overflow-hidden text-sm">
          {([4, 5] as BandCount[]).map((n) => (
            <button
              key={n}
              onClick={() => setBandCount(n)}
              className={`px-4 py-1.5 font-medium transition-colors ${
                bandCount === n
                  ? "bg-brand-600 text-white"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {t(`band.count${n}`)}
            </button>
          ))}
        </div>
      </div>

      {/* ── Decode mode ── */}
      {mode === "decode" && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <ColorSelect label={t("label.digit1")} value={d1} options={DIGIT_COLORS} onChange={setD1} t={t} />
            <ColorSelect label={t("label.digit2")} value={d2} options={DIGIT_COLORS} onChange={setD2} t={t} />
            {bandCount === 5 && (
              <ColorSelect label={t("label.digit3")} value={d3} options={DIGIT_COLORS} onChange={setD3} t={t} />
            )}
            <ColorSelect label={t("label.multiplier")} value={mult} options={MULTIPLIER_COLORS} onChange={setMult} t={t} />
            <ColorSelect label={t("label.tolerance")} value={tol} options={TOLERANCE_COLORS} onChange={setTol} t={t} />
          </div>

          <div className="flex justify-center overflow-x-auto">
            <ResistorVisual bands={decodeBands} />
          </div>

          {decodeResult && (
            <div aria-live="polite" className="rounded-lg bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 p-4 space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-medium text-brand-700 dark:text-brand-300">
                  {t("result.resistance")}
                </span>
                <span className="text-3xl font-bold text-brand-600 dark:text-brand-400 font-mono">
                  {formatResistance(decodeResult.ohms)}
                </span>
                <span className="text-sm text-brand-500 dark:text-brand-400">{decodeResult.tolStr}</span>
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                <span className="font-medium">{t("result.range")}:</span>{" "}
                {t("result.minVal")} {formatResistance(decodeResult.min)} —{" "}
                {t("result.maxVal")} {formatResistance(decodeResult.max)}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Encode mode ── */}
      {mode === "encode" && (
        <>
          <div className="flex gap-2 items-end">
            <div className="flex flex-col gap-1 flex-1 max-w-xs">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {t("input.value")}
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={encValue}
                onChange={(e) => setEncValue(e.target.value)}
                className={inputClass + " w-full"}
                placeholder="4700"
              />
            </div>
            <div className="flex flex-col gap-1 w-24">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {t("input.unit")}
              </label>
              <select
                value={encUnit}
                onChange={(e) => setEncUnit(e.target.value as "Ω" | "kΩ" | "MΩ")}
                className={inputClass + " w-full"}
              >
                <option value="Ω">Ω</option>
                <option value="kΩ">kΩ</option>
                <option value="MΩ">MΩ</option>
              </select>
            </div>
          </div>

          {encodeResult && "error" in encodeResult && (
            <p className="text-sm text-amber-700 dark:text-amber-400">{t(`error.${encodeResult.error}`)}</p>
          )}

          {encodeResult && "ohms" in encodeResult && encodeBands.length > 0 && (
            <>
              <div className="flex justify-center overflow-x-auto">
                <ResistorVisual bands={encodeBands} />
              </div>

              <div aria-live="polite" className="rounded-lg bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 p-4">
                <p className="text-sm font-medium text-brand-700 dark:text-brand-300 mb-2">
                  {t("result.resistance")}: <span className="text-xl font-bold text-brand-600 dark:text-brand-400 font-mono">{formatResistance(("ohms" in encodeResult ? (encodeResult as EncodeOk).ohms : 0))}</span>
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {encodeBands.map((b, i) => {
                    const def = COLOR_MAP.get(b)!;
                    return (
                      <span
                        key={i}
                        className={`inline-flex items-center gap-1.5 rounded px-2 py-1 text-sm font-medium border border-black/10 ${def.textClass}`}
                        style={{ backgroundColor: def.hex }}
                      >
                        {b.charAt(0).toUpperCase() + b.slice(1)}
                      </span>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
