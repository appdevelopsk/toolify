import type { ToolMeta } from "@/lib/tools/types";

const meta: ToolMeta = {
  slug: "reverse-text-generator",
  category: "text",
  applicationCategory: "UtilitiesApplication",
  updatedAt: "2026-11-28",
  related: ["case-converter", "text-replace", "morse-code-translator"],
  primaryKeyword: { en: "reverse text generator", ja: "テキスト逆順変換" },
  hasHowTo: true,
  hasFaq: true,
  sources: [
    { label: "Unicode Standard Annex #29 — Unicode Text Segmentation", url: "https://www.unicode.org/reports/tr29/" },
    { label: "MDN Web Docs — Intl.Segmenter", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter" },
  ],
};

export default meta;
