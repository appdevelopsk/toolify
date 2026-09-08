"use client";

import { useEffect } from "react";
import { pushRecent } from "@/lib/recent";

/** ツールページのマウント時に slug を「最近使ったツール」へ積む。描画はしない(ハイドレーション後のみ)。 */
export function RecentTracker({ slug }: { slug: string }) {
  useEffect(() => {
    pushRecent(slug);
  }, [slug]);
  return null;
}
