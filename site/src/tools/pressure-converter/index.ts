import type { ToolMeta } from "@/lib/tools/types";

const meta: ToolMeta = {
    slug: "pressure-converter",
    category: "converter",
    applicationCategory: "UtilityApplication",
    updatedAt: "2026-07-10",
    related: ["temperature-converter", "weight-converter", "volume-converter"],
    primaryKeyword: {
      en: "pressure converter",
      ja: "圧力 単位 変換",
      "zh-CN": "压力 单位 换算",
    },
    hasHowTo: true,
    hasFaq: true,
  sources: [
    { label: "NIST — Unit Conversions", url: "https://physics.nist.gov/cuu/Reference/unitconversions.html" },
    { label: "NIST — SI Units", url: "https://www.nist.gov/pml/owm/metric-si/si-units" },
  ],
  };

export default meta;
