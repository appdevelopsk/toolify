import type { ToolMeta } from "@/lib/tools/types";

const meta: ToolMeta = {
    slug: "date-calculator",
    category: "datetime",
    applicationCategory: "UtilitiesApplication",
    updatedAt: "2026-11-28",
    related: ["workdays-calculator", "age-calculator", "countdown-timer", "iso-week-calculator"],
    primaryKeyword: { en: "date calculator", ja: "日付計算" },
    hasHowTo: true,
    hasFaq: true,
    sources: [
      { label: "U.S. Office of Personnel Management — Federal Holidays", url: "https://www.opm.gov/policy-data-oversight/pay-leave/federal-holidays/" },
      { label: "内閣府 — 国民の祝日について", url: "https://www8.cao.go.jp/chosei/shukujitsu/gaiyou.html" },
      { label: "GOV.UK — UK bank holidays", url: "https://www.gov.uk/bank-holidays" },
    ],
  };

export default meta;
