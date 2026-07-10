import type { ToolMeta } from "@/lib/tools/types";

const meta: ToolMeta = {
    slug: "investment-fee-impact-calculator",
    category: "finance",
    applicationCategory: "FinanceApplication",
    updatedAt: "2026-07-10",
    related: ["compound-interest-calculator", "retirement-calculator", "cagr-calculator"],
    primaryKeyword: { en: "investment fee impact calculator", ja: "投資 信託報酬 影響" },
    hasHowTo: true,
    hasFaq: true,
  sources: [
    { label: "U.S. SEC (Investor.gov) — Understanding Fees", url: "https://www.investor.gov/introduction-investing/getting-started/understanding-fees" },
    { label: "SEC Investor Bulletin — How Fees and Expenses Affect Your Investment Portfolio (PDF)", url: "https://www.sec.gov/investor/alerts/ib_fees_expenses.pdf" },
    { label: "FINRA — Fund Analyzer", url: "https://tools.finra.org/fund_analyzer/" },
  ],
  };

export default meta;
