import type { ToolMeta } from "@/lib/tools/types";

const meta: ToolMeta = {
    slug: "password-generator",
    category: "text",
    applicationCategory: "SecurityApplication",
    updatedAt: "2026-05-06",
    related: ["word-counter"],
    primaryKeyword: { en: "password generator", ja: "パスワード生成" },
    hasHowTo: true,
    hasFaq: true,
  sources: [
    { label: "NIST SP 800-63B — Digital Identity Guidelines (authentication & passwords)", url: "https://pages.nist.gov/800-63-3/sp800-63b.html" },
  ],
  };

export default meta;
