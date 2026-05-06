"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/lib/i18n/navigation";
import { LOCALE_DEFS, LOCALES } from "@/lib/i18n/locales";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <select
      aria-label="Language"
      value={locale}
      onChange={(e) => {
        const next = e.target.value as (typeof LOCALES)[number];
        router.replace(pathname, { locale: next });
      }}
      className="rounded border border-slate-300 bg-transparent px-2 py-1 text-sm dark:border-slate-700"
    >
      {LOCALE_DEFS.filter((l) => l.active).map((l) => (
        <option key={l.code} value={l.code}>
          {l.native}
        </option>
      ))}
    </select>
  );
}
