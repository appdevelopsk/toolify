"use client";

import { useSyncExternalStore } from "react";

/**
 * localStorage に slug 配列を保持する小さなストアの共通実装。
 * favorites / recent の2用途で同じ「キャッシュ + リスナー + 他タブ同期 +
 * useSyncExternalStore」が要るため、ここに一本化する。
 *
 * - SSR / 初回ハイドレーション時は必ず EMPTY を返す(サーバースナップショット)。
 *   localStorage の中身はハイドレーション後に反映されるので不一致は起きない。
 * - `legacyKey` を渡すと、新キーが空のときだけ旧キーから1回だけ読み取り、
 *   新キーへ書き写す(キー名変更時の移行用。旧キーは消さない)。
 */
export type SlugStore = {
  key: string;
  read: () => string[];
  write: (next: string[]) => void;
  subscribe: (cb: () => void) => () => void;
  useSlugs: () => string[];
};

const EMPTY: string[] = [];

function parse(raw: string | null): string[] | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v.filter((s): s is string => typeof s === "string") : null;
  } catch {
    return null;
  }
}

export function createSlugStore(key: string, opts: { legacyKey?: string; max?: number } = {}): SlugStore {
  const listeners = new Set<() => void>();
  let cache: string[] | null = null;

  function read(): string[] {
    if (cache) return cache;
    if (typeof window === "undefined") return EMPTY;
    try {
      let list = parse(window.localStorage.getItem(key));
      if (list === null && opts.legacyKey) {
        list = parse(window.localStorage.getItem(opts.legacyKey));
        if (list && list.length) window.localStorage.setItem(key, JSON.stringify(list));
      }
      cache = list ?? [];
    } catch {
      cache = [];
    }
    return cache;
  }

  function write(next: string[]) {
    const trimmed = opts.max ? next.slice(0, opts.max) : next;
    cache = trimmed;
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(key, JSON.stringify(trimmed));
      } catch {
        /* storage full / unavailable — keep in-memory only */
      }
    }
    listeners.forEach((l) => l());
  }

  function subscribe(cb: () => void) {
    listeners.add(cb);
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) {
        cache = null; // force re-read from the other tab's write
        cb();
      }
    };
    if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(cb);
      if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
    };
  }

  function useSlugs() {
    return useSyncExternalStore(subscribe, read, () => EMPTY);
  }

  return { key, read, write, subscribe, useSlugs };
}
