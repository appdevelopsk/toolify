"use client";
import { useTranslations } from "next-intl";

/** Reuse the header's localized, keyboard-accessible search instead of a second index. */
export function HeroSearchTrigger() {
  const t = useTranslations("tool");
  return (
    <div className="mx-auto mt-8 max-w-2xl">
      <button
        type="button"
        aria-label={t("searchOpen")}
        onClick={() => document.dispatchEvent(new Event("toolify:open-search"))}
        className="flex min-h-14 w-full items-center gap-3 rounded-2xl border border-slate-300 bg-white px-5 py-3.5 text-start text-base text-slate-600 shadow-lg shadow-slate-900/5 transition hover:border-brand-400 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:focus-visible:ring-offset-slate-950"
      >
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <span className="flex-1">{t("searchPlaceholder")}</span>
        <span aria-hidden="true" className="hidden rounded border border-slate-200 px-2 py-0.5 text-xs text-slate-500 dark:border-slate-700 sm:inline">/</span>
      </button>
    </div>
  );
}
