"use client";

import { useEffect, useState } from "react";
import type { SearchItem } from "./matcher";

/**
 * ロケール別の検索インデックス(/{locale}/search-index.json)を遅延取得する。
 *
 * なぜ fetch か: レイアウトがクライアントへ渡すメッセージは common のみで、
 * 223 ツールのローカライズ済みタイトルはクライアントバンドルに無い。
 * 全ページのヘッダーに 223 件分を props で埋め込むと毎ページ十数 KB 増えるため、
 * 検索欄にフォーカスした時(またはお気に入り/最近が存在する時)に1回だけ取得し、
 * モジュールスコープでキャッシュする。
 */
const cache = new Map<string, Promise<SearchItem[]>>();

export function loadSearchIndex(locale: string): Promise<SearchItem[]> {
  let p = cache.get(locale);
  if (!p) {
    p = fetch(`/${locale}/search-index.json`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((j: { tools?: SearchItem[] }) => j.tools ?? [])
      .catch(() => {
        cache.delete(locale);
        return [] as SearchItem[];
      });
    cache.set(locale, p);
  }
  return p;
}

export function useSearchIndex(locale: string, enabled: boolean): SearchItem[] | null {
  const [items, setItems] = useState<SearchItem[] | null>(null);
  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    loadSearchIndex(locale).then((list) => {
      if (alive) setItems(list);
    });
    return () => {
      alive = false;
    };
  }, [locale, enabled]);
  return items;
}
