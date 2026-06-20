/**
 * サイト全体の設定。環境変数で上書き可能。
 * AdSense審査前は SITE_URL を実ドメインに、ADSENSE_CLIENT を本番IDに差し替える。
 */
export const siteConfig = {
  name: "Toolify",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.pages.dev",
  organization: process.env.NEXT_PUBLIC_ORG_NAME ?? "Toolify",
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "app.develop.sk@gmail.com",
  twitter: process.env.NEXT_PUBLIC_TWITTER_HANDLE ?? "",
  /**
   * 実在運営者（個人事業主）。E-E-A-T シグナルとして About / 法令ページ /
   * Organization JSON-LD に出す。捏造禁止 — すべて本人提供の公開可能な実値。
   */
  operator: {
    name: "Kenichiro.S",
    /** 活動拠点（国レベル） */
    country: "Japan",
    /** 実在する公開プロフィール（schema.org sameAs に使用） */
    url: "https://appdevelopsk.com/",
  },
  adsense: {
    client: process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? "",
    slots: {
      banner: process.env.NEXT_PUBLIC_ADSENSE_SLOT_BANNER ?? "",
      inArticle: process.env.NEXT_PUBLIC_ADSENSE_SLOT_INARTICLE ?? "",
      sticky: process.env.NEXT_PUBLIC_ADSENSE_SLOT_STICKY ?? "",
      belowResult: process.env.NEXT_PUBLIC_ADSENSE_SLOT_BELOWRESULT ?? "",
      // In-feed unit for list/home section breaks (added for revenue inventory).
      inFeed: process.env.NEXT_PUBLIC_ADSENSE_SLOT_INFEED ?? "",
      // Dismissible mobile bottom anchor.
      anchor: process.env.NEXT_PUBLIC_ADSENSE_SLOT_ANCHOR ?? "",
    },
  },
  analytics: {
    gaId: process.env.NEXT_PUBLIC_GA_ID ?? "",
    // Microsoft Clarity（ヒートマップ/セッション録画）。clarity.microsoft.com で作成。
    clarityId: process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID ?? "",
  },
  cmp: {
    /** Google Funding Choices publisher ID. Same value as adsense.client without the "ca-" prefix. */
    fcId: process.env.NEXT_PUBLIC_FC_ID ?? "",
  },
  social: {
    ogImageVersion: 1,
  },
} as const;

export const isProd = process.env.NODE_ENV === "production";
