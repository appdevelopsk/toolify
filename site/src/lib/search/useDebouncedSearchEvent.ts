"use client";

import { useEffect } from "react";
import { trackToolSearch } from "@/lib/analytics/events";

/** クエリが落ち着いてから 600ms 後に1回だけ tool_search を送る(キー入力ごとには送らない)。 */
export function useDebouncedSearchEvent(query: string, resultsCount: number, locale: string, source: string, ready = true) {
  useEffect(() => {
    const q = query.trim();
    // A lazy-loaded header index can still be fetching when the user types.
    // Do not record a false zero-results search until its results are ready.
    if (!q || !ready) return;
    const id = window.setTimeout(() => {
      trackToolSearch({ query_length: q.length, results_count: resultsCount, locale, source });
    }, 600);
    return () => window.clearTimeout(id);
  }, [query, resultsCount, locale, source, ready]);
}
