"use client";

import { useEffect } from "react";

/**
 * Registers the service worker in production only. The SW is network-first and
 * never touches ad/analytics requests, so it adds installability + an offline
 * fallback without affecting monetization.
 */
export function RegisterSW() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    const register = () => navigator.serviceWorker.register("/sw.js").catch(() => {});
    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });
  }, []);

  return null;
}
