import type { ToolMeta } from "@/lib/tools/types";

const meta: ToolMeta = {
    slug: "caesar-cipher",
    category: "text",
    applicationCategory: "UtilitiesApplication",
    updatedAt: "2026-11-28",
    related: ["base64-encoder", "hash-generator", "url-encoder"],
    primaryKeyword: { en: "caesar cipher", ja: "シーザー暗号" },
    hasHowTo: true,
    hasFaq: true,
    sources: [
      { label: "Suetonius, Life of Julius Caesar §56 (LacusCurtius, University of Chicago)", url: "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Suetonius/12Caesars/Julius*.html" },
      { label: "Wikipedia — Caesar cipher", url: "https://en.wikipedia.org/wiki/Caesar_cipher" },
      { label: "Wikipedia — ROT13", url: "https://en.wikipedia.org/wiki/ROT13" },
    ],
  };

export default meta;
