"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}
function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex.trim().match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!m) return null;
  let h = m[1]!;
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, "0")).join("");
}
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h /= 360; s /= 100; l /= 100;
  if (s === 0) {
    const v = Math.round(l * 255);
    return [v, v, v];
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hk = (t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return [Math.round(hk(h + 1 / 3) * 255), Math.round(hk(h) * 255), Math.round(hk(h - 1 / 3) * 255)];
}

export default function ColorConverter() {
  const t = useTranslations("tools.color-converter");
  const [hex, setHex] = useState("#0ea5e9");
  const [rgb, setRgb] = useState<[number, number, number]>([14, 165, 233]);
  const [hsl, setHsl] = useState<[number, number, number]>([199, 89, 48]);
  const [source, setSource] = useState<"hex" | "rgb" | "hsl">("hex");

  useEffect(() => {
    if (source !== "hex") return;
    const r = hexToRgb(hex);
    if (r) {
      setRgb(r);
      setHsl(rgbToHsl(...r));
    }
  }, [hex, source]);
  useEffect(() => {
    if (source !== "rgb") return;
    const [r, g, b] = rgb.map((v) => clamp(v, 0, 255)) as [number, number, number];
    setHex(rgbToHex(r, g, b));
    setHsl(rgbToHsl(r, g, b));
  }, [rgb, source]);
  useEffect(() => {
    if (source !== "hsl") return;
    const [h, s, l] = hsl as [number, number, number];
    const r = hslToRgb(h, s, l);
    setRgb(r);
    setHex(rgbToHex(...r));
  }, [hsl, source]);

  const swatchStyle = useMemo(() => ({ backgroundColor: hex }), [hex]);

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-[160px_minmax(0,1fr)]">
        <div className="h-32 rounded-lg border border-slate-200 dark:border-slate-800" style={swatchStyle} aria-label={`Color preview: ${hex}`} />
        <div className="space-y-3">
          <div className="grid grid-cols-[80px_1fr] items-center gap-3">
            <label className="text-sm font-medium">{t("hex")}</label>
            <input value={hex} onFocus={() => setSource("hex")} onChange={(e) => setHex(e.target.value)} className="rounded border border-slate-300 px-3 py-2 font-mono dark:border-slate-700 dark:bg-slate-900" />
          </div>
          <div className="grid grid-cols-[80px_1fr] items-center gap-3">
            <label className="text-sm font-medium">{t("rgb")}</label>
            <div className="grid grid-cols-3 gap-2">
              {(["R", "G", "B"] as const).map((label, i) => (
                <input
                  key={label}
                  inputMode="numeric"
                  value={rgb[i]}
                  onFocus={() => setSource("rgb")}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    setRgb((cur) => {
                      const next = [...cur] as [number, number, number];
                      next[i] = isFinite(v) ? clamp(v, 0, 255) : 0;
                      return next;
                    });
                  }}
                  className="rounded border border-slate-300 px-3 py-2 font-mono dark:border-slate-700 dark:bg-slate-900"
                  aria-label={label}
                />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-[80px_1fr] items-center gap-3">
            <label className="text-sm font-medium">{t("hsl")}</label>
            <div className="grid grid-cols-3 gap-2">
              {(["H", "S", "L"] as const).map((label, i) => (
                <input
                  key={label}
                  inputMode="numeric"
                  value={hsl[i]}
                  onFocus={() => setSource("hsl")}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    setHsl((cur) => {
                      const next = [...cur] as [number, number, number];
                      next[i] = isFinite(v) ? clamp(v, 0, i === 0 ? 360 : 100) : 0;
                      return next;
                    });
                  }}
                  className="rounded border border-slate-300 px-3 py-2 font-mono dark:border-slate-700 dark:bg-slate-900"
                  aria-label={label}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      <pre className="mt-4 overflow-x-auto rounded border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950">
        <code>{`hex: ${hex}\nrgb(${rgb.join(", ")})\nhsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)`}</code>
      </pre>
    </div>
  );
}
