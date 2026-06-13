import Script from "next/script";
import { siteConfig } from "@/lib/config";

/**
 * Microsoft Clarity — ヒートマップ + セッション録画（無料・無制限）。
 *
 * プロジェクトIDは `NEXT_PUBLIC_CLARITY_PROJECT_ID`（clarity.microsoft.com で
 * サイトごとに作成）。未設定なら何もレンダリングしない（＝安全な no-op）。
 *
 * GDPR: このサイトは Consent Mode v2 を使うが、Clarity は Google の同意状態を
 * 参照しない。EEA 向けには Clarity 側プロジェクト設定の「Cookie consent」を
 * 有効化すること（同意取得まで Cookie を使わないモードになる）。
 */
export function MicrosoftClarity() {
  const id = siteConfig.analytics.clarityId;
  if (!id) return null;
  return (
    <Script id="clarity-init" strategy="afterInteractive">
      {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${id}");`}
    </Script>
  );
}
