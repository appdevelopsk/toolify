"use client";

import { useEffect } from "react";
import { trackAffiliateClick } from "./events";

/**
 * 提携リンクのクリックを GA4 `affiliate_click` で送る(2026-10-15 監査 T3)。
 *
 * RelatedServices はサーバーコンポーネントなので onClick を持てない。Pickly の
 * AffiliateClickTracker と同じく document で一括して拾い、`a[data-offer-id]` だけを対象にする。
 * layout に1つだけ置く(枠が複数あっても二重送信しない)。
 */
export function AffiliateClickTracker() {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const link = (e.target as Element | null)?.closest?.("a[data-offer-id]") as HTMLAnchorElement | null;
      if (!link) return;
      const d = link.dataset;
      trackAffiliateClick({
        offer_id: d.offerId ?? "unknown",
        network: d.network,
        link_url: link.href,
        placement: d.placement,
        category: d.offerCategory,
        tool: d.tool,
        locale: document.documentElement.lang || undefined,
      });
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);
  return null;
}
