import type { ToolMeta } from "@/lib/tools/types";

const meta: ToolMeta = {
    slug: "csv-json-converter",
    category: "text",
    applicationCategory: "DeveloperApplication",
    updatedAt: "2026-11-15",
    related: ["json-formatter", "markdown-to-html", "text-replace"],
    primaryKeyword: { en: "CSV to JSON converter", ja: "CSV JSON 変換" },
    hasHowTo: true,
    hasFaq: true,
    sources: [
      { label: "RFC 4180 — Common Format and MIME Type for CSV Files", url: "https://www.rfc-editor.org/rfc/rfc4180" },
    ],
  };

export default meta;
