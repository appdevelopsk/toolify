"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

function clamp(v: number): number {
  return Math.max(0, Math.min(255, Math.round(v)));
}

function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex.trim().match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!m) return null;
  let h = m[1]!;
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((v) => clamp(v).toString(16).padStart(2, "0")).join("");
}

function applyMatrix(
  r: number,
  g: number,
  b: number,
  m: number[]
): [number, number, number] {
  return [
    clamp(m[0]! * r + m[1]! * g + m[2]! * b),
    clamp(m[3]! * r + m[4]! * g + m[5]! * b),
    clamp(m[6]! * r + m[7]! * g + m[8]! * b),
  ];
}

const DEUTERANOPIA = [0.367, 0.861, -0.228, 0.280, 0.673, 0.047, -0.012, 0.043, 0.969];
const PROTANOPIA   = [0.152, 1.053, -0.205, 0.115, 0.786, 0.099, -0.004, -0.048, 1.052];
const TRITANOPIA   = [1.256, -0.077, -0.179, -0.079, 0.931, 0.148, 0.005, 0.691, 0.304];

function simulateDeuteranopia(r: number, g: number, b: number) { return applyMatrix(r, g, b, DEUTERANOPIA); }
function simulateProtanopia(r: number, g: number, b: number)   { return applyMatrix(r, g, b, PROTANOPIA); }
function simulateTritanopia(r: number, g: number, b: number)   { return applyMatrix(r, g, b, TRITANOPIA); }
function simulateAchromatopsia(r: number, g: number, b: number): [number, number, number] {
  const l = clamp(0.299 * r + 0.587 * g + 0.114 * b);
  return [l, l, l];
}

interface SwatchData {
  labelKey: string;
  rgb: [number, number, number];
}

interface SwatchProps {
  label: string;
  hex: string;
  rgb: [number, number, number];
}

function Swatch({ label, hex, rgb }: SwatchProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="h-20 w-20 rounded-lg border border-slate-200 shadow-sm dark:border-slate-700"
        style={{ backgroundColor: hex }}
        aria-label={`${label}: ${hex}`}
      />
      <div className="text-center">
        <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">{label}</div>
        <div className="font-mono text-xs text-slate-600 dark:text-slate-400">{hex.toUpperCase()}</div>
        <div className="font-mono text-xs text-slate-500 dark:text-slate-500">
          {rgb[0]}, {rgb[1]}, {rgb[2]}
        </div>
      </div>
    </div>
  );
}

export default function ColorBlindnessSimulator() {
  const t = useTranslations("tools.color-blindness-simulator");
  const [hexInput, setHexInput] = useState("#3B82F6");
  const [pickerValue, setPickerValue] = useState("#3B82F6");

  const rgb = useMemo(() => hexToRgb(hexInput), [hexInput]);

  const swatches = useMemo<SwatchData[]>(() => {
    if (!rgb) return [];
    const [r, g, b] = rgb;
    return [
      { labelKey: "label.original", rgb: [r, g, b] },
      { labelKey: "label.deuteranopia", rgb: simulateDeuteranopia(r, g, b) },
      { labelKey: "label.protanopia", rgb: simulateProtanopia(r, g, b) },
      { labelKey: "label.tritanopia", rgb: simulateTritanopia(r, g, b) },
      { labelKey: "label.achromatopsia", rgb: simulateAchromatopsia(r, g, b) },
    ];
  }, [rgb]);

  const isValidHex = Boolean(rgb);

  return (
    <div>
      <div className="flex flex-wrap items-end gap-3">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            {t("input.picker")}
          </span>
          <input
            type="color"
            value={pickerValue}
            onChange={(e) => {
              setPickerValue(e.target.value);
              setHexInput(e.target.value);
            }}
            className="h-10 w-12 cursor-pointer rounded border border-slate-300 dark:border-slate-700"
          />
        </label>
        <label className="block flex-1">
          <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            {t("input.hex")}
          </span>
          <input
            value={hexInput}
            onChange={(e) => {
              setHexInput(e.target.value);
              const parsed = hexToRgb(e.target.value);
              if (parsed) {
                setPickerValue(rgbToHex(...parsed));
              }
            }}
            placeholder="#3B82F6"
            className="w-full rounded border border-slate-300 px-3 py-2 font-mono text-sm dark:border-slate-700 dark:bg-slate-900"
          />
        </label>
      </div>

      {!isValidHex && hexInput.length > 0 && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{t("error.invalid")}</p>
      )}

      <div aria-live="polite" className="mt-6">
        {isValidHex ? (
          <div className="flex flex-wrap justify-center gap-6">
            {swatches.map((s) => (
              <Swatch
                key={s.labelKey}
                label={t(s.labelKey)}
                hex={rgbToHex(...s.rgb)}
                rgb={s.rgb}
              />
            ))}
          </div>
        ) : (
          <div className="text-sm text-slate-500 dark:text-slate-400">{t("empty")}</div>
        )}
      </div>
    </div>
  );
}
