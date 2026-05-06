/**
 * サイト全体の設定。環境変数で上書き可能。
 * AdSense審査前は SITE_URL を実ドメインに、ADSENSE_CLIENT を本番IDに差し替える。
 */
export const siteConfig = {
  name: "Toolify",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.pages.dev",
  organization: process.env.NEXT_PUBLIC_ORG_NAME ?? "Toolify",
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "contact@example.com",
  twitter: process.env.NEXT_PUBLIC_TWITTER_HANDLE ?? "",
  adsense: {
    client: process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? "",
    slots: {
      banner: process.env.NEXT_PUBLIC_ADSENSE_SLOT_BANNER ?? "",
      inArticle: process.env.NEXT_PUBLIC_ADSENSE_SLOT_INARTICLE ?? "",
      sticky: process.env.NEXT_PUBLIC_ADSENSE_SLOT_STICKY ?? "",
      belowResult: process.env.NEXT_PUBLIC_ADSENSE_SLOT_BELOWRESULT ?? "",
    },
  },
  analytics: {
    gaId: process.env.NEXT_PUBLIC_GA_ID ?? "",
  },
  social: {
    ogImageVersion: 1,
  },
} as const;

export const isProd = process.env.NODE_ENV === "production";
