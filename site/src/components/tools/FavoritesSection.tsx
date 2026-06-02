"use client";

import { useTranslations } from "next-intl";
import { ToolCard } from "@/components/tools/ToolCard";
import { useFavorites } from "@/lib/favorites";
import type { ToolMeta } from "@/lib/tools/types";

export interface FavItem {
  meta: ToolMeta;
  title: string;
  description: string;
}

/**
 * Renders the user's favorited tools at the top of the index.
 * Hydrates from localStorage; renders nothing until there is at least one favorite,
 * so it never produces layout shift for first-time visitors.
 */
export function FavoritesSection({ items }: { items: FavItem[] }) {
  const t = useTranslations("tool");
  const { favorites } = useFavorites();

  if (favorites.length === 0) return null;

  const order = new Map(favorites.map((slug, i) => [slug, i]));
  const picked = items
    .filter((it) => order.has(it.meta.slug))
    .sort((a, b) => (order.get(a.meta.slug)! - order.get(b.meta.slug)!));

  if (picked.length === 0) return null;

  return (
    <section className="mt-8 scroll-mt-20">
      <div className="flex items-center gap-3 border-b border-slate-200 pb-3 dark:border-slate-800">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-lg dark:bg-amber-900/40" aria-hidden>
          ⭐
        </span>
        <h2 className="text-xl font-bold">{t("favorites")}</h2>
        <span className="ml-auto rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {picked.length}
        </span>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {picked.map((it) => (
          <ToolCard key={it.meta.slug} meta={it.meta} title={it.title} description={it.description} />
        ))}
      </div>
    </section>
  );
}
