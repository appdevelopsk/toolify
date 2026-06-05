import type { ToolMeta } from "@/lib/tools/types";

const meta: ToolMeta = {
    slug: "ovulation-calculator",
    category: "health",
    applicationCategory: "HealthApplication",
    updatedAt: "2026-05-07",
    related: ["due-date-calculator", "age-calculator", "date-calculator"],
    primaryKeyword: {
      en: "ovulation calculator",
      ja: "排卵日 計算",
      "zh-CN": "排卵日 计算器",
    },
    hasHowTo: true,
    hasFaq: true,
  sources: [
    { label: "NICHD — Preconception Care", url: "https://www.nichd.nih.gov/health/topics/preconceptioncare" },
    { label: "ACOG — Calculating a Due Date", url: "https://www.acog.org/womens-health/faqs/calculating-a-due-date" },
  ],
  };

export default meta;
