import type { ToolMeta } from "@/lib/tools/types";

const meta: ToolMeta = {
    slug: "wpm-counter",
    category: "text",
    applicationCategory: "EducationApplication",
    updatedAt: "2026-11-28",
    related: ["word-counter", "character-frequency", "case-converter"],
    primaryKeyword: {
      en: "wpm counter",
      ja: "WPM タイピング 速度",
      "zh-CN": "WPM 打字 速度",
    },
    hasHowTo: true,
    hasFaq: true,
    sources: [
      { label: "Wikipedia — Words per minute", url: "https://en.wikipedia.org/wiki/Words_per_minute" },
    ],
  };

export default meta;
