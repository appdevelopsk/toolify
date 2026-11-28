import type { ToolMeta } from "@/lib/tools/types";

const meta: ToolMeta = {
    slug: "roas-calculator",
    category: "finance",
    applicationCategory: "FinanceApplication",
    updatedAt: "2026-11-28",
    related: ["roi-calculator", "markup-calculator", "discount-calculator"],
    primaryKeyword: { en: "ROAS calculator", ja: "ROAS 広告費用対効果" },
    hasHowTo: true,
    hasFaq: true,
    sources: [
      { label: "Google Ads Help — About Target ROAS bidding", url: "https://support.google.com/google-ads/answer/6268637" },
    ],
  };

export default meta;
