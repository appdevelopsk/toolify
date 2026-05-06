import Script from "next/script";
import { siteConfig } from "@/lib/config";

/**
 * Google Funding Choices CMP（無料・GDPR/UK GDPR/CCPA TCFv2.2 対応）。
 *
 * 仕組み:
 *   1. Google が提供する fundingchoicesmessages.js を読み込む
 *   2. 表示すべき地域（EU/UK 等）からのアクセス時、Google が同意UIを自動表示
 *   3. ユーザー選択は AdSense と Google Tag のコンセントモードに自動連携
 *
 * NEXT_PUBLIC_FC_ID 未設定時は何も出さない（PoC段階での誤発火防止）。
 *
 * 設定手順:
 *   1. fundingchoices.google.com で「メッセージを作成」 → サイトURL登録
 *   2. 提供される pub-XXXXXXXXXXXXXXXX を NEXT_PUBLIC_FC_ID に設定
 *      （AdSense の publisher ID と同じ）
 *   3. デプロイすれば EU/UK 訪問者に自動で同意バナーが表示される
 */
export function FundingChoices() {
  if (!siteConfig.cmp.fcId) return null;
  const src = `https://fundingchoicesmessages.google.com/i/pub-${siteConfig.cmp.fcId}?ers=1`;
  return (
    <>
      <Script
        id="fc-loader"
        async
        strategy="afterInteractive"
        src={src}
      />
      <Script id="fc-init" strategy="afterInteractive">{`
        (function() {
          function signalGooglefcPresent() {
            if (!window.frames['googlefcPresent']) {
              if (document.body) {
                var iframe = document.createElement('iframe');
                iframe.style = 'width:0;height:0;border:none;z-index:-1000;left:-1000px;top:-1000px;';
                iframe.style.display = 'none';
                iframe.name = 'googlefcPresent';
                document.body.appendChild(iframe);
              } else {
                setTimeout(signalGooglefcPresent, 0);
              }
            }
          }
          signalGooglefcPresent();
        })();
      `}</Script>
    </>
  );
}
