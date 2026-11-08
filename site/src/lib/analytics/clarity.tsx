import Script from "next/script";
import { siteConfig } from "@/lib/config";

/**
 * Microsoft Clarity — ヒートマップ + セッション録画（無料・無制限）。
 *
 * プロジェクトIDは `NEXT_PUBLIC_CLARITY_PROJECT_ID`（clarity.microsoft.com で
 * サイトごとに作成）。未設定なら何もレンダリングしない（＝安全な no-op）。
 *
 * GDPR: Clarity does not follow Google Consent Mode, and masking tool DOM
 * does not remove private share state from captured page/referrer/click URLs.
 * Fail closed: require explicit production build-time privacy review before
 * loading the vendor script, even when the old project ID is configured.
 * EEA deployment also requires Clarity's own consent integration and browser QA.
 */
export function MicrosoftClarity() {
  const id = siteConfig.analytics.clarityId;
  // No third-party Clarity recording until URL masking and consent are reviewed.
  // Intentional build-time opt-in; do not infer approval from an existing ID.
  if (!id || process.env.NEXT_PUBLIC_CLARITY_URL_PRIVACY_APPROVED !== "confirmed") return null;
  return (
    <Script id="clarity-init" strategy="afterInteractive">
      {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${id}");`}
    </Script>
  );
}
