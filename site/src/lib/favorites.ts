"use client";

import { useCallback } from "react";
import { createSlugStore } from "./slugStore";
import { trackFavoriteToggle } from "./analytics/events";

/**
 * お気に入りツール slug の localStorage ストア。
 * キーは `toolify_favorites_v1`(2026-09-08 に `toolify:favorites` から改名)。
 * 旧キーのデータは初回読み取り時に新キーへ写す(旧キーは残す)。
 */
export const FAVORITES_KEY = "toolify_favorites_v1";

const store = createSlugStore(FAVORITES_KEY, { legacyKey: "toolify:favorites" });

export function useFavorites(locale?: string) {
  const favorites = store.useSlugs();

  const toggle = useCallback(
    (slug: string) => {
      const current = store.read();
      const on = !current.includes(slug);
      store.write(on ? [slug, ...current] : current.filter((s) => s !== slug));
      trackFavoriteToggle({ tool: slug, locale, state: on ? "on" : "off" });
    },
    [locale],
  );

  const isFavorite = useCallback((slug: string) => favorites.includes(slug), [favorites]);

  return { favorites, toggle, isFavorite };
}
