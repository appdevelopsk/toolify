"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { sanitizePageViewUrl } from "./pageview-url";
import { siteConfig } from "@/lib/config";

/**
 * One page_view per localized pathname navigation. A query-only change to
 * a share link (?s=...) is not a new page. The GA bootstrap runs with
 * afterInteractive, so the first effect can precede window.gtag.
 */
export function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!siteConfig.analytics.gaId) return;
    let sent = false;

    const send = () => {
      if (sent || typeof window.gtag !== "function") return;
      sent = true;
      const safe = sanitizePageViewUrl(window.location.href);
      window.gtag("event", "page_view", {
        ...safe,
        page_title: document.title,
      });
    };

    window.addEventListener("toolify:gtag-ready", send);
    send();
    return () => window.removeEventListener("toolify:gtag-ready", send);
  }, [pathname]);

  return null;
}
