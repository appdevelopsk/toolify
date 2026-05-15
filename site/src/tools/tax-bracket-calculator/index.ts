import type { ToolMeta } from "@/lib/tools/types";

const meta: ToolMeta = {
    slug: "tax-bracket-calculator",
    category: "finance",
    applicationCategory: "FinanceApplication",
    updatedAt: "2026-05-07",
    related: ["salary-converter", "compound-interest-calculator", "retirement-calculator"],
    primaryKeyword: {
      en: "tax bracket calculator",
      ja: "所得税 計算",
      "zh-CN": "所得税 计算器",
    },
    hasHowTo: true,
    hasFaq: true,
  };

export default meta;
