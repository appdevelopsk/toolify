import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { loadCommon, loadToolSlugMessages } from "@/lib/i18n/loader";
import { getTool, listTools } from "@/lib/tools/registry";
import { siteConfig } from "@/lib/config";
import { LOCALES, type Locale } from "@/lib/i18n/locales";

export function generateStaticParams() {
  return LOCALES.flatMap((locale) =>
    listTools().map((t) => ({ locale, slug: t.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const tool = getTool(slug);
  if (!tool) return {};
  const t = await getTranslations({ locale, namespace: `tools.${slug}` });
  // Widgets must not compete with the canonical tool page in search.
  return {
    title: t("title"),
    robots: { index: false, follow: true },
    alternates: { canonical: `${siteConfig.url}/${locale}/tools/${slug}` },
  };
}

export default async function EmbedPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const tool = getTool(slug);
  if (!tool) notFound();

  const tt = await getTranslations(`tools.${slug}`);
  const canonical = `${siteConfig.url}/${locale}/tools/${slug}`;
  const home = `${siteConfig.url}/${locale}`;

  // next-intl treats nested `messages` props atomically. Supply a single
  // complete but small dictionary so widgets can use both common labels and
  // their own tool translations. No 223-tool/prompt payload and no duplicate
  // serialization of the common dictionary from an outer provider.
  const [{ default: Component }, commonMessages, toolMessages] = await Promise.all([
    import(`@/tools/${slug}/Component`),
    loadCommon(locale),
    loadToolSlugMessages(locale, slug),
  ]);

  return (
    <div className="mx-auto max-w-2xl p-4">
      <a
        href={canonical}
        target="_blank"
        rel="noopener"
        className="block text-lg font-bold tracking-tight text-slate-900 hover:text-brand-600 dark:text-slate-100"
      >
        {tt("title")}
      </a>
      <section className="mt-3 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        {/* One provider: the common UI strings and this tool's translations.
            next-intl does not merge nested messages dictionaries. */}
        <NextIntlClientProvider
          locale={locale}
          messages={{ ...commonMessages, tools: { [slug]: toolMessages } }}
        >
          <Component />
        </NextIntlClientProvider>
      </section>
      <p className="mt-3 text-right text-xs text-slate-500">
        <a href={home} target="_blank" rel="noopener" className="hover:text-brand-600 hover:underline">
          {`Powered by ${siteConfig.name}`}
        </a>
      </p>
    </div>
  );
}
