"use client";

import { SavedToolsSection, type FavItem } from "./SavedToolsSection";

export type { FavItem };

/** お気に入りセクション。items 省略時は検索インデックスを遅延取得する。 */
export function FavoritesSection({ items, className }: { items?: FavItem[]; className?: string }) {
  return <SavedToolsSection kind="favorites" items={items} className={className} />;
}
