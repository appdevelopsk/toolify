/**
 * 姉妹サイト(Pickly / FXEA365 / Nattzy / appdevelopsk)へのリンクに付ける UTM(2026-10-15 監査 T3)。
 *
 * 付けないと相手側の GA4 で Toolify365 からの流入が「referral: toolify365.com」に
 * まとまり、どの面(フッター・金融 CTA・関連サービス枠)から来たか分けられない。
 * utm_source=toolify365 / utm_medium=referral / utm_campaign=<リンクの場所>。
 */
export const SISTER_HOSTS = ["pickly.blog", "fxea365.com", "nattzy.com", "appdevelopsk.com"] as const;

export function isSisterSiteUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return SISTER_HOSTS.some((h) => host === h || host.endsWith(`.${h}`));
  } catch {
    return false;
  }
}

/** 姉妹サイトの URL に UTM を付ける。既に utm_source があれば触らない・姉妹サイト以外はそのまま。 */
export function withSisterUtm(url: string, campaign: string): string {
  if (!isSisterSiteUrl(url)) return url;
  const u = new URL(url);
  if (u.searchParams.has("utm_source")) return url;
  u.searchParams.set("utm_source", "toolify365");
  u.searchParams.set("utm_medium", "referral");
  u.searchParams.set("utm_campaign", campaign);
  return u.toString();
}
