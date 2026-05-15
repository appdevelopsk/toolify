import type { ToolMeta } from "@/lib/tools/types";

const meta: ToolMeta = {
    slug: "iso-week-calculator",
    category: "datetime",
    applicationCategory: "BusinessApplication",
    updatedAt: "2026-05-07",
    related: ["date-calculator", "workdays-calculator", "leap-year-checker"],
    primaryKeyword: {
      en: "iso week number",
      ja: "ISO 週番号",
      "zh-CN": "ISO 周数",
    },
    hasHowTo: true,
    hasFaq: true,
  };

export default meta;
