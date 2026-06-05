import type { ToolMeta } from "@/lib/tools/types";

const meta: ToolMeta = {
    slug: "length-converter",
    category: "converter",
    applicationCategory: "UtilitiesApplication",
    updatedAt: "2026-05-06",
    related: ["bmi-calculator", "age-calculator"],
    primaryKeyword: { en: "length converter", ja: "長さ単位変換" },
    hasHowTo: true,
    hasFaq: true,
  sources: [
    { label: "NIST — Unit Conversions", url: "https://physics.nist.gov/cuu/Reference/unitconversions.html" },
    { label: "NIST — SI Units", url: "https://www.nist.gov/pml/owm/metric-si/si-units" },
  ],
  };

export default meta;
