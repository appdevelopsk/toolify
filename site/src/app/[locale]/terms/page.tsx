import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { buildMetadata } from "@/lib/seo/metadata";
import { siteConfig } from "@/lib/config";
import type { Locale } from "@/lib/i18n/locales";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return buildMetadata({ locale: locale as Locale, title: t("nav.terms"), description: t("site.description"), path: "/terms" });
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isJa = locale === "ja";
  return (
    <div className="prose prose-slate mx-auto max-w-3xl px-4 py-10 dark:prose-invert">
      {isJa ? (
        <>
          <h1>利用規約</h1>
          <p>最終更新日: 2026-05-06</p>
          <h2>サービス内容</h2>
          <p>
            {siteConfig.name}（以下「本サービス」）は、計算・変換・参照などの汎用ツールをブラウザ上で無料提供するも
            のです。本サービスの利用には本規約への同意が必要です。
          </p>
          <h2>免責事項</h2>
          <p>
            本サービスの計算結果はあくまで参考情報であり、医療・法律・税務・金融等の専門助言の代替ではありません。
            最終的な判断は専門家に確認のうえ、ご自身の責任で行ってください。当方は計算結果の正確性・最新性を可能な
            限り確保するよう努めますが、利用に伴う一切の損害について責任を負いません。
          </p>
          <h2>禁止事項</h2>
          <ul>
            <li>本サービスの不正アクセス・スクレイピングによる過大な負荷の発生</li>
            <li>広告のクリック率を不正に水増しする行為</li>
            <li>関連法令や公序良俗に反する目的での利用</li>
          </ul>
          <h2>知的財産</h2>
          <p>
            サイトのデザイン・テキスト・コードは {siteConfig.organization} に帰属します。各ツールの計算式・公式は一般
            に公開されている事実情報であり、引用元は各ツール内に記載しています。
          </p>
          <h2>準拠法</h2>
          <p>本規約は日本法を準拠法とし、関連する紛争は東京地方裁判所を専属管轄とします。</p>
          <h2>お問い合わせ</h2>
          <p>
            {siteConfig.organization} — <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>
          </p>
        </>
      ) : (
        <>
          <h1>Terms of Service</h1>
          <p>Last updated: 2026-05-06</p>
          <h2>Service</h2>
          <p>
            {siteConfig.name} (the &ldquo;Service&rdquo;) provides browser-based utility tools (calculators, converters,
            references) free of charge. Using the Service constitutes acceptance of these terms.
          </p>
          <h2>No professional advice</h2>
          <p>
            Results from the Service are informational and are not a substitute for professional medical, legal, tax,
            or financial advice. We make reasonable efforts to keep formulas accurate but accept no liability for
            decisions made based on the output.
          </p>
          <h2>Acceptable use</h2>
          <ul>
            <li>Do not abuse the Service via scraping or automated traffic that imposes undue load.</li>
            <li>Do not artificially inflate ad clicks or impressions.</li>
            <li>Do not use the Service for unlawful purposes.</li>
          </ul>
          <h2>Intellectual property</h2>
          <p>
            Site design, text, and code belong to {siteConfig.organization}. Mathematical formulas referenced in tools
            are publicly known facts and sources are cited within each tool.
          </p>
          <h2>Governing law</h2>
          <p>These terms are governed by the laws of Japan; disputes are subject to the Tokyo District Court.</p>
          <h2>Contact</h2>
          <p>
            {siteConfig.organization} — <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>
          </p>
        </>
      )}
    </div>
  );
}
