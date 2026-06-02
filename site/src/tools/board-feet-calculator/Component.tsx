"use client";

import { useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";

export default function BoardFeetCalculator() {
  const t = useTranslations("tools.board-feet-calculator");
  const locale = useLocale();
  const [thickness, setThickness] = useState("");
  const [width, setWidth] = useState("");
  const [length, setLength] = useState("");
  const [quantity, setQuantity] = useState("1");

  const result = useMemo(() => {
    const th = parseFloat(thickness), w = parseFloat(width), l = parseFloat(length), q = parseFloat(quantity);
    if (![th, w, l, q].every(isFinite) || th <= 0 || w <= 0 || l <= 0 || q <= 0) return null;
    return ((th * w * l) / 12) * q;
  }, [thickness, width, length, quantity]);

  const fmt = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }), [locale]);

  const field = (label: string, val: string, set: (v: string) => void, ph: string) => (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <input inputMode="decimal" value={val} onChange={(e) => set(e.target.value)} placeholder={ph}
        className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
    </label>
  );

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {field(t("input.thickness"), thickness, setThickness, "1")}
        {field(t("input.width"), width, setWidth, "6")}
        {field(t("input.length"), length, setLength, "8")}
        {field(t("input.quantity"), quantity, setQuantity, "1")}
      </div>
      <div className="mt-6 rounded-lg bg-brand-50 p-4 dark:bg-slate-800">
        {result === null ? (
          <p className="text-slate-600 dark:text-slate-400">{t("result.empty")}</p>
        ) : (
          <>
            <p className="text-sm text-slate-600 dark:text-slate-400">{t("result.label")}</p>
            <p className="text-3xl font-bold">{fmt.format(result)} <span className="text-xl font-medium">BF</span></p>
          </>
        )}
      </div>
    </div>
  );
}
