import type { ToolMeta } from "@/lib/tools/types";

const meta: ToolMeta = {
    slug: "weight-converter",
    category: "converter",
    applicationCategory: "UtilitiesApplication",
    updatedAt: "2026-07-10",
    related: ["length-converter", "temperature-converter"],
    primaryKeyword: { en: "weight converter", ja: "重さ単位変換" },
    hasHowTo: true,
    hasFaq: true,
  sources: [
    { label: "NIST — Unit Conversions", url: "https://physics.nist.gov/cuu/Reference/unitconversions.html" },
    { label: "NIST — SI Units", url: "https://www.nist.gov/pml/owm/metric-si/si-units" },
  ],
  };

export default meta;
