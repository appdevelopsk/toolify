"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { copyText } from "@/lib/clipboard/copyText";
import { useToolEvents } from "@/lib/analytics/useToolEvents";

/** Convenience action for publishers; fallback remains the selectable textarea. */
export function CopyEmbedSnippet({ snippet, slug }: { snippet: string; slug: string }) {
  const t = useTranslations("tool");
  const [copied, setCopied] = useState(false);
  const { copyResult } = useToolEvents(slug);

  async function handleCopy() {
    const success = await copyText(snippet);
    setCopied(success);
    // Only successful deliberate copies count as interest in publishing.
    if (success) copyResult("embed");
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="min-h-11 rounded-md border border-brand-600 px-4 text-sm font-semibold text-brand-700 hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-brand-400 dark:hover:bg-slate-800"
    >
      {copied ? t("copied") : t("copy")}
    </button>
  );
}
