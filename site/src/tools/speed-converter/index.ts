import type { ToolMeta } from "@/lib/tools/types";

const meta: ToolMeta = {
    slug: "speed-converter",
    category: "converter",
    applicationCategory: "UtilitiesApplication",
    updatedAt: "2026-07-10",
    related: ["length-converter", "fuel-economy-converter"],
    primaryKeyword: { en: "speed converter", ja: "速度単位変換" },
    hasHowTo: true,
    hasFaq: true,
  sources: [
    { label: "NIST — Unit Conversions", url: "https://physics.nist.gov/cuu/Reference/unitconversions.html" },
  ],
  };

export default meta;
