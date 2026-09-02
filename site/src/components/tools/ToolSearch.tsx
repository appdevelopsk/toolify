"use client";

import { useMemo, useState, useId } from "react";
import { useTranslations } from "next-intl";
import { ToolCard } from "@/components/tools/ToolCard";
import type { FavItem } from "@/components/tools/FavoritesSection";

/**
 * /tools のサイト内検索。
 *
 * 背景: 200本超のツールがカテゴリ別にベタ並びしているだけで、絞り込む手段が
 * 一切なかった(2026-08-22 時点)。目的のツールに辿り着けないことが回遊ゼロの
 * 構造要因のひとつ。外部検索エンジンに出す(fxea365 の Google 外部検索と同じ轍)
 * のではなく、サイト内で完結させる。
 *
 * 実装: 全件が既にサーバー側で描画済みなので、クライアントで絞り込むだけで済む。
 * インデックスも API も不要。入力が空のときは何も描画せず、既存の
 * カテゴリ別一覧をそのまま見せる(レイアウトシフトを起こさない)。
 *
 * 照合対象は「ローカライズ済みタイトル + 説明文 + slug」。slug を含めるのは
 * 非英語ロケールでも "bmi" のような英語表記で打つ利用者が多いため。
 */
export function ToolSearch({ items }: { items: FavItem[] }) {
  const t = useTranslations("tool");
  const [q, setQ] = useState("");
  const inputId = useId();

  const query = q.trim().toLowerCase();

  const hits = useMemo(() => {
    if (!query) return null;
    return items.filter((it) => {
      const hay = `${it.title} ${it.description} ${it.meta.slug}`.toLowerCase();
      return hay.includes(query);
    });
  }, [items, query]);

  return (
    <div className="mt-6">
      <label htmlFor={inputId} className="sr-only">
        {t("search", { n: items.length })}
      </label>
      <div className="relative">
        <span
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          aria-hidden
        >
          🔍
        </span>
        <input
          id={inputId}
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("search", { n: items.length })}
          autoComplete="off"
          className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-900"
        />
      </div>

      {hits !== null && (
        <section className="mt-6" aria-live="polite">
          {hits.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
              {t("searchNoResults")}
            </p>
          ) : (
            <>
              <div className="border-b border-slate-200 pb-3 text-sm font-medium text-slate-600 dark:border-slate-800 dark:text-slate-400">
                {t("searchResults", { n: hits.length })}
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {hits.map((it) => (
                  <ToolCard key={it.meta.slug} meta={it.meta} title={it.title} description={it.description} />
                ))}
              </div>
            </>
          )}
        </section>
      )}
    </div>
  );
}
