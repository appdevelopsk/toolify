"use client";

import { useEffect, useState } from "react";
import { siteConfig } from "@/lib/config";
import { AdSlot } from "./AdSlot";

const DISMISS_KEY = "toolify_anchor_dismissed";

/**
 * Dismissible bottom anchor ad for mobile/tablet (lg:hidden).
 * Appears only after the user scrolls (less intrusive), can be closed, and stays
 * closed for the session. Renders nothing unless an anchor slot is configured.
 */
export function AdAnchorMobile() {
  const [dismissed, setDismissed] = useState(true);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!siteConfig.adsense.client || !siteConfig.adsense.slots.anchor) return;
    try {
      if (sessionStorage.getItem(DISMISS_KEY) === "1") return;
    } catch {
      /* sessionStorage unavailable */
    }
    setDismissed(false);
    const onScroll = () => {
      if (window.scrollY > 300) {
        setShow(true);
        window.removeEventListener("scroll", onScroll);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (dismissed || !show) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95 lg:hidden">
      <button
        type="button"
        onClick={() => {
          setDismissed(true);
          try {
            sessionStorage.setItem(DISMISS_KEY, "1");
          } catch {
            /* ignore */
          }
        }}
        aria-label="Close advertisement"
        className="absolute -top-7 right-2 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
      >
        ×
      </button>
      <div className="mx-auto max-w-3xl px-2 py-1">
        <AdSlot
          slot={siteConfig.adsense.slots.anchor}
          format="horizontal"
          showLabel={false}
          style={{ minHeight: 50, maxHeight: 90, overflow: "hidden" }}
        />
      </div>
    </div>
  );
}
