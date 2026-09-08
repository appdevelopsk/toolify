"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/lib/i18n/navigation";
import { CATEGORY_CONFIG } from "@/lib/tools/categories";
import { searchTools } from "@/lib/search/matcher";
import { useSearchIndex } from "@/lib/search/useSearchIndex";
import { useCategoryKeywords } from "@/lib/search/useCategoryKeywords";
import { useSearchShortcut } from "@/lib/search/useSearchShortcut";
import { useDebouncedSearchEvent } from "@/lib/search/useDebouncedSearchEvent";

const LIMIT = 10;

/**
 * 全ページ共通のヘッダー検索。
 *
 * - デスクトップ(sm以上): 常時表示の入力欄 + 下に候補ドロップダウン(上位10件)。
 * - モバイル: 🔍 アイコンだけ置き、タップでヘッダー直下に入力バーを展開する。
 * - インデックス(/{locale}/search-index.json)はフォーカス時に初めて取得する。
 *   全ページに 200 本分の翻訳済みタイトルを props で載せると毎ページ ~15KB の
 *   RSC ペイロード増になるため、使う人だけが 1 回だけ払う形にした。
 * - `/` でフォーカス(/tools ではページ内検索が優先)、↑↓ で選択、Enter で開く、Esc で閉じる。
 */
export function HeaderSearch() {
  const t = useTranslations("tool");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const categoryKeywords = useCategoryKeywords();
  const listId = useId();

  const [open, setOpen] = useState(false); // モバイルのバー展開
  const [focused, setFocused] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const query = q.trim();
  const index = useSearchIndex(locale, focused || open || query.length > 0);
  const hits = useMemo(
    () => (query && index ? searchTools(index, query, { limit: LIMIT, categoryKeywords }) : []),
    [index, query, categoryKeywords],
  );
  const showList = focused && query.length > 0;

  useDebouncedSearchEvent(query, hits.length, locale, "header");

  const activate = useCallback(() => {
    setOpen(true);
    // モバイルでは展開後に input がマウントされるので次フレームでフォーカスする。
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);
  useSearchShortcut(activate, 0);

  const close = useCallback(() => {
    setOpen(false);
    setFocused(false);
    setQ("");
    setActive(0);
  }, []);

  // ページ遷移で閉じる
  useEffect(() => {
    close();
  }, [pathname, close]);

  // 外側クリックで閉じる
  useEffect(() => {
    if (!focused && !open) return;
    function onDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setFocused(false);
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [focused, open]);

  useEffect(() => setActive(0), [query]);

  function go(slug: string) {
    close();
    inputRef.current?.blur();
    router.push(`/tools/${slug}`);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
      inputRef.current?.blur();
    } else if (e.key === "ArrowDown" && hits.length) {
      e.preventDefault();
      setActive((i) => (i + 1) % hits.length);
    } else if (e.key === "ArrowUp" && hits.length) {
      e.preventDefault();
      setActive((i) => (i - 1 + hits.length) % hits.length);
    } else if (e.key === "Enter" && hits.length) {
      e.preventDefault();
      const target = hits[Math.min(active, hits.length - 1)];
      if (target) go(target.slug);
    }
  }

  const list = showList && (
    <ul
      id={listId}
      role="listbox"
      aria-label={t("searchResults", { n: hits.length })}
      className="max-h-[60vh] overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 text-sm shadow-lg dark:border-slate-700 dark:bg-slate-900 sm:absolute sm:right-0 sm:top-full sm:mt-2 sm:w-80"
    >
      {index === null ? (
        <li className="px-3 py-2 text-slate-500">{t("searchLoading")}</li>
      ) : hits.length === 0 ? (
        <li className="px-3 py-2 text-slate-500">{t("searchNoResults")}</li>
      ) : (
        hits.map((h, i) => (
          <li key={h.slug} role="option" aria-selected={i === active}>
            <Link
              href={`/tools/${h.slug}`}
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => close()}
              className={`flex items-center gap-2 px-3 py-2 ${i === active ? "bg-brand-50 text-brand-700 dark:bg-slate-800 dark:text-brand-400" : "text-slate-700 dark:text-slate-200"}`}
            >
              <span className="text-base" aria-hidden>
                {CATEGORY_CONFIG[h.category].emoji}
              </span>
              <span className="truncate">{h.title}</span>
            </Link>
          </li>
        ))
      )}
    </ul>
  );

  return (
    <div ref={rootRef} className="sm:relative">
      {/* モバイル: アイコンのみ */}
      <button
        type="button"
        onClick={() => (open ? close() : activate())}
        aria-label={open ? t("searchClose") : t("searchOpen")}
        aria-expanded={open}
        className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 sm:hidden"
      >
        <SearchIcon />
      </button>

      <div
        className={
          open
            ? "absolute inset-x-0 top-full z-50 border-b border-slate-200 bg-white p-3 shadow-md dark:border-slate-800 dark:bg-slate-900 sm:static sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none"
            : "hidden sm:block"
        }
      >
        <div className="relative">
          <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden>
            <SearchIcon className="h-4 w-4" />
          </span>
          <input
            ref={inputRef}
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onFocus={() => setFocused(true)}
            onKeyDown={onKeyDown}
            placeholder={t("searchPlaceholder")}
            aria-label={t("searchOpen")}
            aria-controls={listId}
            aria-expanded={showList}
            role="combobox"
            autoComplete="off"
            className="w-full rounded-lg border border-slate-300 bg-white py-1.5 pl-8 pr-3 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-900 sm:w-44 md:w-60"
          />
        </div>
        <div className="mt-2 sm:mt-0">{list}</div>
      </div>
    </div>
  );
}

function SearchIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}
