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
}

export function buildMetadata(params: BuildMetadataParams): Metadata {
  const { locale, title, description, path, keywords, type = "website", image, publishedTime, modifiedTime, noindex = false } = params;
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
    title,
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
