import type { ToolMeta } from "@/lib/tools/types";

const meta: ToolMeta = {
    slug: "pregnancy-week-calculator",
    category: "health",
    applicationCategory: "HealthApplication",
    updatedAt: "2026-05-07",
    related: ["due-date-calculator", "ovulation-calculator", "age-calculator"],
    primaryKeyword: {
      en: "pregnancy week calculator",
      ja: "妊娠週数 計算",
      "zh-CN": "孕周 计算器",
    },
    hasHowTo: true,
    hasFaq: true,
  sources: [
    { label: "ACOG — Calculating a Due Date", url: "https://www.acog.org/womens-health/faqs/calculating-a-due-date" },
  ],
  };

export default meta;
