"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { sanitizePageViewUrl } from "./pageview-url";
import { siteConfig } from "@/lib/config";

/**
 * SPA（クライアントサイド遷移）でも page_view を送る。
 * gtag('config') は初回ロードの 1 回しか page_view を送らないため、
 * Next.js のソフトナビゲーションでツール間を移動するとページビューが計測されない。
 * usePathname の変化を監視して手動で page_view を送出する。
 */
export function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!siteConfig.analytics.gaId) return;
    if (typeof window === "undefined" || typeof window.gtag !== "function") return;
    const safe = sanitizePageViewUrl(window.location.href);
    window.gtag("event", "page_view", {
      ...safe,
      page_title: document.title,
    });
  }, [pathname]);

  return null;
}
