import type { ToolMeta } from "@/lib/tools/types";

const meta: ToolMeta = {
    slug: "fuel-economy-converter",
    category: "converter",
    applicationCategory: "UtilitiesApplication",
    updatedAt: "2026-07-10",
    related: ["speed-converter", "length-converter"],
    primaryKeyword: { en: "fuel economy converter", ja: "燃費 換算" },
    hasHowTo: true,
    hasFaq: true,
  sources: [
    { label: "NIST — Unit Conversions", url: "https://physics.nist.gov/cuu/Reference/unitconversions.html" },
  ],
  };

export default meta;
