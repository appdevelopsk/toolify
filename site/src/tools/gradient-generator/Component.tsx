"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

type GradientType = "linear" | "radial" | "conic";

interface Stop {
  color: string;
  pos: number;
}

const PRESETS: { name: string; type: GradientType; angle: number; stops: Stop[] }[] = [
  { name: "Sunset", type: "linear", angle: 135, stops: [{ color: "#ff6b6b", pos: 0 }, { color: "#feca57", pos: 100 }] },
  { name: "Ocean", type: "linear", angle: 180, stops: [{ color: "#0093E9", pos: 0 }, { color: "#80D0C7", pos: 100 }] },
  { name: "Mint", type: "linear", angle: 90, stops: [{ color: "#00b09b", pos: 0 }, { color: "#96c93d", pos: 100 }] },
  { name: "Twilight", type: "linear", angle: 135, stops: [{ color: "#5f2c82", pos: 0 }, { color: "#49a09d", pos: 100 }] },
  { name: "Cherry", type: "radial", angle: 0, stops: [{ color: "#ff5858", pos: 0 }, { color: "#f09819", pos: 100 }] },
  { name: "Conic spin", type: "conic", angle: 0, stops: [{ color: "#ff6b6b", pos: 0 }, { color: "#feca57", pos: 33 }, { color: "#48dbfb", pos: 66 }, { color: "#ff6b6b", pos: 100 }] },
];

function gradientCss(type: GradientType, angle: number, stops: Stop[]): string {
  const stopStr = stops.map((s) => `${s.color} ${s.pos}%`).join(", ");
  if (type === "linear") return `linear-gradient(${angle}deg, ${stopStr})`;
  if (type === "radial") return `radial-gradient(circle, ${stopStr})`;
  return `conic-gradient(from ${angle}deg, ${stopStr})`;
}

export default function GradientGenerator() {
  const t = useTranslations("tools.gradient-generator");
  const [type, setType] = useState<GradientType>("linear");
  const [angle, setAngle] = useState(135);
  const [stops, setStops] = useState<Stop[]>([
    { color: "#ff6b6b", pos: 0 },
    { color: "#feca57", pos: 100 },
  ]);
  const [copied, setCopied] = useState(false);

  const css = useMemo(() => gradientCss(type, angle, stops), [type, angle, stops]);

  function applyPreset(p: typeof PRESETS[number]) {
    setType(p.type);
    setAngle(p.angle);
    setStops(p.stops);
  }

  function updateStop(idx: number, patch: Partial<Stop>) {
    setStops((prev) => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  }

  function addStop() {
    setStops((prev) => [...prev, { color: "#ffffff", pos: 50 }]);
  }

  function removeStop(idx: number) {
    setStops((prev) => prev.filter((_, i) => i !== idx));
  }

  async function copy() {
    await navigator.clipboard.writeText(`background: ${css};`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div>
      <div
        className="h-48 w-full rounded-lg border border-slate-200 dark:border-slate-800"
        style={{ background: css }}
        aria-label={t("preview")}
      />

      <div className="mt-4 flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.name}
            onClick={() => applyPreset(p)}
            className="rounded border border-slate-300 px-3 py-1 text-xs hover:border-brand-500 dark:border-slate-700"
          >
            {p.name}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">{t("input.type")}</span>
          <select value={type} onChange={(e) => setType(e.target.value as GradientType)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
            <option value="linear">{t("type.linear")}</option>
            <option value="radial">{t("type.radial")}</option>
            <option value="conic">{t("type.conic")}</option>
          </select>
        </label>
        {type !== "radial" && (
          <label className="block">
            <span className="text-sm font-medium">{t("input.angle")}: {angle}°</span>
            <input type="range" min={0} max={360} value={angle} onChange={(e) => setAngle(parseInt(e.target.value))} className="mt-1 w-full" />
          </label>
        )}
      </div>

      <div className="mt-4">
        <h3 className="text-sm font-medium">{t("input.stops")}</h3>
        <ul className="mt-2 space-y-2">
          {stops.map((s, i) => (
            <li key={i} className="flex items-center gap-2">
              <input type="color" value={s.color} onChange={(e) => updateStop(i, { color: e.target.value })} className="h-9 w-12 rounded border border-slate-300 dark:border-slate-700" />
              <input type="text" value={s.color} onChange={(e) => updateStop(i, { color: e.target.value })} className="w-28 rounded border border-slate-300 px-2 py-1 font-mono text-sm dark:border-slate-700 dark:bg-slate-900" />
              <input type="range" min={0} max={100} value={s.pos} onChange={(e) => updateStop(i, { pos: parseInt(e.target.value) })} className="flex-1" />
              <span className="w-10 text-right text-sm tabular-nums">{s.pos}%</span>
              {stops.length > 2 && (
                <button onClick={() => removeStop(i)} aria-label={t("removeStop")} className="text-slate-400 hover:text-red-500">×</button>
              )}
            </li>
          ))}
        </ul>
        <button onClick={addStop} className="mt-2 rounded border border-slate-300 px-3 py-1 text-sm hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">+ {t("addStop")}</button>
      </div>

      <div className="mt-4">
        <label className="block">
          <span className="text-sm font-medium">{t("output.css")}</span>
          <code className="mt-1 block rounded bg-slate-100 p-3 font-mono text-xs dark:bg-slate-800">background: {css};</code>
        </label>
        <button onClick={copy} className="mt-2 rounded bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700">
          {copied ? t("copied") : t("copy")}
        </button>
      </div>
    </div>
  );
}
