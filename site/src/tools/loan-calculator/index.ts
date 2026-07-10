import type { ToolMeta } from "@/lib/tools/types";

const meta: ToolMeta = {
    slug: "loan-calculator",
    category: "finance",
    applicationCategory: "FinanceApplication",
    updatedAt: "2026-07-10",
    related: ["compound-interest-calculator", "sales-tax-calculator"],
    primaryKeyword: { en: "loan calculator", ja: "ローン計算" },
    hasHowTo: true,
    hasFaq: true,
  sources: [
    { label: "CFPB — What is amortization and how could it affect my auto loan?", url: "https://www.consumerfinance.gov/ask-cfpb/what-is-amortization-and-how-could-it-affect-my-auto-loan-en-843/" },
    { label: "Investopedia — Amortization: Definition and How It Works", url: "https://www.investopedia.com/terms/a/amortization.asp" },
  ],
  };

export default meta;
