"use client";

import { createSlugStore } from "./slugStore";

/**
 * 最近使ったツール slug(最新が先頭、最大 8 件、重複なし)。
 * ツールページのマウント時に `pushRecent` を呼ぶ(RecentTracker)。
 */
export const RECENT_KEY = "toolify_recent_v1";
export const RECENT_MAX = 8;

const store = createSlugStore(RECENT_KEY, { max: RECENT_MAX });

export function pushRecent(slug: string): void {
  const current = store.read();
  if (current[0] === slug) return;
  store.write([slug, ...current.filter((s) => s !== slug)]);
}

export function useRecent(): string[] {
  return store.useSlugs();
}
