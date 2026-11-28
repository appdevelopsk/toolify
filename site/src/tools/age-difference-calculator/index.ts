import type { ToolMeta } from "@/lib/tools/types";

const meta: ToolMeta = {
    slug: "age-difference-calculator",
    category: "datetime",
    applicationCategory: "EducationApplication",
    updatedAt: "2026-11-28",
    related: ["age-calculator", "date-calculator", "iso-week-calculator"],
    primaryKeyword: {
      en: "age difference calculator",
      ja: "年齢差 計算",
      "zh-CN": "年龄差 计算器",
    },
    hasHowTo: true,
    hasFaq: true,
    sources: [
      { label: "Wikipedia — Gregorian calendar (leap-year rule)", url: "https://en.wikipedia.org/wiki/Gregorian_calendar" },
      { label: "Wikipedia — ISO 8601 (calendar dates)", url: "https://en.wikipedia.org/wiki/ISO_8601" },
    ],
  };

export default meta;
