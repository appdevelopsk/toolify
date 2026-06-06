import type { ToolMeta } from "@/lib/tools/types";

const meta: ToolMeta = {
  slug: "hcg-calculator",
  category: "health",
  applicationCategory: "HealthApplication",
  updatedAt: "2026-06-06",
  related: ["pregnancy-week-calculator", "due-date-calculator", "conception-date-calculator"],
  primaryKeyword: {
    en: "hcg calculator",
    ja: "hCG 倍加時間 計算",
  },
  hasHowTo: true,
  hasFaq: true,
  sources: [
    { label: "MedlinePlus — hCG Blood Test", url: "https://medlineplus.gov/lab-tests/hcg-blood-test/" },
    { label: "StatPearls (NCBI) — Human Chorionic Gonadotropin", url: "https://www.ncbi.nlm.nih.gov/books/NBK532950/" },
  ],
};

export default meta;
