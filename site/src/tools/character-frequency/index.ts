import type { ToolMeta } from "@/lib/tools/types";

const meta: ToolMeta = {
    slug: "character-frequency",
    category: "text",
    applicationCategory: "UtilitiesApplication",
    updatedAt: "2026-11-28",
    related: ["word-counter", "text-diff"],
    primaryKeyword: { en: "character frequency analyzer", ja: "文字 出現頻度" },
    hasHowTo: true,
    hasFaq: true,
    sources: [
      { label: "Cornell University — English Letter Frequency table", url: "https://pi.math.cornell.edu/~mec/2003-2004/cryptography/subs/frequencies.html" },
      { label: "Unicode Standard Annex #29 — Unicode Text Segmentation", url: "https://www.unicode.org/reports/tr29/" },
    ],
  };

export default meta;
