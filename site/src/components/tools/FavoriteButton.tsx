"use client";

import { useTranslations } from "next-intl";
import { useFavorites } from "@/lib/favorites";

export function FavoriteButton({ slug }: { slug: string; title?: string }) {
  const t = useTranslations("tool");
  const { isFavorite, toggle } = useFavorites();
  const active = isFavorite(slug);
  const label = active ? t("removeFavorite") : t("addFavorite");

  return (
    <button
      type="button"
      onClick={() => toggle(slug)}
      aria-pressed={active}
      aria-label={label}
      title={label}
      className="mt-1 shrink-0 rounded-full p-1.5 text-slate-500 transition-colors hover:bg-amber-50 hover:text-amber-500 dark:hover:bg-slate-800"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-6 w-6"
        fill={active ? "#f59e0b" : "none"}
        stroke={active ? "#f59e0b" : "currentColor"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    </button>
  );
}
