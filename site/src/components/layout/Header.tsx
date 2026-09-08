import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { HeaderSearch } from "./HeaderSearch";
import { MobileMenu } from "./MobileMenu";
import { isPromptLocale } from "@/lib/i18n/locales";

/**
 * デスクトップ(sm以上): ロゴ / 検索 / ツール / プロンプト / About / 言語 — 従来の並び。
 * モバイル(<sm): ロゴ / 🔍 / ☰ の 3 点のみ。ナビと言語切替は MobileMenu に収容。
 */
export function Header() {
  const t = useTranslations();
  const locale = useLocale();
  const showPrompts = isPromptLocale(locale);
  const navCls = "text-slate-600 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-500";
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/90">
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3 sm:gap-4">
        <Link href="/" className="flex shrink-0 items-center gap-2 text-lg font-bold tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-base leading-none text-white">
            🔧
          </span>
          {t("site.name")}
        </Link>
        <div className="ml-auto flex items-center gap-1 sm:gap-4">
          <HeaderSearch />
          <nav className="hidden items-center gap-5 text-sm font-medium sm:flex">
            <Link href="/tools" className={navCls}>
              {t("nav.tools")}
            </Link>
            {showPrompts && (
              <Link href="/prompts" className={navCls}>
                {t("nav.prompts")}
              </Link>
            )}
            <Link href="/about" className={navCls}>
              {t("nav.about")}
            </Link>
            <LanguageSwitcher />
          </nav>
          <MobileMenu showPrompts={showPrompts}>
            <LanguageSwitcher />
          </MobileMenu>
        </div>
      </div>
    </header>
  );
}
