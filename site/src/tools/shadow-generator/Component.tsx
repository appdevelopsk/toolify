"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

const PRESETS: { id: string; x: number; y: number; blur: number; spread: number; color: string; inset: boolean }[] = [
  { id: "soft", x: 0, y: 4, blur: 12, spread: 0, color: "rgba(0,0,0,0.10)", inset: false },
  { id: "card", x: 0, y: 8, blur: 24, spread: -4, color: "rgba(0,0,0,0.18)", inset: false },
  { id: "lifted", x: 0, y: 16, blur: 32, spread: -8, color: "rgba(0,0,0,0.25)", inset: false },
  { id: "glow", x: 0, y: 0, blur: 30, spread: 4, color: "rgba(99,102,241,0.45)", inset: false },
  { id: "neumorphic", x: 8, y: 8, blur: 20, spread: 0, color: "rgba(0,0,0,0.12)", inset: false },
  { id: "inset", x: 0, y: 4, blur: 8, spread: 0, color: "rgba(0,0,0,0.18)", inset: true },
];

export default function ShadowGenerator() {
  const t = useTranslations("tools.shadow-generator");
  const [x, setX] = useState(0);
  const [y, setY] = useState(8);
  const [blur, setBlur] = useState(24);
  const [spread, setSpread] = useState(-4);
  const [color, setColor] = useState("#000000");
  const [opacity, setOpacity] = useState(0.18);
  const [inset, setInset] = useState(false);
  const [copied, setCopied] = useState(false);

  function hexToRgba(hex: string, a: number): string {
    const m = /^#?([a-f0-9]{6})$/i.exec(hex);
    if (!m) return `rgba(0,0,0,${a})`;
    const num = parseInt(m[1]!, 16);
    return `rgba(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}, ${a})`;
  }

  const rgba = useMemo(() => hexToRgba(color, opacity), [color, opacity]);
  const css = useMemo(
    () => `${inset ? "inset " : ""}${x}px ${y}px ${blur}px ${spread}px ${rgba}`,
    [inset, x, y, blur, spread, rgba],
  );

  function applyPreset(p: typeof PRESETS[number]) {
    setX(p.x);
    setY(p.y);
    setBlur(p.blur);
    setSpread(p.spread);
    setInset(p.inset);
    const m = /rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/.exec(p.color);
    if (m) {
      const r = parseInt(m[1]!).toString(16).padStart(2, "0");
      const g = parseInt(m[2]!).toString(16).padStart(2, "0");
      const b = parseInt(m[3]!).toString(16).padStart(2, "0");
      setColor(`#${r}${g}${b}`);
      setOpacity(parseFloat(m[4]!));
    }
  }

  async function copy() {
    await navigator.clipboard.writeText(`box-shadow: ${css};`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div>
      <div className="flex min-h-[240px] items-center justify-center rounded-lg bg-slate-100 p-8 dark:bg-slate-900">
        <div
          className="h-32 w-48 rounded-lg bg-white dark:bg-slate-700"
          style={{ boxShadow: css }}
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button key={p.id} onClick={() => applyPreset(p)} className="rounded border border-slate-300 px-3 py-1 text-xs hover:border-brand-500 dark:border-slate-700">
            {t(`preset.${p.id}`)}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Slider label={t("input.x")} value={x} setValue={setX} min={-50} max={50} />
        <Slider label={t("input.y")} value={y} setValue={setY} min={-50} max={50} />
        <Slider label={t("input.blur")} value={blur} setValue={setBlur} min={0} max={100} />
        <Slider label={t("input.spread")} value={spread} setValue={setSpread} min={-30} max={30} />
        <label className="block">
          <span className="text-sm font-medium">{t("input.color")}</span>
          <div className="mt-1 flex gap-2">
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-9 w-12 rounded border border-slate-300 dark:border-slate-700" />
            <input type="text" value={color} onChange={(e) => setColor(e.target.value)} className="flex-1 rounded border border-slate-300 px-2 font-mono text-sm dark:border-slate-700 dark:bg-slate-900" />
          </div>
        </label>
        <Slider label={`${t("input.opacity")}: ${opacity.toFixed(2)}`} value={opacity} setValue={setOpacity} min={0} max={1} step={0.05} />
        <label className="inline-flex items-center gap-2 text-sm sm:col-span-2">
          <input type="checkbox" checked={inset} onChange={(e) => setInset(e.target.checked)} />
          <span>{t("input.inset")}</span>
        </label>
      </div>

      <div className="mt-4">
        <label className="block">
          <span className="text-sm font-medium">{t("output.css")}</span>
          <code className="mt-1 block rounded bg-slate-100 p-3 font-mono text-xs dark:bg-slate-800">box-shadow: {css};</code>
        </label>
        <button onClick={copy} className="mt-2 rounded bg-brand-600 px-3 py-1.5 text-sm font-medium text-white">
          {copied ? t("copied") : t("copy")}
        </button>
      </div>
    </div>
  );
}

function Slider({ label, value, setValue, min, max, step = 1 }: { label: string; value: number; setValue: (v: number) => void; min: number; max: number; step?: number }) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}: {value}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => setValue(parseFloat(e.target.value))}
        className="mt-1 w-full"
      />
    </label>
  );
}
