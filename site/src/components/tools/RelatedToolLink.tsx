"use client";

import type { ReactNode } from "react";
import { Link } from "@/lib/i18n/navigation";
import { trackRelatedClick } from "@/lib/analytics/events";

/**
 * 関連ツールのチップ。クリックを GA4 `related_click` として送る
 * (tool_slug=いま居るツール / label=行き先 slug)。
 * 「計算した → 関連導線へ進んだ」をツール別に測るための計装。
 */
export function RelatedToolLink({
  from,
  to,
  locale,
  category,
  className,
  children,
}: {
  from: string;
  to: string;
  locale?: string;
  category?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={`/tools/${to}`}
      className={className}
      onClick={() => trackRelatedClick({ tool: from, locale, category, label: to })}
    >
      {children}
    </Link>
  );
}
