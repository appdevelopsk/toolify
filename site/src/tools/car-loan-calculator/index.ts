import type { ToolMeta } from "@/lib/tools/types";

const meta: ToolMeta = {
    slug: "car-loan-calculator",
    category: "finance",
    applicationCategory: "FinanceApplication",
    updatedAt: "2026-07-10",
    related: ["loan-calculator", "mortgage-calculator", "simple-interest-calculator"],
    primaryKeyword: {
      en: "car loan calculator",
      ja: "自動車ローン 計算",
      "zh-CN": "汽车贷款 计算器",
    },
    hasHowTo: true,
    hasFaq: true,
  sources: [
    { label: "CFPB — Auto Loans (consumer tools)", url: "https://www.consumerfinance.gov/consumer-tools/auto-loans/" },
    { label: "CFPB — What is amortization and how could it affect my auto loan?", url: "https://www.consumerfinance.gov/ask-cfpb/what-is-amortization-and-how-could-it-affect-my-auto-loan-en-843/" },
  ],
  };

export default meta;
