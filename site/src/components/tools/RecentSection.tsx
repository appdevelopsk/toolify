"use client";

import { SavedToolsSection, type FavItem } from "./SavedToolsSection";

/** 最近使ったツール(最大8件・新しい順)。items 省略時は検索インデックスを遅延取得する。 */
export function RecentSection({ items, className }: { items?: FavItem[]; className?: string }) {
  return <SavedToolsSection kind="recent" items={items} className={className} />;
}
