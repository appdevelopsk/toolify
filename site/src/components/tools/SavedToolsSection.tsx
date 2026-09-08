"use client";

import { useLocale, useTranslations } from "next-intl";
import { ToolCard } from "@/components/tools/ToolCard";
import { useFavorites } from "@/lib/favorites";
import { useRecent } from "@/lib/recent";
import type { SearchItem } from "@/lib/search/matcher";
import { useSearchIndex } from "@/lib/search/useSearchIndex";

/** カード描画に必要な最小情報。/tools ページはサーバーで作って渡す。 */
export type FavItem = Pick<SearchItem, "slug" | "category" | "title" | "description">;

/**
 * 「お気に入り」「最近使ったツール」の共通セクション。
 *
 * - localStorage から slug を読む(useSyncExternalStore、サーバースナップショットは空)。
 *   よって初回訪問者には何も描画せず、レイアウトシフトも起こさない。
 * - `items` が渡されなければ(トップページ)、slug が1件以上ある場合だけ
 *   /{locale}/search-index.json を遅延取得してタイトルを解決する。
 */
export function SavedToolsSection({
  kind,
  items,
  className = "mt-8",
}: {
  kind: "favorites" | "recent";
  items?: FavItem[];
  className?: string;
}) {
  const t = useTranslations("tool");
  const locale = useLocale();
  const { favorites } = useFavorites(locale);
  const recent = useRecent();
  const slugs = kind === "favorites" ? favorites : recent;
  const fetched = useSearchIndex(locale, !items && slugs.length > 0);
  const source: FavItem[] | null = items ?? fetched;

  if (slugs.length === 0 || !source) return null;

  const bySlug = new Map(source.map((it) => [it.slug, it]));
  const picked = slugs.map((s) => bySlug.get(s)).filter((x): x is FavItem => !!x);
  if (picked.length === 0) return null;

  const isFav = kind === "favorites";
  return (
    <section className={`${className} scroll-mt-20`} aria-label={t(isFav ? "favorites" : "recent")}>
      <div className="flex items-center gap-3 border-b border-slate-200 pb-3 dark:border-slate-800">
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-lg text-lg ${isFav ? "bg-amber-100 dark:bg-amber-900/40" : "bg-sky-100 dark:bg-sky-900/40"}`}
          aria-hidden
        >
          {isFav ? "⭐" : "🕘"}
        </span>
        <h2 className="text-xl font-bold">{t(isFav ? "favorites" : "recent")}</h2>
        <span className="ml-auto rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {picked.length}
        </span>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {picked.map((it) => (
          <ToolCard key={it.slug} meta={it} title={it.title} description={it.description ?? ""} />
        ))}
      </div>
    </section>
  );
}
