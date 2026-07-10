import type { ToolMeta } from "@/lib/tools/types";

const meta: ToolMeta = {
    slug: "pregnancy-week-calculator",
    category: "health",
    applicationCategory: "HealthApplication",
    updatedAt: "2026-07-10",
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
    { label: "ACOG Committee Opinion No. 700 — Methods for Estimating the Due Date", url: "https://www.acog.org/clinical/clinical-guidance/committee-opinion/articles/2017/05/methods-for-estimating-the-due-date" },
    { label: "NHS — Week-by-week guide to pregnancy", url: "https://www.nhs.uk/pregnancy/week-by-week/" },
    { label: "厚生労働省 — 妊婦健診（すこやかな妊娠と出産のために）", url: "https://www.mhlw.go.jp/bunya/kodomo/boshi-hoken13/index.html" },
    { label: "WHO — Recommendations on antenatal care for a positive pregnancy experience", url: "https://www.who.int/publications/i/item/9789241549912" },
  ],
  };

export default meta;
