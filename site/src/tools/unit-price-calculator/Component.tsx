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
      return {
        ...it,
        unitPrice: valid ? p / q : null,
      };
    });
    const valid = out.filter((x) => x.unitPrice !== null);
    if (valid.length === 0) return out.map((x) => ({ ...x, isCheapest: false }));
    const min = Math.min(...valid.map((x) => x.unitPrice as number));
    return out.map((x) => ({ ...x, isCheapest: x.unitPrice !== null && x.unitPrice === min }));
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
          </div>
        ))}
      </div>
      <button onClick={addItem} className="mt-3 rounded border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">
        + {t("addItem")}
      </button>
    </div>
  );
}
