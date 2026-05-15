import type { ToolMeta } from "@/lib/tools/types";

const meta: ToolMeta = {
    slug: "retirement-calculator",
    category: "finance",
    applicationCategory: "FinanceApplication",
    updatedAt: "2026-05-07",
    related: ["compound-interest-calculator", "savings-goal-calculator", "salary-converter"],
    primaryKeyword: {
      en: "retirement calculator",
      ja: "退職資金 計算",
      "zh-CN": "退休 计算器",
    },
    hasHowTo: true,
    hasFaq: true,
  };

export default meta;
