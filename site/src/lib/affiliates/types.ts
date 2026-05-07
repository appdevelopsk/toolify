import type { ToolCategory } from "@/lib/tools/types";

export type Market = "global" | "JP" | "US" | "CN";

export interface AffiliateOffer {
  /** Stable ID for analytics. */
  id: string;
  /** Tool category this offer is shown under. */
  category: ToolCategory;
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
