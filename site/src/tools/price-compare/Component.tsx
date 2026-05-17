"use client";

import { useState, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";

interface Item {
  name: string;
  price: number;
  url: string;
  image: string | null;
  shop: string;
  reviewCount: number;
  reviewAverage: number;
}

export default function PriceCompare() {
  const t = useTranslations("tools.price-compare");
  const locale = useLocale();
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fmt = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  });

  const search = useCallback(async () => {
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    setError(null);
    setItems([]);
    setSearched(false);
    try {
      const res = await fetch(`/api/price-search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "error");
      setItems(data.items ?? []);
    } catch {
      setError(t("fetchError"));
    } finally {
      setLoading(false);
      setSearched(true);
    }
  }, [query, t]);

  const amazonTag = process.env.NEXT_PUBLIC_AMAZON_PARTNER_TAG;
  const amazonUrl = `https://www.amazon.co.jp/s?k=${encodeURIComponent(query.trim())}${amazonTag ? `&tag=${amazonTag}` : ""}`;

  return (
    <div>
      {/* 検索バー */}
      <div className="flex gap-2 mb-6">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && search()}
          placeholder={t("placeholder")}
          className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
        />
        <button
          onClick={search}
          disabled={loading || !query.trim()}
          className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-brand-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "…" : t("search")}
        </button>
      </div>

      {/* エラー */}
      {error && (
        <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">
          {error}
        </p>
      )}

      {/* 結果なし */}
      {searched && !error && items.length === 0 && (
        <p className="text-sm text-slate-500">{t("noResults")}</p>
      )}

      {/* 楽天結果 */}
      {items.length > 0 && (
        <>
          <p className="mb-3 text-xs text-slate-500">
            {t("rakutenResults", { count: items.length })}
          </p>
          <ul className="space-y-2">
            {items.map((item, i) => (
              <li key={i}>
                <a
                  href={item.url}
                  target="_blank"
                  rel="sponsored noopener noreferrer"
                  className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 transition-colors hover:border-brand-400 hover:bg-brand-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
                >
                  {/* 順位バッジ */}
                  <span
                    className={`flex-shrink-0 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                      i === 0
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {i + 1}
                  </span>

                  {/* 商品画像 */}
                  {item.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image}
                      alt=""
                      width={56}
                      height={56}
                      className="h-14 w-14 flex-shrink-0 rounded object-contain"
                    />
                  )}

                  {/* 商品名・ショップ */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-2 leading-snug">
                      {item.name}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">{item.shop}</p>
                    {item.reviewCount > 0 && (
                      <p className="mt-0.5 text-xs text-slate-400">
                        ★ {item.reviewAverage.toFixed(1)} ({item.reviewCount})
                      </p>
                    )}
                  </div>

                  {/* 価格 */}
                  <div className="flex-shrink-0 text-right">
                    <p className="text-base font-bold text-brand-600">
                      {fmt.format(item.price)}
                    </p>
                    {i === 0 && (
                      <span className="mt-0.5 inline-block rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                        {t("cheapest")}
                      </span>
                    )}
                  </div>
                </a>
              </li>
            ))}
          </ul>

          {/* Amazon 誘導 */}
          <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
            <p className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">
              {t("alsoCheck")}
            </p>
            <a
              href={amazonUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-600 hover:underline dark:text-amber-400"
            >
              🛒 {t("searchAmazon")} →
            </a>
          </div>
        </>
      )}
    </div>
  );
}
