import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { isPromptLocale } from "@/lib/i18n/locales";

export function Header() {
  const t = useTranslations();
  const locale = useLocale();
  const showPrompts = isPromptLocale(locale);
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/90">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-base leading-none text-white">
            🔧
          </span>
          {t("site.name")}
        </Link>
        <nav className="flex items-center gap-5 text-sm font-medium">
          <Link href="/tools" className="text-slate-600 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-500">
            {t("nav.tools")}
          </Link>
          {showPrompts && (
            <Link href="/prompts" className="text-slate-600 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-500">
              {t("nav.prompts")}
            </Link>
          )}
          <Link href="/about" className="hidden text-slate-600 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-500 sm:inline">
            {t("nav.about")}
          </Link>
          <LanguageSwitcher />
        </nav>
      </div>
    </header>
  );
}
