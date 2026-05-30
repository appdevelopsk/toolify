"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { siteConfig } from "@/lib/config";

/**
 * SPA（クライアントサイド遷移）でも page_view を送る。
 * gtag('config') は初回ロードの 1 回しか page_view を送らないため、
 * Next.js のソフトナビゲーションでツール間を移動するとページビューが計測されない。
 * usePathname の変化を監視して手動で page_view を送出する。
 */
export function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!siteConfig.analytics.gaId) return;
    if (typeof window === "undefined" || typeof window.gtag !== "function") return;
    const query = searchParams?.toString();
    const path = query ? `${pathname}?${query}` : pathname;
    window.gtag("event", "page_view", {
      page_path: path,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [pathname, searchParams]);

  return null;
}
