import Script from "next/script";
import { siteConfig } from "@/lib/config";

/**
 * Google Analytics 4 + Consent Mode v2。
 * 初期は全consent denied、ConsentBanner で更新される（GDPR準拠）。
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
            'wait_for_update': 500
          });
          gtag('js', new Date());
          gtag('config', '${siteConfig.analytics.gaId}', { anonymize_ip: true });
        `}
      </Script>
    </>
  );
}
