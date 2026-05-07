"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

type Scheme = "complementary" | "analogous" | "triadic" | "tetradic" | "monochromatic";

function hexToHsl(hex: string): { h: number; s: number; l: number } | null {
  const m = /^#?([a-f0-9]{6})$/i.exec(hex);
  if (!m) return null;
  const num = parseInt(m[1]!, 16);
  const r = ((num >> 16) & 255) / 255;
  const g = ((num >> 8) & 255) / 255;
  const b = (num & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
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
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const x = l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return Math.round(x * 255).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function generate(base: string, scheme: Scheme): string[] {
  const hsl = hexToHsl(base);
  if (!hsl) return [];
  const { h, s, l } = hsl;
  switch (scheme) {
    case "complementary":
      return [base, hslToHex((h + 180) % 360, s, l)];
    case "analogous":
      return [hslToHex((h - 30 + 360) % 360, s, l), base, hslToHex((h + 30) % 360, s, l)];
    case "triadic":
      return [base, hslToHex((h + 120) % 360, s, l), hslToHex((h + 240) % 360, s, l)];
    case "tetradic":
      return [base, hslToHex((h + 90) % 360, s, l), hslToHex((h + 180) % 360, s, l), hslToHex((h + 270) % 360, s, l)];
    case "monochromatic":
      return [
        hslToHex(h, s, Math.max(10, l - 30)),
        hslToHex(h, s, Math.max(15, l - 15)),
        base,
        hslToHex(h, s, Math.min(85, l + 15)),
        hslToHex(h, s, Math.min(95, l + 30)),
      ];
  }
}

export default function ColorPaletteGenerator() {
  const t = useTranslations("tools.color-palette-generator");
  const [base, setBase] = useState("#3b82f6");
  const [scheme, setScheme] = useState<Scheme>("analogous");
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const palette = useMemo(() => generate(base, scheme), [base, scheme]);

  async function copyColor(c: string, i: number) {
    await navigator.clipboard.writeText(c);
    setCopiedIdx(i);
    setTimeout(() => setCopiedIdx(null), 1200);
  }

  async function copyAll() {
    await navigator.clipboard.writeText(palette.join(", "));
    setCopiedIdx(-1);
    setTimeout(() => setCopiedIdx(null), 1200);
  }

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">{t("input.baseColor")}</span>
          <div className="mt-1 flex gap-2">
            <input type="color" value={base} onChange={(e) => setBase(e.target.value)} className="h-10 w-16 rounded border border-slate-300 dark:border-slate-700" />
            <input type="text" value={base} onChange={(e) => setBase(e.target.value)} className="flex-1 rounded border border-slate-300 px-3 py-2 font-mono dark:border-slate-700 dark:bg-slate-900" />
          </div>
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.scheme")}</span>
          <select value={scheme} onChange={(e) => setScheme(e.target.value as Scheme)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
            <option value="complementary">{t("scheme.complementary")}</option>
            <option value="analogous">{t("scheme.analogous")}</option>
            <option value="triadic">{t("scheme.triadic")}</option>
            <option value="tetradic">{t("scheme.tetradic")}</option>
            <option value="monochromatic">{t("scheme.monochromatic")}</option>
          </select>
        </label>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">{t("result.palette")}</h3>
          <button onClick={copyAll} className="rounded bg-brand-600 px-2 py-1 text-xs font-medium text-white">
            {copiedIdx === -1 ? t("copied") : t("copyAll")}
          </button>
        </div>
        <div className="mt-2 grid gap-2" style={{ gridTemplateColumns: `repeat(${palette.length}, minmax(0, 1fr))` }}>
          {palette.map((c, i) => (
            <button
              key={i}
              onClick={() => copyColor(c, i)}
              className="aspect-square rounded-lg border border-slate-200 dark:border-slate-800"
              style={{ backgroundColor: c }}
              aria-label={`${t("copyColor")} ${c}`}
            />
          ))}
        </div>
        <ul className="mt-3 grid gap-1 sm:grid-cols-2">
          {palette.map((c, i) => (
            <li key={i} className="flex items-center justify-between rounded border border-slate-200 px-3 py-1 font-mono text-sm dark:border-slate-800">
              <span>{c.toUpperCase()}</span>
              <button onClick={() => copyColor(c, i)} className="text-xs text-brand-600 hover:underline">
                {copiedIdx === i ? t("copied") : t("copy")}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
