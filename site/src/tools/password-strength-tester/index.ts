import type { ToolMeta } from "@/lib/tools/types";

const meta: ToolMeta = {
    slug: "password-strength-tester",
    category: "text",
    applicationCategory: "DeveloperApplication",
    updatedAt: "2026-11-28",
    related: ["password-generator", "hash-generator", "uuid-generator"],
    primaryKeyword: {
      en: "password strength tester",
      ja: "パスワード 強度 判定",
      "zh-CN": "密码 强度 测试",
    },
    hasHowTo: true,
    hasFaq: true,
    sources: [
      { label: "NIST SP 800-63B — Digital Identity Guidelines: Authentication", url: "https://pages.nist.gov/800-63-4/sp800-63b.html" },
      { label: "OWASP — Authentication Cheat Sheet", url: "https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html" },
    ],
  };

export default meta;
