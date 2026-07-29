import { defineRouting } from "next-intl/routing";
import { LOCALES, DEFAULT_LOCALE } from "./locales";

export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: "always",
  // next-intl の middleware は既定で全ロケール分の hreflang を Link ヘッダに出す。
  // 本サイトは INDEXED_LOCALES=["en","ja"] だけをインデックス対象にし、残り15言語は
  // noindex にしているのに、Link ヘッダだけが17言語+x-defaultを宣言していた
  // (HTML head と sitemap は en/ja のみ＝三者不一致)。Googleは Link ヘッダも読むため
  // hreflangクラスタが noindex URL を指し、間引き戦略を打ち消していた。
  // hreflang は head 側 (lib/seo/metadata.ts) が正しく出しているのでここは無効化する。
  alternateLinks: false,
});
