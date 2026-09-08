"use client";

import { useMemo } from "react";
import { useMessages } from "next-intl";
import type { CategoryKeywords } from "./matcher";

/** messages.tool.categoryKeywords(翻訳済みカテゴリ語)を取り出す。無ければ空。 */
export function useCategoryKeywords(): CategoryKeywords {
  const messages = useMessages() as { tool?: { categoryKeywords?: Record<string, string> } };
  return useMemo(() => (messages.tool?.categoryKeywords ?? {}) as CategoryKeywords, [messages]);
}
