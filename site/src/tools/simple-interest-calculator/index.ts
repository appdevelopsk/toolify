import type { ToolMeta } from "@/lib/tools/types";

const meta: ToolMeta = {
    slug: "simple-interest-calculator",
    category: "finance",
    applicationCategory: "FinanceApplication",
    updatedAt: "2026-05-07",
    related: ["compound-interest-calculator", "savings-goal-calculator", "loan-calculator"],
    primaryKeyword: {
      en: "simple interest calculator",
      ja: "単利 計算",
      "zh-CN": "单利 计算器",
    },
    hasHowTo: true,
    hasFaq: true,
  };

export default meta;
