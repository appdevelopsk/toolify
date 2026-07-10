import type { ToolMeta } from "@/lib/tools/types";

const meta: ToolMeta = {
    slug: "temperature-converter",
    category: "converter",
    applicationCategory: "UtilitiesApplication",
    updatedAt: "2026-07-10",
    related: ["length-converter"],
    primaryKeyword: { en: "temperature converter", ja: "温度変換" },
    hasHowTo: true,
    hasFaq: true,
  sources: [
    { label: "NIST — SI Units", url: "https://www.nist.gov/pml/owm/metric-si/si-units" },
    { label: "NIST — Unit Conversions", url: "https://physics.nist.gov/cuu/Reference/unitconversions.html" },
  ],
  };

export default meta;
