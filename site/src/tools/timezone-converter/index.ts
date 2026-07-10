import type { ToolMeta } from "@/lib/tools/types";

const meta: ToolMeta = {
    slug: "timezone-converter",
    category: "datetime",
    applicationCategory: "UtilitiesApplication",
    updatedAt: "2026-07-10",
    related: ["countdown-timer", "timestamp-converter"],
    primaryKeyword: { en: "timezone converter", ja: "タイムゾーン変換" },
    hasHowTo: true,
    hasFaq: true,
  sources: [
    { label: "IANA — Time Zone Database", url: "https://www.iana.org/time-zones" },
  ],
  };

export default meta;
