"use client";

import { useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";

export default function SquareRootCalculator() {
  const t = useTranslations("tools.square-root-calculator");
  const locale = useLocale();
  const [value, setValue] = useState("");

  const result = useMemo(() => {
    const v = parseFloat(value);
    if (!isFinite(v) || v < 0) return null;
    return { sqrt: Math.sqrt(v), cbrt: Math.cbrt(v) };
  }, [value]);

  const fmt = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 6 }), [locale]);

  return (
    <div>
      <label className="block max-w-xs">
        <span className="text-sm font-medium">{t("input.value")}</span>
        <input inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)} placeholder="2"
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
      </label>
      <div className="mt-6 rounded-lg bg-brand-50 p-4 dark:bg-slate-800">
        {result === null ? (
          <p className="text-slate-600 dark:text-slate-400">{t("result.empty")}</p>
        ) : (
          <>
            <p className="text-sm text-slate-600 dark:text-slate-400">{t("result.label")}</p>
            <p className="text-3xl font-bold">
              √ = {fmt.format(result.sqrt)}
              <span className="ml-2 text-base font-normal text-slate-500">∛ = {fmt.format(result.cbrt)}</span>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
