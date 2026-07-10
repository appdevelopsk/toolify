import type { ToolMeta } from "@/lib/tools/types";

const meta: ToolMeta = {
    slug: "mortgage-calculator",
    category: "finance",
    applicationCategory: "FinanceApplication",
    updatedAt: "2026-07-10",
    related: ["loan-calculator", "compound-interest-calculator"],
    primaryKeyword: { en: "mortgage calculator", ja: "住宅ローン計算" },
    hasHowTo: true,
    hasFaq: true,
  sources: [
    { label: "CFPB — What is private mortgage insurance?", url: "https://www.consumerfinance.gov/ask-cfpb/what-is-private-mortgage-insurance-en-122/" },
    { label: "CFPB — Owning a Home: loan options and costs", url: "https://www.consumerfinance.gov/owning-a-home/" },
    { label: "Investopedia — Amortization: Definition and How It Works", url: "https://www.investopedia.com/terms/a/amortization.asp" },
  ],
  };

export default meta;
