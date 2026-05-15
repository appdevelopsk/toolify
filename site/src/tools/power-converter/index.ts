import type { ToolMeta } from "@/lib/tools/types";

const meta: ToolMeta = {
    slug: "power-converter",
    category: "converter",
    applicationCategory: "UtilityApplication",
    updatedAt: "2026-05-07",
    related: ["pressure-converter", "angle-converter", "temperature-converter"],
    primaryKeyword: {
      en: "power converter",
      ja: "電力 単位 変換",
      "zh-CN": "功率 单位 换算",
    },
    hasHowTo: true,
    hasFaq: true,
  };

export default meta;
