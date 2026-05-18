"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

const PRESETS = [
  { label: "iPhone 16", w: 2556, h: 1179, d: 6.12 },
  { label: "MacBook Pro 14\"", w: 3024, h: 1964, d: 14.2 },
  { label: "Galaxy S24", w: 3088, h: 1440, d: 6.2 },
  { label: "4K 27\"", w: 3840, h: 2160, d: 27 },
  { label: "FHD 24\"", w: 1920, h: 1080, d: 24 },
];

function getQualityKey(ppi: number): "low" | "medium" | "high" | "ultra" {
  if (ppi < 100) return "low";
  if (ppi < 200) return "medium";
  if (ppi < 300) return "high";
  return "ultra";
}

export default function PixelDensityCalculator() {
  const t = useTranslations("tools.pixel-density-calculator");
  const locale = useLocale();

  const [width, setWidth] = useState("1920");
  const [height, setHeight] = useState("1080");
  const [diagonal, setDiagonal] = useState("24");

  function applyPreset(preset: (typeof PRESETS)[number]) {
    setWidth(String(preset.w));
    setHeight(String(preset.h));
    setDiagonal(String(preset.d));
  }

  const result = useMemo(() => {
    const w = parseFloat(width);
    const h = parseFloat(height);
    const d = parseFloat(diagonal);
    if (!isFinite(w) || !isFinite(h) || !isFinite(d) || w <= 0 || h <= 0 || d <= 0) return null;
    const ppi = Math.sqrt(w * w + h * h) / d;
    const megapixels = (w * h) / 1_000_000;
    const qualityKey = getQualityKey(ppi);
    return { ppi, megapixels, qualityKey };
  }, [width, height, diagonal]);

  const fmtPpi = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }), [locale]);
  const fmtMp = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }), [locale]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-1">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() => applyPreset(p)}
            className="rounded border border-slate-300 px-2 py-1 text-xs hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="text-sm font-medium">{t("input.width")}</span>
          <input
            inputMode="decimal"
            value={width}
            onChange={(e) => setWidth(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
            placeholder="1920"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.height")}</span>
          <input
            inputMode="decimal"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
            placeholder="1080"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.diagonal")}</span>
          <input
            inputMode="decimal"
            value={diagonal}
            onChange={(e) => setDiagonal(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
            placeholder="24"
          />
        </label>
      </div>

      <div
        aria-live="polite"
        className={`mt-6 rounded-lg border p-4 ${
          result
            ? "border-brand-200 bg-brand-50 dark:border-brand-900 dark:bg-brand-900/20"
            : "border-slate-200 dark:border-slate-800"
        }`}
      >
        {result ? (
          <dl className="grid gap-4 sm:grid-cols-3">
            <div>
              <dt className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">
                {t("result.ppi")}
              </dt>
              <dd className="mt-1 text-3xl font-bold tabular-nums">
                {fmtPpi.format(result.ppi)} <span className="text-base font-normal">PPI</span>
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">
                {t("result.megapixels")}
              </dt>
              <dd className="mt-1 text-3xl font-bold tabular-nums">
                {fmtMp.format(result.megapixels)} <span className="text-base font-normal">MP</span>
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">
                {t("result.quality")}
              </dt>
              <dd className="mt-1 text-xl font-bold">
                {t(`qualityLabels.${result.qualityKey}`)}
              </dd>
            </div>
          </dl>
        ) : (
          <p className="text-sm text-slate-600 dark:text-slate-400">{t("empty")}</p>
        )}
      </div>
    </div>
  );
}
