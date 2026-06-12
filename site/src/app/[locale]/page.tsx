import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { Link } from "@/lib/i18n/navigation";
import { listTools } from "@/lib/tools/registry";
import { listPrompts } from "@/lib/prompts/registry";
import { ToolCard } from "@/components/tools/ToolCard";
import { PromptCard } from "@/components/prompts/PromptCard";
import { AdBanner } from "@/components/ads/AdBanner";
import { buildMetadata } from "@/lib/seo/metadata";
import { CATEGORY_CONFIG } from "@/lib/tools/categories";
import type { Locale } from "@/lib/i18n/locales";
import type { ToolCategory } from "@/lib/tools/types";

const FEATURED_COUNT = 9;

/**
 * Validate a locale string for Intl.Collator (same backend as String.prototype.localeCompare).
 * Returns the canonical BCP-47 tag, or `undefined` to fall back to the runtime default.
 * Guards against `RangeError: Incorrect locale information provided` when bots hit the
 * [locale] route with arbitrary path segments (e.g. /wp-admin/, /sitemap/).
 * Uses Intl.Collator for validation because getCanonicalLocales accepts structurally
 * valid-looking tags that Collator may still reject.
 */
function safeLocale(input: string): string | undefined {
  try {
    const [canonical] = Intl.getCanonicalLocales(input);
    if (canonical) new Intl.Collator(canonical); // verify Collator accepts it
    return canonical;
  } catch {
    return undefined;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "site" });
  return buildMetadata({
    locale: locale as Locale,
    title: `${t("name")} — ${t("tagline")}`,
    description: t("description"),
    path: "",
  });
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const collatorLocale = safeLocale(locale);
  const t = await getTranslations();
  const allTools = listTools();
  const allPrompts = listPrompts();
  const featured = allTools.slice(0, FEATURED_COUNT);
  const remainingCount = allTools.length - featured.length;

  const byCategory = new Map<string, number>();
  for (const m of allTools) {
    byCategory.set(m.category, (byCategory.get(m.category) ?? 0) + 1);
  }

  return (
    <div className="mx-auto max-w-6xl px-4">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="py-16 text-center">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700 dark:border-slate-700 dark:bg-slate-800 dark:text-brand-500">
          <span aria-hidden>⚡</span>
          {allTools.length} free tools · no login required
        </div>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
          {t("home.heading")}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-slate-600 dark:text-slate-400">
          {t("home.subheading")}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/tools"
            prefetch={false}
            className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
          >
            {t("home.browseAll")} →
          </Link>
          <Link
            href="/prompts"
            prefetch={false}
            className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {t("nav.prompts")} →
          </Link>
        </div>
      </section>

      <AdBanner className="mt-0 mb-8" />

      {/* ── Why Toolify (trust + brand) ───────────────────────────────── */}
      <section className="mb-12 rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900/40 sm:p-8">
        <h2 className="text-xl font-bold">{t("home.whyTitle")}</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{t("home.whyIntro")}</p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <span aria-hidden>🔒</span>
              {t("home.whyPrivacyTitle")}
            </h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{t("home.whyPrivacyText")}</p>
          </div>
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <span aria-hidden>⚡</span>
              {t("home.whyNoSignupTitle")}
            </h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{t("home.whyNoSignupText")}</p>
          </div>
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <span aria-hidden>📐</span>
              {t("home.whyAccurateTitle")}
            </h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{t("home.whyAccurateText")}</p>
          </div>
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <span aria-hidden>🌐</span>
              {t("home.whyMultilingualTitle")}
            </h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{t("home.whyMultilingualText")}</p>
          </div>
        </div>
      </section>

      {/* ── Featured cluster: Pregnancy & Fertility ───────────────────── */}
      <section className="mb-12">
        <Link
          href="/pregnancy"
          prefetch={false}
          className="group block rounded-2xl border border-rose-200 bg-rose-50 p-6 transition hover:border-rose-300 hover:shadow-md dark:border-rose-900/40 dark:bg-rose-900/20 sm:p-8"
        >
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-2xl dark:bg-rose-900/40" aria-hidden>
              🤰
            </span>
            <div>
              <h2 className="text-xl font-bold group-hover:text-rose-700 dark:group-hover:text-rose-300">
                {t("pregnancy.title")}
              </h2>
              <p className="mt-1 max-w-2xl text-sm text-slate-600 dark:text-slate-400">{t("pregnancy.intro")}</p>
              <span className="mt-3 inline-block text-sm font-semibold text-rose-700 dark:text-rose-300">
                {t("home.browseAll")} →
              </span>
            </div>
          </div>
        </Link>
      </section>

      {/* ── Category grid ─────────────────────────────────────────────── */}
      <section>
        <h2 className="text-xl font-bold">{t("home.byCategory")}</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from(byCategory.entries())
            .sort((a, b) => b[1] - a[1])
            .map(([cat, count]) => {
              const cfg = CATEGORY_CONFIG[cat as ToolCategory];
              return (
                <Link
                  key={cat}
                  href={`/tools#${cat}`}
                  prefetch={false}
                  className="group flex items-center gap-3 rounded-xl border border-slate-200 p-4 transition-all hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:hover:border-slate-700"
                >
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-2xl ${cfg.iconBg}`}
                    aria-hidden
                  >
                    {cfg.emoji}
                  </span>
                  <div>
                    <div className="text-sm font-semibold group-hover:text-brand-600 dark:group-hover:text-brand-500">
                      {cfg.label}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      {t("home.toolsCount", { n: count })}
                    </div>
                  </div>
                </Link>
              );
            })}
        </div>
      </section>

      {/* ── Popular tools ─────────────────────────────────────────────── */}
      <section className="mt-12">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-bold">{t("home.popular")}</h2>
          <Link href="/tools" className="text-sm text-brand-600 hover:underline dark:text-brand-500">
            {remainingCount > 0 ? t("home.morePlus", { n: remainingCount }) : t("home.browseAll")} →
          </Link>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((m) => (
            <ToolCard
              key={m.slug}
              meta={m}
              title={t(`tools.${m.slug}.title`)}
              description={t(`tools.${m.slug}.shortDescription`)}
            />
          ))}
        </div>
      </section>

      {/* ── AI Prompts ────────────────────────────────────────────────── */}
      {allPrompts.length > 0 && (
        <section className="mt-12">
          <div className="flex items-baseline justify-between">
            <h2 className="text-xl font-bold">{t("nav.prompts")}</h2>
            <Link href="/prompts" className="text-sm text-brand-600 hover:underline dark:text-brand-500">
              {t("home.browseAll")} →
            </Link>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {allPrompts.map((m) => (
              <PromptCard
                key={m.slug}
                meta={m}
                title={t.raw(`prompts.${m.slug}.title`) as string}
                description={t.raw(`prompts.${m.slug}.shortDescription`) as string}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── A-Z catalog (SEO: every tool reachable in one click from home) ── */}
      <section className="mt-12 border-t border-slate-200 pt-10 dark:border-slate-800">
        <h2 className="text-xl font-bold">{t("home.allTools")}</h2>
        <ul className="mt-4 grid gap-x-4 gap-y-1 text-sm sm:grid-cols-2 lg:grid-cols-3">
          {allTools
            .slice()
            .sort((a, b) => {
              const aTitle = t(`tools.${a.slug}.title`);
              const bTitle = t(`tools.${b.slug}.title`);
              try {
                return aTitle.localeCompare(bTitle, collatorLocale);
              } catch {
                return aTitle < bTitle ? -1 : aTitle > bTitle ? 1 : 0;
              }
            })
            .map((m) => (
              <li key={m.slug}>
                <Link
                  href={`/tools/${m.slug}`}
                  className="text-slate-600 hover:text-brand-600 hover:underline dark:text-slate-400 dark:hover:text-brand-500"
                >
                  {t(`tools.${m.slug}.title`)}
                </Link>
              </li>
            ))}
        </ul>
      </section>
    </div>
  );
}
