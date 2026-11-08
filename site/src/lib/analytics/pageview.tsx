"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { createPageViewSender } from "./pageview-once";
import { siteConfig } from "@/lib/config";

declare global {
  interface Window {
    __toolifyGtagReady?: boolean;
  }
}

/**
 * One page_view per localized pathname. Query-only changes to ?s= share
 * state do not create another visit. The GA script sends a ready signal only
 * after Consent Mode defaults and its send_page_view:false config.
 */
export function PageViewTracker() {
  const pathname = usePathname();
  // Current mounted navigation may need its previous same-site page as referrer.
  const lastSentLocation = useRef<string | null>(null);

  useEffect(() => {
    if (!siteConfig.analytics.gaId) return;

    const send = createPageViewSender(() => {
      const gtag = window.gtag;
      return {
        ready: window.__toolifyGtagReady === true,
        href: window.location.href,
        referrer: lastSentLocation.current ?? document.referrer,
        title: document.title,
        emit: typeof gtag === "function"
          ? (payload) => {
            gtag("event", "page_view", payload);
            lastSentLocation.current = payload.page_location;
          }
          : undefined,
      };
    });

    window.addEventListener("toolify:gtag-ready", send);
    send();
    return () => window.removeEventListener("toolify:gtag-ready", send);
  }, [pathname]);

  return null;
}
