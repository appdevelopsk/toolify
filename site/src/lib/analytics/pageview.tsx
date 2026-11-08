"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { createPageViewSender } from "./pageview-once";
import { siteConfig } from "@/lib/config";

/**
 * One page_view per localized pathname. Query-only changes to ?s= share
 * state do not create another visit. The GA script sends a ready signal only
 * after Consent Mode defaults and its send_page_view:false config.
 */
export function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!siteConfig.analytics.gaId) return;

    const send = createPageViewSender(() => {
      const gtag = window.gtag;
      return {
        ready: window.__toolifyGtagReady === true,
        href: window.location.href,
        title: document.title,
        emit: typeof gtag === "function"
          ? (payload) => gtag("event", "page_view", payload)
          : undefined,
      };
    });

    window.addEventListener("toolify:gtag-ready", send);
    send();
    return () => window.removeEventListener("toolify:gtag-ready", send);
  }, [pathname]);

  return null;
}
