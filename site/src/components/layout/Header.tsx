import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Header() {
  const t = useTranslations();
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="text-lg font-bold tracking-tight">
          {t("site.name")}
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/tools" className="hover:underline">
            {t("nav.tools")}
          </Link>
          <Link href="/prompts" className="hover:underline">
            {t("nav.prompts")}
          </Link>
          <Link href="/about" className="hover:underline">
            {t("nav.about")}
          </Link>
          <LanguageSwitcher />
        </nav>
      </div>
    </header>
  );
}
