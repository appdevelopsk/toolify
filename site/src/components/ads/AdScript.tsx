import Script from "next/script";
import { siteConfig } from "@/lib/config";

/**
 * AdSenseのメインスクリプト。`<head>` 直後ではなく `afterInteractive` で読む。
 * クライアントID未設定時は何も出さない（PoCの段階で誤発火を防ぐ）。
 */
export function AdScript() {
  if (!siteConfig.adsense.client) return null;
  return (
    <Script
      id="adsense-script"
      async
      strategy="afterInteractive"
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${siteConfig.adsense.client}`}
    />
  );
}
