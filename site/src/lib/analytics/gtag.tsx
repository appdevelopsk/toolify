import Script from "next/script";
import { siteConfig } from "@/lib/config";

// EEA + UK + Switzerland。これらの地域では同意取得まで denied。
const EEA_REGIONS = [
  "AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR","DE","GR","HU","IE","IT",
  "LV","LT","LU","MT","NL","PL","PT","RO","SK","SI","ES","SE",
  "GB","CH","NO","IS","LI",
];

/**
 * Google Analytics 4 + Consent Mode v2。
 * EEA/UK/CHでは default denied、それ以外（日本・米国等）は default granted。
 * ConsentBanner で EEA ユーザーの選択を更新する。
 */
export function GoogleAnalytics() {
  if (!siteConfig.analytics.gaId) return null;
  return (
    <>
      <Script
        id="ga-base"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${siteConfig.analytics.gaId}`}
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('consent', 'default', {
            'ad_storage': 'denied',
            'ad_user_data': 'denied',
            'ad_personalization': 'denied',
            'analytics_storage': 'denied',
            'wait_for_update': 500,
            'region': ${JSON.stringify(EEA_REGIONS)}
          });
          gtag('consent', 'default', {
            'ad_storage': 'granted',
            'ad_user_data': 'granted',
            'ad_personalization': 'granted',
            'analytics_storage': 'granted'
          });
          gtag('js', new Date());
          gtag('config', '${siteConfig.analytics.gaId}', { anonymize_ip: true });
        `}
      </Script>
    </>
  );
}
