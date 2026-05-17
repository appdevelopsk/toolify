"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

type LockKey = "ratioW" | "ratioH" | "width" | "height";

const COMMON_RATIOS = [
  { label: "16:9 (HD/FHD)", w: 16, h: 9 },
  { label: "9:16 (Stories)", w: 9, h: 16 },
  { label: "4:3 (classic)", w: 4, h: 3 },
  { label: "1:1 (square)", w: 1, h: 1 },
  { label: "3:2 (DSLR)", w: 3, h: 2 },
  { label: "21:9 (cinematic)", w: 21, h: 9 },
  { label: "2:3 (portrait DSLR)", w: 2, h: 3 },
  { label: "5:4 (large prints)", w: 5, h: 4 },
];

function gcd(a: number, b: number): number {
  while (b !== 0) {
    [a, b] = [b, a % b];
  }
  return Math.abs(a);
}

export default function AspectRatioCalculator() {
  const t = useTranslations("tools.aspect-ratio-calculator");
  const locale = useLocale();
  const [ratioW, setRatioW] = useState("16");
  const [ratioH, setRatioH] = useState("9");
  const [width, setWidth] = useState("1920");
  const [height, setHeight] = useState("1080");
  const [lock, setLock] = useState<LockKey>("ratioW");

  function applyRatio(w: number, h: number) {
    setRatioW(String(w));
    setRatioH(String(h));
    const widthNum = parseFloat(width);
    if (isFinite(widthNum) && widthNum > 0) {
      setHeight(String(Math.round((widthNum * h) / w)));
    }
  }

  function update(key: LockKey, value: string) {
    if (key === "ratioW") setRatioW(value);
    if (key === "ratioH") setRatioH(value);
    if (key === "width") setWidth(value);
    if (key === "height") setHeight(value);

    const rW = parseFloat(key === "ratioW" ? value : ratioW);
    const rH = parseFloat(key === "ratioH" ? value : ratioH);
    const w = parseFloat(key === "width" ? value : width);
    const h = parseFloat(key === "height" ? value : height);

    if (![rW, rH].every(isFinite) || rW <= 0 || rH <= 0) return;

    if (key === "width" && isFinite(w) && w > 0) {
      // Update height based on ratio
      setHeight(String(Math.round((w * rH) / rW)));
    } else if (key === "height" && isFinite(h) && h > 0) {
      setWidth(String(Math.round((h * rW) / rH)));
    } else if ((key === "ratioW" || key === "ratioH") && isFinite(w) && w > 0) {
      // Maintain width, recompute height
      setHeight(String(Math.round((w * rH) / rW)));
    }
  }

  const computed = useMemo(() => {
    const rW = parseFloat(ratioW);
    const rH = parseFloat(ratioH);
    const w = parseFloat(width);
    const h = parseFloat(height);
    if (![rW, rH, w, h].every(isFinite) || rW <= 0 || rH <= 0 || w <= 0 || h <= 0) return null;
    const decimal = rW / rH;
    const simplifiedRatio = (() => {
      if (!Number.isInteger(rW) || !Number.isInteger(rH)) return null;
      const g = gcd(rW, rH);
      if (g <= 1) return null;
      return `${rW / g}:${rH / g}`;
    })();
    return { decimal, simplifiedRatio, w, h };
  }, [ratioW, ratioH, width, height]);

  void lock; // eslint quiet
  const fmt = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 4 }), [locale]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-1">
        {COMMON_RATIOS.map((r) => (
          <button
            key={r.label}
            onClick={() => applyRatio(r.w, r.h)}
            className="rounded border border-slate-300 px-2 py-1 text-xs hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <label className="block">
          <span className="text-xs uppercase text-slate-600 dark:text-slate-400">{t("input.ratioW")}</span>
          <input inputMode="decimal" value={ratioW} onChange={(e) => update("ratioW", e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-center font-mono dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-xs uppercase text-slate-600 dark:text-slate-400">{t("input.ratioH")}</span>
          <input inputMode="decimal" value={ratioH} onChange={(e) => update("ratioH", e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-center font-mono dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-xs uppercase text-slate-600 dark:text-slate-400">{t("input.width")}</span>
          <input inputMode="decimal" value={width} onChange={(e) => update("width", e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-center font-mono dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <label className="block">
          <span className="text-xs uppercase text-slate-600 dark:text-slate-400">{t("input.height")}</span>
          <input inputMode="decimal" value={height} onChange={(e) => update("height", e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-center font-mono dark:border-slate-700 dark:bg-slate-900" />
        </label>
      </div>

      {computed && (
        <div aria-live="polite" className="mt-6 rounded-lg border border-brand-200 bg-brand-50 p-4 dark:border-brand-900 dark:bg-brand-900/20">
          <dl className="grid gap-2 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">{t("result.ratio")}</dt>
              <dd className="mt-1 font-mono text-2xl font-bold tabular-nums">{ratioW}:{ratioH}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">{t("result.decimal")}</dt>
              <dd className="mt-1 font-mono text-2xl font-bold tabular-nums">{fmt.format(computed.decimal)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">{t("result.dimensions")}</dt>
              <dd className="mt-1 font-mono text-2xl font-bold tabular-nums">{computed.w} × {computed.h}</dd>
            </div>
          </dl>
          {computed.simplifiedRatio && (
            <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              {t("result.simplified")}: <code className="font-mono">{computed.simplifiedRatio}</code>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
