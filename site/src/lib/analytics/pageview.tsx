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
    if (!siteConfig.analytics.gaId || typeof window === "undefined") return;
    let disposed = false;
    const { page_path, page_location } = safePageViewUrl(pathname, window.location.href);

    const sendWhenReady = () => {
      if (disposed) return;
      // Other tags may expose gtag before Toolify's GA4 config is ready.
      // Wait for the site's own init signal rather than losing the first
      // page_view or sending it to the wrong measurement configuration.
      const ready = (window as Window & { __toolifyGa4Ready?: boolean }).__toolifyGa4Ready;
      if (!ready || typeof window.gtag !== "function") return;
      if (lastPageLocation.current === page_location) return;
      window.gtag("event", "page_view", {
        page_path,
        page_location,
        page_title: document.title,
      });
      lastPageLocation.current = page_location;
    };

    window.addEventListener("toolify:ga4-ready", sendWhenReady);
    // Covers the reverse race: GA4 may already be initialized at mount.
    sendWhenReady();
    return () => {
      disposed = true;
      window.removeEventListener("toolify:ga4-ready", sendWhenReady);
    };
  }, [pathname, searchParams]);

  return null;
}
