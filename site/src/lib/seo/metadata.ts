import type { Metadata } from "next";
import { siteConfig } from "@/lib/config";
import { LOCALES, type Locale, getDirection, isIndexedLocale } from "@/lib/i18n/locales";

interface BuildMetadataParams {
  locale: Locale;
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  type?: "website" | "article";
  image?: string;
  publishedTime?: string;
  modifiedTime?: string;
  /** true の場合 robots を index:false にする（剪定した noindex ツール用 / フォローは維持） */
  noindex?: boolean;
  /**
   * true でルート layout の title template（`%s · Toolify365`）を適用しない。
   * ★2026-08-04 以降、指定が無くても**接尾辞が表示幅60に収まらなければ自動で外す**。
   * このフラグは「収まっても付けたくない」場合にだけ立てればよい。
   */
  absoluteTitle?: boolean;
}

const BRAND_SUFFIX = " · Toolify365";
/** SERP は文字数ではなく表示幅で切れる。全角(East Asian Width W/F)は2幅。 */
const WIDE = /[\u1100-\u115F\u2E80-\uA4CF\uAC00-\uD7A3\uF900-\uFAFF\uFE30-\uFE4F\uFF00-\uFF60\uFFE0-\uFFE6]/;
function serpWidth(text: string): number {
  let w = 0;
  for (const c of text) w += WIDE.test(c) ? 2 : 1;
  return w;
}

/**
 * Bing/Google は meta description を**コードポイント数**で 160 に切る。
 * 超過ページは Bing WMT が「メタ説明が長すぎます」エラーとして計上するため、
 * 出口(=buildMetadata)で一括クランプする。語中で切らず、末尾に … を付ける。
 */
const MAX_DESC = 160;
function clampDescription(text: string): string {
  const chars = [...text.trim()];
  if (chars.length <= MAX_DESC) return chars.join("");
  // 159 文字で切り、直近の区切り(空白/句読点)まで戻して自然に終わらせる。
  let cut = chars.slice(0, MAX_DESC - 1).join("");
  const boundary = Math.max(
    cut.lastIndexOf(" "),
    cut.lastIndexOf("、"), cut.lastIndexOf("。"),
    cut.lastIndexOf("，"), cut.lastIndexOf("．"),
  );
  if (boundary >= MAX_DESC * 0.6) cut = cut.slice(0, boundary);
  return `${cut.replace(/[\s、。，．,.:;·—–-]+$/u, "")}…`;
}

export function buildMetadata(params: BuildMetadataParams): Metadata {
  const { locale, title, description: rawDescription, path, keywords, type = "website", image, publishedTime, modifiedTime, noindex = false, absoluteTitle = false } = params;
  const description = clampDescription(rawDescription);
  const url = `${siteConfig.url}/${locale}${path}`;
  // index 対象ロケール（en/ja）のみ noindex でなければインデックスさせる。
  // 死蔵言語(クリック0)はサイト全体のHCU評価を下げるため noindex+hreflang除外。
  const indexable = !noindex && isIndexedLocale(locale);
  const alternates: Record<string, string> = {};
  for (const l of LOCALES) {
    if (!isIndexedLocale(l)) continue; // hreflang も index 対象ロケールに限定
    alternates[l] = `${siteConfig.url}/${l}${path}`;
  }
  alternates["x-default"] = `${siteConfig.url}/en${path}`;

  const ogImage =
    image ??
    `${siteConfig.url}/api/og?title=${encodeURIComponent(title)}&subtitle=${encodeURIComponent(description.slice(0, 140))}&locale=${locale}`;

  return {
    // ブランド接尾辞は「幅60に収まるときだけ」付ける。テンプレート任せにすると
    // 収まらないページで訴求が切れる — 実測で 186 ページ中 43 ページが超過していた。
    title: {
      absolute: !absoluteTitle && serpWidth(`${title}${BRAND_SUFFIX}`) <= 60
        ? `${title}${BRAND_SUFFIX}`
        : title,
    },
    description,
    keywords,
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: url,
      languages: alternates,
    },
    openGraph: {
      type,
      url,
      title,
      description,
      siteName: siteConfig.name,
      locale,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
      ...(publishedTime && type === "article" ? { publishedTime } : {}),
      ...(modifiedTime && type === "article" ? { modifiedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
      ...(siteConfig.twitter ? { creator: siteConfig.twitter } : {}),
    },
    robots: {
      index: indexable,
      follow: true,
      googleBot: {
        index: indexable,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    other: {
      "x-default-locale": locale,
      "x-text-direction": getDirection(locale),
    },
  };
}
