import type { ToolMeta } from "@/lib/tools/types";

const meta: ToolMeta = {
    slug: "age-calculator",
    category: "datetime",
    applicationCategory: "UtilitiesApplication",
    updatedAt: "2026-11-28",
    related: ["bmi-calculator", "length-converter"],
    primaryKeyword: { en: "age calculator", ja: "年齢計算" },
    hasHowTo: true,
    hasFaq: true,
    sources: [
      { label: "e-Gov 法令検索 — 年齢計算ニ関スル法律", url: "https://laws.e-gov.go.jp/law/135AC1000000050" },
      { label: "Wikipedia — Gregorian calendar (leap-year rule)", url: "https://en.wikipedia.org/wiki/Gregorian_calendar" },
    ],
  };

export default meta;
