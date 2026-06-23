import Script from "next/script";

// impact.com トラッキングタグ（アカウント共通 P-A7280941…）。
// 所有権確認＋アフィリ計測（transformLinks=提携ブランドへのリンク自動変換 / trackImpression）。
export function ImpactTracking() {
  return (
    <Script id="impact-init" strategy="afterInteractive">
      {`(function(i,m,p,a,c,t){c.ire_o=p;c[p]=c[p]||function(){(c[p].a=c[p].a||[]).push(arguments)};t=a.createElement(m);var z=a.getElementsByTagName(m)[0];t.async=1;t.src=i;z.parentNode.insertBefore(t,z)})('https://utt.impactcdn.com/P-A7280941-3677-4f4e-b630-5e0a1e3fd9561.js','script','impactStat',document,window);impactStat('transformLinks');impactStat('trackImpression');`}
    </Script>
  );
}
