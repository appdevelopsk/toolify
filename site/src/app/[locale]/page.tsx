import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { Link } from "@/lib/i18n/navigation";
import { listTools } from "@/lib/tools/registry";
import { listPrompts } from "@/lib/prompts/registry";
import { ToolCard } from "@/components/tools/ToolCard";
import { PromptCard } from "@/components/prompts/PromptCard";
import { AdBanner, AdInFeed } from "@/components/ads/AdBanner";
import { RelatedServices } from "@/components/affiliates/RelatedServices";
import { buildMetadata } from "@/lib/seo/metadata";
import { CATEGORY_CONFIG } from "@/lib/tools/categories";
import type { Locale } from "@/lib/i18n/locales";
import type { ToolCategory, ToolMeta } from "@/lib/tools/types";

const FEATURED_COUNT = 9;

const WHY_ITEMS = [
  { emoji: "🔒", title: "home.whyPrivacyTitle", text: "home.whyPrivacyText", bg: "bg-sky-100 dark:bg-sky-950/50" },
  { emoji: "⚡", title: "home.whyNoSignupTitle", text: "home.whyNoSignupText", bg: "bg-amber-100 dark:bg-amber-950/50" },
  { emoji: "📐", title: "home.whyAccurateTitle", text: "home.whyAccurateText", bg: "bg-emerald-100 dark:bg-emerald-950/50" },
  { emoji: "🌐", title: "home.whyMultilingualTitle", text: "home.whyMultilingualText", bg: "bg-violet-100 dark:bg-violet-950/50" },
] as const;

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

  const toolTitle = (m: ToolMeta) => t(`tools.${m.slug}.title`);
  const byTitle = (a: ToolMeta, b: ToolMeta) => {
    const at = toolTitle(a);
    const bt = toolTitle(b);
    try {
      return at.localeCompare(bt, collatorLocale);
    } catch {
      return at < bt ? -1 : at > bt ? 1 : 0;
    }
  };

  // Tools grouped by category (largest first), each sorted A-Z by localized title.
  const grouped = (Object.keys(CATEGORY_CONFIG) as ToolCategory[])
    .map((cat) => ({
      cat,
      cfg: CATEGORY_CONFIG[cat],
      tools: allTools.filter((m) => m.category === cat).sort(byTitle),
    }))
    .filter((g) => g.tools.length > 0)
    .sort((a, b) => b.tools.length - a.tools.length);

  return (
    <div className="mx-auto max-w-6xl px-4">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative -mx-4 overflow-hidden bg-gradient-to-b from-brand-50 via-white to-white px-4 py-16 text-center dark:from-slate-900 dark:via-slate-950 dark:to-slate-950 sm:py-20">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 mx-auto h-64 max-w-3xl rounded-full bg-brand-200/30 blur-3xl dark:bg-brand-900/20"
        />
        <div className="inline-flex items-center gap-1.5 rounded-full border border-brand-100 bg-white/70 px-3 py-1 text-sm font-medium text-brand-700 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-800/70 dark:text-brand-500">
          <span aria-hidden>⚡</span>
          {allTools.length} free tools · no login required
        </div>
        <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl">
          {t("home.heading")}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-slate-600 dark:text-slate-400">
          {t("home.subheading")}
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
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
            className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {t("nav.prompts")} →
          </Link>
        </div>
        {/* Quick category jump chips */}
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {grouped.map(({ cat, cfg }) => (
            <Link
              key={cat}
              href={`/tools#${cat}`}
              prefetch={false}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 transition hover:border-brand-300 hover:text-brand-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-brand-700 dark:hover:text-brand-400"
            >
              <span aria-hidden>{cfg.emoji}</span>
              {cfg.label}
            </Link>
          ))}
        </div>
      </section>

      <AdBanner className="mt-8 mb-12" />

      {/* ── Why Toolify (trust + brand) ───────────────────────────────── */}
      <section className="mb-12">
        <h2 className="text-xl font-bold">{t("home.whyTitle")}</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{t("home.whyIntro")}</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {WHY_ITEMS.map((item) => (
            <div
              key={item.title}
              className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900/40"
            >
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-2xl ${item.bg}`}
                aria-hidden
              >
                {item.emoji}
              </span>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold">{t(item.title)}</h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{t(item.text)}</p>
              </div>
            </div>
          ))}
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
          {grouped.map(({ cat, cfg, tools }) => (
            <Link
              key={cat}
              href={`/tools#${cat}`}
              prefetch={false}
              className="group flex items-center gap-3 rounded-xl border border-slate-200 p-4 transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md dark:border-slate-800 dark:hover:border-brand-700"
            >
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-2xl ${cfg.iconBg}`}
                aria-hidden
              >
                {cfg.emoji}
              </span>
              <div className="min-w-0">
                <div className="text-sm font-semibold group-hover:text-brand-600 dark:group-hover:text-brand-500">
                  {cfg.label}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  {t("home.toolsCount", { n: tools.length })}
                </div>
              </div>
              <span className="ml-auto text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-500 dark:text-slate-600" aria-hidden>
                →
              </span>
            </Link>
          ))}
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

      {/* In-feed ad at a natural mid-page break (lazy, height-reserved). */}
      <AdInFeed className="my-12" />

      {/* ── Recommended services (cross-category affiliate, locale-aware) ── */}
      <RelatedServices featured />

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

      {/* ── Full catalog (SEO: every tool reachable in one click from home) ── */}
      <section className="mt-12 border-t border-slate-200 pt-10 dark:border-slate-800">
        <h2 className="text-xl font-bold">{t("home.allTools")}</h2>
        <div className="mt-5 space-y-3">
          {grouped.map(({ cat, cfg, tools }) => (
            <details
              key={cat}
              className="group rounded-2xl border border-slate-200 bg-white open:shadow-sm dark:border-slate-800 dark:bg-slate-900/40"
            >
              <summary className="flex cursor-pointer list-none items-center gap-3 p-4 marker:hidden">
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl ${cfg.iconBg}`}
                  aria-hidden
                >
                  {cfg.emoji}
                </span>
                <span className="font-semibold">{cfg.label}</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                  {t("home.toolsCount", { n: tools.length })}
                </span>
                <span className="ml-auto text-slate-400 transition-transform group-open:rotate-180" aria-hidden>
                  ▾
                </span>
              </summary>
              <ul className="grid gap-x-4 gap-y-1.5 border-t border-slate-100 p-4 text-sm dark:border-slate-800 sm:grid-cols-2 lg:grid-cols-3">
                {tools.map((m) => (
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
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
