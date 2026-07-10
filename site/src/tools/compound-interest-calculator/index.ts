import type { ToolMeta } from "@/lib/tools/types";

const meta: ToolMeta = {
    slug: "compound-interest-calculator",
    category: "finance",
    applicationCategory: "FinanceApplication",
    updatedAt: "2026-07-10",
    related: ["tip-calculator", "percentage-calculator"],
    primaryKeyword: { en: "compound interest calculator", ja: "複利計算機" },
    hasHowTo: true,
    hasFaq: true,
  sources: [
    { label: "U.S. SEC (Investor.gov) — Compound Interest Calculator", url: "https://www.investor.gov/financial-tools-calculators/calculators/compound-interest-calculator" },
    { label: "U.S. SEC (Investor.gov) — Compound Interest", url: "https://www.investor.gov/introduction-investing/investing-basics/glossary/compound-interest" },
  ],
  };

export default meta;
