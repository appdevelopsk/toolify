"use client";

import { useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";

export default function SlopeCalculator() {
  const t = useTranslations("tools.slope-calculator");
  const locale = useLocale();
  const [x1, setX1] = useState("");
  const [y1, setY1] = useState("");
  const [x2, setX2] = useState("");
  const [y2, setY2] = useState("");

  const result = useMemo(() => {
    const a = parseFloat(x1), b = parseFloat(y1), c = parseFloat(x2), d = parseFloat(y2);
    if (![a, b, c, d].every(isFinite)) return null;
    if (c === a) return { vertical: true as const };
    const slope = (d - b) / (c - a);
    return {
      vertical: false as const,
      slope,
      angle: (Math.atan(slope) * 180) / Math.PI,
      grade: slope * 100,
    };
  }, [x1, y1, x2, y2]);

  const fmt = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 4 }), [locale]);
  const fmt2 = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }), [locale]);

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
      <div className="grid gap-4 sm:grid-cols-2">
        {field(t("input.x1"), x1, setX1, "1")}
        {field(t("input.y1"), y1, setY1, "2")}
        {field(t("input.x2"), x2, setX2, "4")}
        {field(t("input.y2"), y2, setY2, "8")}
      </div>

      <div className="mt-6 rounded-lg bg-brand-50 p-4 dark:bg-slate-800">
        {result === null ? (
          <p className="text-slate-600 dark:text-slate-400">{t("result.empty")}</p>
        ) : result.vertical ? (
          <p className="text-2xl font-bold">{t("result.vertical")}</p>
        ) : (
          <dl className="grid gap-3 sm:grid-cols-3">
            <div>
              <dt className="text-sm text-slate-600 dark:text-slate-400">{t("result.slope")}</dt>
              <dd className="text-2xl font-bold">{fmt.format(result.slope)}</dd>
            </div>
            <div>
              <dt className="text-sm text-slate-600 dark:text-slate-400">{t("result.angle")}</dt>
              <dd className="text-2xl font-bold">{fmt2.format(result.angle)}°</dd>
            </div>
            <div>
              <dt className="text-sm text-slate-600 dark:text-slate-400">{t("result.grade")}</dt>
              <dd className="text-2xl font-bold">{fmt2.format(result.grade)}%</dd>
            </div>
          </dl>
        )}
      </div>
    </div>
  );
}
