import type { ToolMeta } from "@/lib/tools/types";

const meta: ToolMeta = {
    slug: "cagr-calculator",
    category: "finance",
    applicationCategory: "FinanceApplication",
    updatedAt: "2026-07-10",
    related: ["roi-calculator", "compound-interest-calculator", "rule-of-72-calculator"],
    primaryKeyword: { en: "CAGR calculator", ja: "CAGR 年平均成長率 計算" },
    hasHowTo: true,
    hasFaq: true,
  sources: [
    { label: "Investopedia — Compound Annual Growth Rate (CAGR)", url: "https://www.investopedia.com/terms/c/cagr.asp" },
    { label: "U.S. SEC (Investor.gov) — Compound Interest", url: "https://www.investor.gov/introduction-investing/investing-basics/glossary/compound-interest" },
  ],
  };

export default meta;
