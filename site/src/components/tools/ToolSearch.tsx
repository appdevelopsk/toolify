"use client";

import { useCallback, useMemo, useRef, useState, useId } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/lib/i18n/navigation";
import { ToolCard } from "@/components/tools/ToolCard";
import type { FavItem } from "@/components/tools/FavoritesSection";
import { searchTools } from "@/lib/search/matcher";
import { useCategoryKeywords } from "@/lib/search/useCategoryKeywords";
import { useSearchShortcut } from "@/lib/search/useSearchShortcut";
import { useDebouncedSearchEvent } from "@/lib/search/useDebouncedSearchEvent";

const LIMIT = 10;

/**
 * /tools のサイト内検索。
 *
 * 背景: 200本超のツールがカテゴリ別にベタ並びしているだけで、絞り込む手段が
 * 一切なかった(2026-08-22 時点)。外部検索エンジンに出すのではなく、サイト内で
 * 完結させる。
 *
 * 2026-09-08: 照合をヘッダー検索と共通の `searchTools`(タイトル/slug の前方一致 >
 * 部分一致 > 主キーワード > カテゴリ語 > 説明文)に統一し、上位10件に絞った。
 * `/` でフォーカス、Enter で先頭候補を開く、Esc でクリア。GA4 `tool_search` は
 * 入力が落ち着いてから1回だけ送る。入力が空のときは何も描画せず、既存の
 * カテゴリ別一覧をそのまま見せる(レイアウトシフトを起こさない)。
 */
export function ToolSearch({ items }: { items: FavItem[] }) {
  const t = useTranslations("tool");
  const locale = useLocale();
  const router = useRouter();
  const categoryKeywords = useCategoryKeywords();
  const [q, setQ] = useState("");
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const query = q.trim();

  const hits = useMemo(() => {
    if (!query) return null;
    return searchTools(items, query, { limit: LIMIT, categoryKeywords });
  }, [items, query, categoryKeywords]);

  useDebouncedSearchEvent(query, hits?.length ?? 0, locale, "tools_page");

  // /tools ではページ内検索がヘッダー検索より優先(priority 10 > 0)。
  const focus = useCallback(() => inputRef.current?.focus(), []);
  useSearchShortcut(focus, 10);

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    const first = hits?.[0];
    if (e.key === "Enter" && first) {
      e.preventDefault();
      router.push(`/tools/${first.slug}`);
    } else if (e.key === "Escape") {
      setQ("");
      inputRef.current?.blur();
    }
  }

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
          ref={inputRef}
          id={inputId}
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={t("search", { n: items.length })}
          autoComplete="off"
          data-tool-search-primary
          className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-900"
        />
        <kbd
          className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-slate-300 px-1.5 py-0.5 text-[11px] text-slate-400 dark:border-slate-700 sm:block"
          aria-hidden
        >
          /
        </kbd>
      </div>
      <p className="mt-1.5 hidden text-xs text-slate-500 dark:text-slate-400 sm:block">{t("searchHint")}</p>

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
                  <ToolCard key={it.slug} meta={it} title={it.title} description={it.description ?? ""} />
                ))}
              </div>
            </>
          )}
        </section>
      )}
    </div>
  );
}
