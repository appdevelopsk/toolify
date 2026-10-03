"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

interface Item {
  id: number;
  name: string;
  price: string;
  quantity: string;
  unit: string;
}

let nextId = 1;

// 単位が重さ・体積として読める時だけ、g / ml あたりへ揃えて比較と換算表示をする。
// 読めない単位（個・枚など自由入力）は従来どおり入力値のまま割るだけ。
type Dim = "w" | "v";
const UNITS: Record<string, { dim: Dim; f: number }> = {
  mg: { dim: "w", f: 0.001 }, g: { dim: "w", f: 1 }, kg: { dim: "w", f: 1000 },
  oz: { dim: "w", f: 28.349523125 }, lb: { dim: "w", f: 453.59237 },
  ml: { dim: "v", f: 1 }, l: { dim: "v", f: 1000 }, "fl oz": { dim: "v", f: 29.5735295625 },
};
const ALIASES: Record<string, string> = {
  gram: "g", grams: "g", "グラム": "g", kilogram: "kg", kilograms: "kg", kilo: "kg", "キログラム": "kg", "キロ": "kg",
  ounce: "oz", ounces: "oz", "オンス": "oz", lbs: "lb", pound: "lb", pounds: "lb", "ポンド": "lb",
  milliliter: "ml", milliliters: "ml", millilitre: "ml", "ミリリットル": "ml", cc: "ml",
  liter: "l", liters: "l", litre: "l", litres: "l", "リットル": "l",
  floz: "fl oz", "fluid ounce": "fl oz", "fluid ounces": "fl oz", "fluid oz": "fl oz",
};
const SHOW: Record<Dim, string[]> = { w: ["g", "oz", "lb", "kg"], v: ["ml", "fl oz", "l"] };
function unitKey(raw: string): string | null {
  const k = raw.trim().toLowerCase().replace(/\./g, "").replace(/\s+/g, " ");
  const u = ALIASES[k] ?? k;
  return u in UNITS ? u : null;
}

export default function UnitPriceCalculator() {
  const t = useTranslations("tools.unit-price-calculator");
  const locale = useLocale();
  const [items, setItems] = useState<Item[]>([
    { id: nextId++, name: "", price: "10", quantity: "500", unit: "g" },
    { id: nextId++, name: "", price: "18", quantity: "1000", unit: "g" },
  ]);

  const computed = useMemo(() => {
    const out = items.map((it) => {
      const p = parseFloat(it.price);
      const q = parseFloat(it.quantity);
      const valid = isFinite(p) && isFinite(q) && p > 0 && q > 0;
      const key = unitKey(it.unit);
      const meta = key ? UNITS[key] : undefined;
      return {
        ...it,
        unitPrice: valid ? p / q : null,
        key,
        dim: meta ? meta.dim : null,
        // g（重さ）または ml（体積）あたりの価格
        basePrice: valid && meta ? p / q / meta.f : null,
      };
    });
    const valid = out.filter((x) => x.unitPrice !== null);
    if (valid.length === 0) return out.map((x) => ({ ...x, isCheapest: false }));
    // 全品が同じ種類（重さ同士・体積同士）の単位なら、単位が違っても g / ml あたりで比べる
    const dims = new Set(valid.map((x) => x.dim));
    const pick = dims.size === 1 && !dims.has(null) ? (x: (typeof out)[number]) => x.basePrice : (x: (typeof out)[number]) => x.unitPrice;
    const min = Math.min(...valid.map((x) => pick(x) as number));
    return out.map((x) => ({ ...x, isCheapest: x.unitPrice !== null && pick(x) === min }));
  }, [items]);

  const currency = useMemo(
    () => new Intl.NumberFormat(locale, { style: "currency", currency: locale === "ja" ? "JPY" : "USD", maximumFractionDigits: locale === "ja" ? 2 : 4 }),
    [locale],
  );

  function update(id: number, patch: Partial<Item>) {
    setItems((arr) => arr.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }
  function addItem() {
    setItems((arr) => [...arr, { id: nextId++, name: "", price: "", quantity: "", unit: arr[0]?.unit ?? "g" }]);
  }
  function remove(id: number) {
    setItems((arr) => (arr.length <= 2 ? arr : arr.filter((c) => c.id !== id)));
  }

  return (
    <div>
      <div className="space-y-3">
        {computed.map((it) => (
          <div key={it.id} className={`rounded-lg border p-3 ${it.isCheapest ? "border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/30" : "border-slate-200 dark:border-slate-800"}`}>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_120px_120px_80px_auto] sm:items-end">
              <label className="block">
                <span className="text-xs uppercase text-slate-600 dark:text-slate-400">{t("input.name")}</span>
                <input value={it.name} onChange={(e) => update(it.id, { name: e.target.value })} placeholder={t("input.namePlaceholder")} className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900" />
              </label>
              <label className="block">
                <span className="text-xs uppercase text-slate-600 dark:text-slate-400">{t("input.price")}</span>
                <input inputMode="decimal" value={it.price} onChange={(e) => update(it.id, { price: e.target.value })} className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm tabular-nums dark:border-slate-700 dark:bg-slate-900" />
              </label>
              <label className="block">
                <span className="text-xs uppercase text-slate-600 dark:text-slate-400">{t("input.quantity")}</span>
                <input inputMode="decimal" value={it.quantity} onChange={(e) => update(it.id, { quantity: e.target.value })} className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm tabular-nums dark:border-slate-700 dark:bg-slate-900" />
              </label>
              <label className="block">
                <span className="text-xs uppercase text-slate-600 dark:text-slate-400">{t("input.unit")}</span>
                <input value={it.unit} onChange={(e) => update(it.id, { unit: e.target.value })} className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900" />
              </label>
              <button onClick={() => remove(it.id)} aria-label={t("remove")} disabled={items.length <= 2} className="text-slate-400 hover:text-red-600 disabled:opacity-30">×</button>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">{t("result.unitPriceLabel")}</span>
              <div className="flex items-center gap-2">
                <span className="font-mono tabular-nums text-base font-semibold">
                  {it.unitPrice !== null ? `${currency.format(it.unitPrice)} / ${it.unit}` : "—"}
                </span>
                {it.isCheapest && <span className="rounded bg-emerald-200 px-2 py-0.5 text-xs font-bold text-emerald-900 dark:bg-emerald-800 dark:text-emerald-100">{t("cheapest")}</span>}
              </div>
            </div>
            {it.basePrice !== null && it.dim && (
              <div data-unit-equivalents className="mt-1 text-right font-mono text-xs tabular-nums text-slate-600 dark:text-slate-400">
                {SHOW[it.dim]
                  .filter((u) => u !== it.key)
                  .map((u) => `${currency.format((it.basePrice as number) * (UNITS[u]?.f ?? 1))} / ${u}`)
                  .join(" · ")}
              </div>
            )}
          </div>
        ))}
      </div>
      <button onClick={addItem} className="mt-3 rounded border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">
        + {t("addItem")}
      </button>
    </div>
  );
}
