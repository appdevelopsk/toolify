import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("errors");
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <h1 className="text-3xl font-bold">{t("notFound")}</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">{t("notFoundBody")}</p>
      <Link href="/" className="mt-6 inline-block rounded bg-brand-600 px-4 py-2 text-white">
        {t("backHome")}
      </Link>
    </div>
  );
}
