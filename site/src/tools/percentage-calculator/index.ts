import type { ToolMeta } from "@/lib/tools/types";

const meta: ToolMeta = {
    slug: "percentage-calculator",
    category: "math",
    applicationCategory: "UtilitiesApplication",
    updatedAt: "2026-11-28",
    related: ["tip-calculator", "compound-interest-calculator"],
    primaryKeyword: { en: "percentage calculator", ja: "パーセント計算機" },
    hasHowTo: true,
    hasFaq: true,
    sources: [
      { label: "NIST SP 811, Chapter 7 — 7.10.2 %, percentage by, fraction", url: "https://www.nist.gov/pml/special-publication-811/nist-guide-si-chapter-7-rules-and-style-conventions-expressing-values" },
      { label: "Wikipedia — Relative change", url: "https://en.wikipedia.org/wiki/Relative_change" },
    ],
  };

export default meta;
