import type { ToolCategory } from "@/lib/tools/types";
import type { PromptCategory } from "@/lib/prompts/types";

export type Market = "global" | "JP" | "US" | "CN" | "INTL";
/** "ai" is a synthetic category used by /prompts pages for AI-tool offers
 *  that are not specific to any single prompt category. */
export type OfferCategory = ToolCategory | PromptCategory | "ai";

export interface AffiliateOffer {
  /** Stable ID for analytics. */
  id: string;
  /** Primary category this offer matches. */
  category: OfferCategory;
  /** Additional categories where this offer can also appear (cross-category reach). */
  alsoIn?: OfferCategory[];
  /**
   * カテゴリ外でも個別に出すツール slug(例: 楽天モバイルを data-size-converter に)。
   * カテゴリ単位では粗すぎる場合だけ使う。
   */
  tools?: string[];
  /**
   * カテゴリは一致してもツールの用件と合わないので出さないツール slug
   * (例: 妊娠系ツールに美顔器、ペットの年齢計算に人の健康機器)。
   */
  excludeTools?: string[];
  /** Markets where this offer is valid; if absent treated as "global". */
  markets?: Market[];
  /** Locales (BCP47) where this offer is shown; if absent shown to all. */
  locales?: string[];
  /** Localized name shown in the card. */
  name: Record<string, string>;
  /** Localized 1-2 sentence description. */
  description: Record<string, string>;
  /** Localized CTA label (default: "詳細を見る" / "Learn more"). */
  cta?: Record<string, string>;
  /** Affiliate URL — locale-keyed, fallback to "default". */
  url: Record<string, string>;
  /** Optional: ASP/network name for tracking (a8/moshimo/amazon/direct). */
  network?: string;
  /** Optional emoji or single-char logo (for now; we avoid hosting third-party logos). */
  badge?: string;
  /** Set to true while pending ASP approval — renders as disabled CTA. */
  pending?: boolean;
}

export interface AffiliatePolicy {
  /** Maximum offers to render in a tool page slot. */
  maxPerSlot: number;
  /** Disclosure label, e.g. "PR" / "広告". Always shown. */
  disclosureLabel: Record<string, string>;
}
