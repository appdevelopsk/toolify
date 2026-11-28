import type { ToolMeta } from "@/lib/tools/types";

const meta: ToolMeta = {
  slug: "steps-to-distance-calculator",
  category: "health",
  applicationCategory: "HealthApplication",
  updatedAt: "2026-11-28",
  related: ["pace-calculator", "calorie-calculator", "bmi-calculator"],
  primaryKeyword: { en: "steps to distance calculator", ja: "歩数から距離計算" },
  hasHowTo: true,
  hasFaq: true,
  sources: [
    { label: "Compendium of Physical Activities (MET values)", url: "https://pacompendium.com/" },
  ],
};

export default meta;
