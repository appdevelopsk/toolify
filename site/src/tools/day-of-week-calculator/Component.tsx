"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";

function pad(n: number) {
  return String(n).padStart(2, "0");
}
function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default function DayOfWeekCalculator() {
  const t = useTranslations("tools.day-of-week-calculator");
  const locale = useLocale();
  const [date, setDate] = useState("");

  // 空欄で着地すると結果が何も描かれず、道具が動くことが伝わらないまま離脱する。
  // 「今日は何曜日」を初期表示する。SSRとCSRで値がズレる(hydration mismatch)ため
  // useState 初期化ではなくマウント後にセットする(2026-08-22)。
  useEffect(() => {
    setDate((prev) => (prev === "" ? todayIso() : prev));
  }, []);

  const result = useMemo(() => {
    if (!date) return null;
    const d = new Date(`${date}T00:00:00`);
    if (isNaN(d.getTime())) return null;
    return new Intl.DateTimeFormat(locale, { weekday: "long" }).format(d);
  }, [date, locale]);

  return (
    <div>
      <label className="block max-w-xs">
        <span className="text-sm font-medium">{t("input.date")}</span>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
        />
      </label>
      <div className="mt-6 rounded-lg bg-brand-50 p-4 dark:bg-slate-800">
        {result === null ? (
          <p className="text-slate-600 dark:text-slate-400">{t("result.empty")}</p>
        ) : (
          <>
            <p className="text-sm text-slate-600 dark:text-slate-400">{t("result.label")}</p>
            <p className="text-3xl font-bold capitalize">{result}</p>
          </>
        )}
      </div>
    </div>
  );
}
