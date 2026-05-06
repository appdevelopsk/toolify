"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { siteConfig } from "@/lib/config";

const STORAGE_KEY = "consent.v1";

type ConsentValue = "all" | "essential" | "unset";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function applyConsent(value: ConsentValue) {
  if (typeof window === "undefined") return;
  const granted = value === "all";
  window.gtag?.("consent", "update", {
    ad_storage: granted ? "granted" : "denied",
    ad_user_data: granted ? "granted" : "denied",
    ad_personalization: granted ? "granted" : "denied",
    analytics_storage: granted ? "granted" : "denied",
  });
}

export function ConsentBanner() {
  const t = useTranslations("consent");
  const [value, setValue] = useState<ConsentValue>("unset");

  useEffect(() => {
    const saved = (localStorage.getItem(STORAGE_KEY) as ConsentValue | null) ?? "unset";
    setValue(saved);
    if (saved !== "unset") applyConsent(saved);
  }, []);

  // CMP（Funding Choices）が設定されている場合は二重表示を避けるためこちらは出さない
  if (siteConfig.cmp.fcId) return null;
  if (value !== "unset") return null;

  function decide(v: ConsentValue) {
    localStorage.setItem(STORAGE_KEY, v);
    applyConsent(v);
    setValue(v);
  }

  return (
    <div
      role="dialog"
      aria-label={t("title")}
      className="fixed inset-x-2 bottom-2 z-50 mx-auto max-w-2xl rounded-lg border border-slate-200 bg-white p-4 shadow-lg dark:border-slate-700 dark:bg-slate-900"
    >
      <p className="mb-3 text-sm">{t("body")}</p>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => decide("all")}
          className="rounded bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
        >
          {t("acceptAll")}
        </button>
        <button
          onClick={() => decide("essential")}
          className="rounded border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800"
        >
          {t("essentialOnly")}
        </button>
      </div>
    </div>
  );
}
