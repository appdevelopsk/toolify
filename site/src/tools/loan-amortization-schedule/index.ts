import type { ToolMeta } from "@/lib/tools/types";

const meta: ToolMeta = {
    slug: "loan-amortization-schedule",
    category: "finance",
    applicationCategory: "FinanceApplication",
    updatedAt: "2026-07-10",
    related: ["loan-calculator", "mortgage-calculator", "car-loan-calculator"],
    primaryKeyword: { en: "loan amortization schedule", ja: "ローン 償却 表" },
    hasHowTo: true,
    hasFaq: true,
  sources: [
    { label: "Investopedia — Amortization Schedule", url: "https://www.investopedia.com/terms/a/amortization_schedule.asp" },
    { label: "CFPB — What is amortization and how could it affect my auto loan?", url: "https://www.consumerfinance.gov/ask-cfpb/what-is-amortization-and-how-could-it-affect-my-auto-loan-en-843/" },
  ],
  };

export default meta;
