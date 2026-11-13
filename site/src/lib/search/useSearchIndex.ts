"use client";

import { useEffect, useState } from "react";
import type { SearchItem } from "./matcher";
import { parseSearchIndexPayload } from "./search-index-payload";

/**
 * Load the localized search index only when a user needs it, without adding
 * 223 localized tool titles to every page's client payload.
 *
 * A network error or an invalid/empty catalog is NOT "zero search matches".
 * Preserve this distinction so the interface offers a retry and GA4 does not
 * mistakenly record an unavailable index as an unsuccessful user search.
 */
export type SearchIndexResult = {
  items: SearchItem[];
  failed: boolean;
};

const cache = new Map<string, Promise<SearchIndexResult>>();

export function loadSearchIndexResult(locale: string): Promise<SearchIndexResult> {
  let p = cache.get(locale);
  if (!p) {
    p = fetch(`/${locale}/search-index.json`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((payload: unknown): SearchIndexResult => {
        const items = parseSearchIndexPayload(payload);
        // This site publishes hundreds of tools in each active locale; an
        // empty parsed index means an unavailable/invalid catalog, not no tools.
        if (items.length === 0) throw new Error("Search index unavailable");
        return { items, failed: false };
      })
      .catch((): SearchIndexResult => {
        // Never cache failures; retry should fetch a fresh index.
        cache.delete(locale);
        return { items: [], failed: true };
      });
    cache.set(locale, p);
  }
  return p;
}

/** Backward-compatible array API used by recent/favorite recommendations. */
export function loadSearchIndex(locale: string): Promise<SearchItem[]> {
  return loadSearchIndexResult(locale).then((result) => result.items);
}

export function useSearchIndex(locale: string, enabled: boolean): SearchItem[] | null {
  // Associate data with the locale that produced it to avoid flashing stale labels
  // when a visitor switches languages while a different index is loading.
  const [loaded, setLoaded] = useState<{ locale: string; items: SearchItem[] } | null>(null);
  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    loadSearchIndex(locale).then((list) => {
      if (alive) setLoaded({ locale, items: list });
    });
    return () => {
      alive = false;
    };
  }, [locale, enabled]);
  return enabled && loaded?.locale === locale ? loaded.items : null;
}

/** Search UI also needs an explicit offline/error state and a retry action. */
export function useSearchIndexStatus(locale: string, enabled: boolean): {
  items: SearchItem[] | null;
  failed: boolean;
  retry: () => void;
} {
  const [loaded, setLoaded] = useState<{ locale: string; result: SearchIndexResult } | null>(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    loadSearchIndexResult(locale).then((result) => {
      if (alive) setLoaded({ locale, result });
    });
    return () => { alive = false; };
  }, [locale, enabled, attempt]);
  const result = enabled && loaded?.locale === locale ? loaded.result : null;
  return {
    items: result && !result.failed ? result.items : null,
    failed: result?.failed ?? false,
    retry: () => {
      setLoaded(null);
      setAttempt((previous) => previous + 1);
    },
  };
}
