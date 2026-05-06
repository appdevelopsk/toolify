import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { buildMetadata } from "@/lib/seo/metadata";
import { siteConfig } from "@/lib/config";
import type { Locale } from "@/lib/i18n/locales";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return buildMetadata({ locale: locale as Locale, title: t("nav.privacy"), description: t("site.description"), path: "/privacy" });
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isJa = locale === "ja";
  return (
    <div className="prose prose-slate mx-auto max-w-3xl px-4 py-10 dark:prose-invert">
      {isJa ? <PrivacyJa /> : <PrivacyEn />}
    </div>
  );
}

function PrivacyEn() {
  return (
    <>
      <h1>Privacy Policy</h1>
      <p>Last updated: 2026-05-06</p>
      <p>
        This policy explains how {siteConfig.organization} (&ldquo;we&rdquo;) collects, uses, and protects information
        when you use {siteConfig.name} ({siteConfig.url}). By using the site you agree to this policy.
      </p>
      <h2>Data we don't collect</h2>
      <p>
        Tool inputs (numbers, dates, text you type into a calculator) are processed entirely in your browser. We do not
        send those inputs to our servers and we do not store them.
      </p>
      <h2>Cookies and analytics</h2>
      <p>
        We use Google Analytics 4 to understand which tools are used and how visitors arrive at the site. Analytics
        cookies are only set if you grant consent through our cookie banner. We use IP anonymization.
      </p>
      <h2>Advertising</h2>
      <p>
        We display ads through Google AdSense. Google and its partners may use cookies to serve ads based on your prior
        visits to this and other websites. You can opt out of personalized advertising by visiting
        {" "}<a href="https://www.google.com/settings/ads">Google Ads Settings</a> or
        {" "}<a href="https://www.aboutads.info/">aboutads.info</a>. EEA/UK users are presented a Google-certified
        consent prompt; declining limits ads to non-personalized.
      </p>
      <h2>Third-party services</h2>
      <ul>
        <li>Google AdSense (ads) — <a href="https://policies.google.com/technologies/ads">policy</a></li>
        <li>Google Analytics 4 (analytics) — <a href="https://policies.google.com/privacy">policy</a></li>
        <li>Cloudflare (hosting/CDN) — <a href="https://www.cloudflare.com/privacypolicy/">policy</a></li>
      </ul>
      <h2>Your rights</h2>
      <p>
        Depending on your region (GDPR/CCPA/APPI etc.), you may have the right to access, delete, or restrict the use
        of your personal data. Contact us at <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>{" "}
        and we will respond within 30 days.
      </p>
      <h2>Children</h2>
      <p>The service is not directed to children under 13. We do not knowingly collect data from children.</p>
      <h2>Updates</h2>
      <p>We may update this policy and will revise the &ldquo;last updated&rdquo; date above when we do.</p>
      <h2>Contact</h2>
      <p>
        {siteConfig.organization} — <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>
      </p>
    </>
  );
}

function PrivacyJa() {
  return (
    <>
      <h1>プライバシーポリシー</h1>
      <p>最終更新日: 2026-05-06</p>
      <p>
        本ポリシーは {siteConfig.organization}（以下「当方」）が提供する {siteConfig.name}（{siteConfig.url}）における
        個人情報の取扱いを定めるものです。本サービスをご利用いただくことで、本ポリシーに同意したものとみなします。
      </p>
      <h2>収集しない情報</h2>
      <p>
        各ツールへの入力値（計算機に入力した数値・日付・テキスト等）はすべてお使いのブラウザ内で処理され、当方の
        サーバーへ送信・保存することはありません。
      </p>
      <h2>Cookieとアクセス解析</h2>
      <p>
        どのツールがよく使われているか、どこから来訪したかを把握するため Google Analytics 4 を利用します。解析用
        Cookieは、画面下部の同意バナーで許可いただいた場合のみ有効化されます。IPアドレスは匿名化されています。
      </p>
      <h2>広告について</h2>
      <p>
        当サイトは Google AdSense による広告を配信しています。Googleおよびそのパートナーは、お客様の過去の訪問履歴に
        基づいて広告を表示するためにCookieを利用することがあります。
        <a href="https://www.google.com/settings/ads">広告設定</a>または
        <a href="https://www.aboutads.info/"> aboutads.info </a>
        からパーソナライズ広告のオプトアウトが可能です。EEA/英国の利用者には Google認定の同意画面が表示され、
        拒否した場合は非パーソナライズ広告のみが配信されます。
      </p>
      <h2>第三者サービス</h2>
      <ul>
        <li>Google AdSense（広告配信）</li>
        <li>Google Analytics 4（アクセス解析）</li>
        <li>Cloudflare（ホスティング・CDN）</li>
      </ul>
      <h2>権利行使</h2>
      <p>
        個人情報保護法・GDPR・CCPA等に基づく開示・削除・利用停止のご請求は
        <a href={`mailto:${siteConfig.contactEmail}`}> {siteConfig.contactEmail} </a>
        までご連絡ください。原則30日以内に回答いたします。
      </p>
      <h2>未成年</h2>
      <p>13歳未満の方を対象としたサービスではなく、未成年から意図的に情報を収集することはありません。</p>
      <h2>改定</h2>
      <p>本ポリシーは予告なく改定する場合があります。改定時は「最終更新日」を更新します。</p>
      <h2>お問い合わせ</h2>
      <p>
        {siteConfig.organization} — <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>
      </p>
    </>
  );
}
