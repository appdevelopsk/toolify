import type { ToolMeta } from "@/lib/tools/types";

const meta: ToolMeta = {
    slug: "workdays-calculator",
    category: "datetime",
    applicationCategory: "BusinessApplication",
    updatedAt: "2026-11-28",
    related: ["date-calculator", "age-calculator", "countdown-timer"],
    primaryKeyword: {
      en: "workdays calculator",
      ja: "営業日 計算",
      "zh-CN": "工作日 计算器",
    },
    hasHowTo: true,
    hasFaq: true,
    sources: [
      { label: "U.S. Office of Personnel Management — Federal Holidays", url: "https://www.opm.gov/policy-data-oversight/pay-leave/federal-holidays/" },
      { label: "内閣府 — 国民の祝日について", url: "https://www8.cao.go.jp/chosei/shukujitsu/gaiyou.html" },
      { label: "GOV.UK — UK bank holidays", url: "https://www.gov.uk/bank-holidays" },
    ],
  };

export default meta;
