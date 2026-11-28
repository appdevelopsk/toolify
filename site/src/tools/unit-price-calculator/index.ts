import type { ToolMeta } from "@/lib/tools/types";

const meta: ToolMeta = {
    slug: "unit-price-calculator",
    category: "finance",
    applicationCategory: "FinanceApplication",
    updatedAt: "2026-11-28",
    related: ["discount-calculator", "percentage-calculator"],
    primaryKeyword: { en: "unit price calculator", ja: "単価計算" },
    hasHowTo: true,
    hasFaq: true,
    sources: [
      { label: "NIST SP 1181 — Unit Pricing Guide", url: "https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.1181.pdf" },
      { label: "NIST Handbook 130 — Uniform Unit Pricing Regulation", url: "https://www.nist.gov/pml/owm/nist-handbook-130-current-edition" },
    ],
  };

export default meta;
