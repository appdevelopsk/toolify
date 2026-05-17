"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex.trim().match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!m) return null;
  let h = m[1]!;
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
function relativeLuminance([r, g, b]: [number, number, number]): number {
  const c = [r, g, b].map((v) => {
    const x = v / 255;
    return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * c[0]! + 0.7152 * c[1]! + 0.0722 * c[2]!;
}
function contrastRatio(a: string, b: string): number | null {
  const ra = hexToRgb(a);
  const rb = hexToRgb(b);
  if (!ra || !rb) return null;
  const la = relativeLuminance(ra);
  const lb = relativeLuminance(rb);
  const [light, dark] = la > lb ? [la, lb] : [lb, la];
  return (light + 0.05) / (dark + 0.05);
}

export default function ContrastChecker() {
  const t = useTranslations("tools.contrast-checker");
  const [fg, setFg] = useState("#0f172a");
  const [bg, setBg] = useState("#ffffff");

  const ratio = useMemo(() => contrastRatio(fg, bg), [fg, bg]);
  const grades = useMemo(() => {
    if (!ratio) return null;
    return {
      aaNormal: ratio >= 4.5,
      aaLarge: ratio >= 3.0,
      aaaNormal: ratio >= 7.0,
      aaaLarge: ratio >= 4.5,
    };
  }, [ratio]);

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">{t("input.fg")}</span>
          <div className="mt-1 flex gap-2">
            <input type="color" value={fg} onChange={(e) => setFg(e.target.value)} className="h-10 w-12 rounded border border-slate-300 dark:border-slate-700" />
            <input value={fg} onChange={(e) => setFg(e.target.value)} className="flex-1 rounded border border-slate-300 px-3 py-2 font-mono dark:border-slate-700 dark:bg-slate-900" />
          </div>
        </label>
        <label className="block">
          <span className="text-sm font-medium">{t("input.bg")}</span>
          <div className="mt-1 flex gap-2">
            <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="h-10 w-12 rounded border border-slate-300 dark:border-slate-700" />
            <input value={bg} onChange={(e) => setBg(e.target.value)} className="flex-1 rounded border border-slate-300 px-3 py-2 font-mono dark:border-slate-700 dark:bg-slate-900" />
          </div>
        </label>
      </div>

      <div className="mt-6 rounded-lg border border-slate-200 p-6 dark:border-slate-800" style={{ backgroundColor: bg, color: fg }}>
        <div className="text-2xl font-bold">{t("preview.large")}</div>
        <div className="mt-2 text-base">{t("preview.normal")}</div>
        <div className="mt-1 text-sm">{t("preview.small")}</div>
      </div>

      <div aria-live="polite" className="mt-6">
        {ratio && grades ? (
          <>
            <div className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">{t("result.label")}</div>
            <div className="mt-1 text-4xl font-bold tabular-nums">{ratio.toFixed(2)}:1</div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <Badge ok={grades.aaNormal} label={t("badge.aaNormal")} />
              <Badge ok={grades.aaLarge} label={t("badge.aaLarge")} />
              <Badge ok={grades.aaaNormal} label={t("badge.aaaNormal")} />
              <Badge ok={grades.aaaLarge} label={t("badge.aaaLarge")} />
            </div>
          </>
        ) : (
          <div className="text-sm text-slate-600 dark:text-slate-400">{t("empty")}</div>
        )}
      </div>
    </div>
  );
}

function Badge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className={`flex items-center gap-2 rounded border px-3 py-2 text-sm ${ok ? "border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/30" : "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/30"}`}>
      <span className={`text-lg ${ok ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>{ok ? "✓" : "✗"}</span>
      <span>{label}</span>
    </div>
  );
}
