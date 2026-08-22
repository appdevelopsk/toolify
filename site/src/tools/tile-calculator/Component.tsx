"use client";

import { useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";

export default function TileCalculator() {
  const t = useTranslations("tools.tile-calculator");
  const locale = useLocale();
  // 空欄で着地すると結果カードが何も描かれず、道具が動くことが伝わらないまま離脱する。
  // 代表値を初期表示し、最初の描画から結果を見せる(2026-08-22)。
  const [roomLength, setRoomLength] = useState("5");
  const [roomWidth, setRoomWidth] = useState("4");
  const [tileSize, setTileSize] = useState("30");

  const result = useMemo(() => {
    const rl = parseFloat(roomLength), rw = parseFloat(roomWidth), ts = parseFloat(tileSize);
    if (![rl, rw, ts].every(isFinite) || rl <= 0 || rw <= 0 || ts <= 0) return null;
    const roomArea = rl * rw; // m²
    const tileArea = (ts / 100) ** 2; // m² per tile
    return Math.ceil((roomArea / tileArea) * 1.1); // +10% waste
  }, [roomLength, roomWidth, tileSize]);

  const fmt = useMemo(() => new Intl.NumberFormat(locale), [locale]);

  const field = (label: string, val: string, set: (v: string) => void, ph: string) => (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <input inputMode="decimal" value={val} onChange={(e) => set(e.target.value)} placeholder={ph}
        className="mt-1 w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
    </label>
  );

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-3">
        {field(t("input.roomLength"), roomLength, setRoomLength, "5")}
        {field(t("input.roomWidth"), roomWidth, setRoomWidth, "4")}
        {field(t("input.tileSize"), tileSize, setTileSize, "30")}
      </div>
      <div className="mt-6 rounded-lg bg-brand-50 p-4 dark:bg-slate-800">
        {result === null ? (
          <p className="text-slate-600 dark:text-slate-400">{t("result.empty")}</p>
        ) : (
          <>
            <p className="text-sm text-slate-600 dark:text-slate-400">{t("result.label")}</p>
            <p className="text-3xl font-bold">{fmt.format(result)}</p>
          </>
        )}
      </div>
    </div>
  );
}
