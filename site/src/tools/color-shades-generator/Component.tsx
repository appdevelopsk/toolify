"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

function hexToHsl(hex: string): { h: number; s: number; l: number } | null {
  const m = /^#?([a-f0-9]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const n = parseInt(m[1]!, 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToHex(h: number, s: number, l: number): string {
  const hn = h / 360, sn = s / 100, ln = l / 100;
  const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn;
  const p = 2 * ln - q;
  const hue2rgb = (t: number) => {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  const rr = hue2rgb(hn + 1/3), gg = hue2rgb(hn), bb = hue2rgb(hn - 1/3);
  return "#" + [rr, gg, bb].map((x) => Math.round(x * 255).toString(16).padStart(2, "0")).join("");
}

function luminance(hex: string): number {
  const m = /^#?([a-f0-9]{6})$/i.exec(hex);
  if (!m) return 0;
  const n = parseInt(m[1]!, 16);
  const toLinear = (c: number) => { const s = c / 255; return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
  const r = toLinear((n >> 16) & 255);
  const g = toLinear((n >> 8) & 255);
  const b = toLinear(n & 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(hex1: string, hex2: string): number {
  const l1 = luminance(hex1), l2 = luminance(hex2);
  const bright = Math.max(l1, l2), dark = Math.min(l1, l2);
  return (bright + 0.05) / (dark + 0.05);
}

const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
const LIGHTNESS_MAP: Record<number, number> = {
  50: 97, 100: 94, 200: 87, 300: 77, 400: 65, 500: 52, 600: 42, 700: 33, 800: 25, 900: 18, 950: 12,
};

interface Shade {
  step: number;
  hex: string;
  textColor: string;
  contrast: string;
}

function generateShades(baseHex: string): Shade[] {
  const hsl = hexToHsl(baseHex);
  if (!hsl) return [];
  return STEPS.map((step) => {
    const l = LIGHTNESS_MAP[step]!;
    const hex = hslToHex(hsl.h, hsl.s, l);
    const onWhite = contrastRatio(hex, "#ffffff");
    const onBlack = contrastRatio(hex, "#000000");
    const textColor = onBlack >= onWhite ? "#000000" : "#ffffff";
    const ratio = Math.max(onWhite, onBlack);
    const wcag = ratio >= 7 ? "AAA" : ratio >= 4.5 ? "AA" : ratio >= 3 ? "AA Large" : "Fail";
    return { step, hex, textColor, contrast: wcag };
  });
}

export default function ColorShadesGenerator() {
  const t = useTranslations("tools.color-shades-generator");
  const [hexInput, setHexInput] = useState("#3B82F6");
  const [pickerValue, setPickerValue] = useState("#3B82F6");
  const [copied, setCopied] = useState<string | null>(null);

  const shades = useMemo(() => {
    const hex = hexInput.trim().startsWith("#") ? hexInput.trim() : "#" + hexInput.trim();
    return generateShades(hex);
  }, [hexInput]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(text);
    setTimeout(() => setCopied(null), 1500);
  };

  const handleCopyAll = () => {
    const css = shades.map((s) => `  --color-${s.step}: ${s.hex};`).join("\n");
    handleCopy(`:root {\n${css}\n}`);
  };

  const inputClass = "rounded border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            {t("input.picker")}
          </span>
          <input
            type="color"
            value={pickerValue}
            onChange={(e) => { setPickerValue(e.target.value); setHexInput(e.target.value); }}
            className="h-10 w-12 cursor-pointer rounded border border-slate-300 dark:border-slate-700"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            {t("input.hex")}
          </span>
          <input
            value={hexInput}
            onChange={(e) => {
              setHexInput(e.target.value);
              const hsl = hexToHsl(e.target.value);
              if (hsl) setPickerValue(hslToHex(hsl.h, hsl.s, hsl.l));
            }}
            placeholder="#3B82F6"
            className={inputClass + " font-mono w-32"}
          />
        </label>
        {shades.length > 0 && (
          <button onClick={handleCopyAll} className="rounded bg-brand-600 px-3 py-2 text-sm text-white hover:bg-brand-700">
            {copied?.startsWith(":root") ? t("action.copied") : t("action.copyCSS")}
          </button>
        )}
      </div>

      {shades.length > 0 && (
        <div className="space-y-1">
          {shades.map((shade) => (
            <div
              key={shade.step}
              className="flex items-center gap-3 cursor-pointer rounded px-3 py-2 hover:ring-2 hover:ring-brand-300"
              style={{ backgroundColor: shade.hex }}
              onClick={() => handleCopy(shade.hex)}
              title={t("action.clickCopy")}
            >
              <span className="w-10 text-sm font-semibold" style={{ color: shade.textColor }}>
                {shade.step}
              </span>
              <span className="flex-1 font-mono text-sm" style={{ color: shade.textColor }}>
                {shade.hex.toUpperCase()}
              </span>
              <span
                className="text-xs font-medium px-1.5 py-0.5 rounded"
                style={{
                  color: shade.textColor,
                  border: `1px solid ${shade.textColor}44`,
                  opacity: 0.8,
                }}
              >
                {shade.contrast}
              </span>
              {copied === shade.hex && (
                <span className="text-xs" style={{ color: shade.textColor }}>✓</span>
              )}
            </div>
          ))}
        </div>
      )}

      {shades.length === 0 && hexInput.length > 0 && (
        <p className="text-sm text-red-600 dark:text-red-400">{t("error.invalid")}</p>
      )}
    </div>
  );
}
