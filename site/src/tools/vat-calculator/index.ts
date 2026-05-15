import type { ToolMeta } from "@/lib/tools/types";

const meta: ToolMeta = {
    slug: "vat-calculator",
    category: "finance",
    applicationCategory: "FinanceApplication",
    updatedAt: "2026-05-07",
    related: ["sales-tax-calculator", "discount-calculator", "tax-bracket-calculator"],
    primaryKeyword: {
      en: "vat calculator",
      ja: "消費税 計算",
      "zh-CN": "增值税 计算器",
    },
    hasHowTo: true,
    hasFaq: true,
  };

export default meta;
