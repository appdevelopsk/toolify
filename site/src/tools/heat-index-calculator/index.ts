import type { ToolMeta } from "@/lib/tools/types";

const meta: ToolMeta = {
  slug: "heat-index-calculator",
  category: "converter",
  applicationCategory: "UtilityApplication",
  updatedAt: "2026-11-28",
  related: ["temperature-converter", "wind-chill-calculator", "calorie-calculator"],
  primaryKeyword: { en: "heat index calculator", ja: "熱指数計算機" },
  hasHowTo: true,
  hasFaq: true,
  sources: [
    { label: "NOAA/NWS Weather Prediction Center — The Heat Index Equation", url: "https://www.wpc.ncep.noaa.gov/html/heatindex_equation.shtml" },
    { label: "National Weather Service — Heat Forecast Tools (Heat Index)", url: "https://www.weather.gov/safety/heat-index" },
  ],
};

export default meta;
