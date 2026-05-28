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

// EEA/UK/CH の主要タイムゾーン。完璧ではないがバナー表示判定の十分な目安。
// 実際の地域別の consent default は gtag の region パラメータが Google 側で処理する。
const EEA_TIMEZONE = /^(Europe\/(Amsterdam|Athens|Belgrade|Berlin|Bratislava|Brussels|Bucharest|Budapest|Busingen|Copenhagen|Dublin|Gibraltar|Helsinki|Isle_of_Man|Jersey|Guernsey|Lisbon|Ljubljana|London|Luxembourg|Madrid|Malta|Mariehamn|Monaco|Oslo|Paris|Prague|Riga|Rome|Sofia|Stockholm|Tallinn|Vaduz|Vatican|Vienna|Vilnius|Warsaw|Zagreb|Zurich)|Atlantic\/(Faroe|Reykjavik|Canary|Madeira|Azores))$/;

function isLikelyEEA(): boolean {
  if (typeof Intl === "undefined") return false;
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return EEA_TIMEZONE.test(tz);
  } catch {
    return false;
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
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    const saved = (localStorage.getItem(STORAGE_KEY) as ConsentValue | null) ?? "unset";
    setValue(saved);
    if (saved !== "unset") applyConsent(saved);
    setShouldShow(isLikelyEEA());
  }, []);

  // CMP（Funding Choices）が設定されている場合は二重表示を避けるためこちらは出さない
  if (siteConfig.cmp.fcId) return null;
  if (value !== "unset") return null;
  // EEA外ユーザーには表示しない（gtag default が granted のため不要）
  if (!shouldShow) return null;

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
