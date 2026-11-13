"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { siteConfig } from "@/lib/config";
import { safePageViewUrl } from "./pageview-url";

/**
 * GA4 SPA navigation events. The real browser URL can contain search text
 * (?q=) or user calculator inputs (?s=), so send only the route and a bounded
 * whitelist of campaign tags. Replacing only private query parameters is not
 * a new page view; safe UTMs remain available for referral attribution.
 */
export function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastPageLocation = useRef("");

  useEffect(() => {
    if (!siteConfig.analytics.gaId) return;
    if (typeof window === "undefined" || typeof window.gtag !== "function") return;
    const { page_path, page_location } = safePageViewUrl(pathname, window.location.href);
    if (lastPageLocation.current === page_location) return;
    window.gtag("event", "page_view", {
      page_path,
      page_location,
      page_title: document.title,
    });
    lastPageLocation.current = page_location;
  }, [pathname, searchParams]);

  return null;
}
