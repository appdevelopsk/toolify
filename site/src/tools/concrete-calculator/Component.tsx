"use client";

import { useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";

export default function ConcreteCalculator() {
  const t = useTranslations("tools.concrete-calculator");
  const locale = useLocale();
  // 空欄で着地すると結果が何も描かれず、道具が動くことが伝わらないまま離脱する。
  // 代表値を初期表示し、最初の描画から結果を見せる(2026-08-22)。
  const [length, setLength] = useState(() => "10");
  const [width, setWidth] = useState(() => "10");
  const [thickness, setThickness] = useState(() => "4");

  const result = useMemo(() => {
    const l = parseFloat(length), w = parseFloat(width), th = parseFloat(thickness);
    if (![l, w, th].every(isFinite) || l <= 0 || w <= 0 || th <= 0) return null;
    const cuyd = (l * w * (th / 12)) / 27;
    return { cuyd, cum: cuyd * 0.764555 };
  }, [length, width, thickness]);

  const fmt = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }), [locale]);

  const field = (label: string, val: string, set: (v: string) => void, ph: string) => (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <input
        inputMode="decimal"
        value={val}
        onChange={(e) => set(e.target.value)}
        placeholder={ph}
        className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
      />
    </label>
  );

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-3">
        {field(t("input.length"), length, setLength, "10")}
        {field(t("input.width"), width, setWidth, "10")}
        {field(t("input.thickness"), thickness, setThickness, "4")}
      </div>

      <div className="mt-6 rounded-lg bg-brand-50 p-4 dark:bg-slate-800">
        {result === null ? (
          <p className="text-slate-600 dark:text-slate-400">{t("result.empty")}</p>
        ) : (
          <>
            <p className="text-sm text-slate-600 dark:text-slate-400">{t("result.label")}</p>
            <p className="text-3xl font-bold">
              {fmt.format(result.cuyd)} <span className="text-xl font-medium">yd³</span>
              <span className="ml-2 text-base font-normal text-slate-500">≈ {fmt.format(result.cum)} m³</span>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
