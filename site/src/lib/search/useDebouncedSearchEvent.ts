"use client";

import { useEffect } from "react";
import { trackToolSearch } from "@/lib/analytics/events";

/** クエリが落ち着いてから 600ms 後に1回だけ tool_search を送る(キー入力ごとには送らない)。 */
export function useDebouncedSearchEvent(query: string, resultsCount: number, locale: string, source: string) {
  useEffect(() => {
    const q = query.trim();
    if (!q) return;
    const id = window.setTimeout(() => {
      trackToolSearch({ query_length: q.length, results_count: resultsCount, locale, source });
    }, 600);
    return () => window.clearTimeout(id);
  }, [query, resultsCount, locale, source]);
}
