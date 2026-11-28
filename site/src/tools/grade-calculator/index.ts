import type { ToolMeta } from "@/lib/tools/types";

const meta: ToolMeta = {
  slug: "grade-calculator",
  category: "math",
  applicationCategory: "EducationalApplication",
  updatedAt: "2026-11-28",
  related: ["gpa-calculator", "percentage-calculator", "statistics-calculator"],
  primaryKeyword: { en: "grade calculator", ja: "成績計算機" },
  hasHowTo: true,
  hasFaq: true,
  sources: [
    { label: "College Board BigFuture — How to Calculate Your GPA on a 4.0 Scale", url: "https://bigfuture.collegeboard.org/plan-for-college/get-started/how-to-calculate-gpa-4.0-scale" },
  ],
};

export default meta;
