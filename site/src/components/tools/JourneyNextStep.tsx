import { TOOL_JOURNEYS } from "./ToolJourneys";
import { JourneyLink } from "./JourneyLink";
import { journeyCopyFor } from "./journeyCopy";

/**
 * Small follow-up CTA after the tool workspace. No localStorage, query parameter,
 * personal data, or result transfer; this simply reveals the next useful tool.
 */
export function JourneyNextStep({
  slug, locale, toolTitle,
}: { slug: string; locale: string; toolTitle: (slug: string) => string }) {
  if (locale !== "en" && locale !== "ja") return null;
  const journey = TOOL_JOURNEYS.find((item) => item.slugs.some((step) => step === slug));
  if (!journey) return null;
  const index = journey.slugs.findIndex((step) => step === slug);
  if (index < 0 || index === journey.slugs.length - 1) return null;
  const nextSlug = journey.slugs[index + 1];
  if (!nextSlug) return null;
  const ja = locale === "ja";
  const copy = journeyCopyFor(locale);
  return (
    <section className="mt-5 rounded-xl border border-brand-200 bg-brand-50 p-4 dark:border-brand-900 dark:bg-slate-900"
      aria-label={ja ? "次の作業" : "Next step"}>
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-400">
        {ja ? "次のステップ" : "Continue this workflow"} · {index + 2}/{journey.slugs.length}
      </p>
      <h2 className="mt-2 text-base font-bold">{copy[journey.titleKey]}</h2>
      <JourneyLink href={`/tools/${nextSlug}`} journey={journey.id}
        destination={nextSlug} locale={locale} position={index + 2}
        className="mt-3 inline-flex min-h-11 items-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
        {ja ? "次に使う：" : "Next tool: "}{toolTitle(nextSlug)} →
      </JourneyLink>
      <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
        {ja ? "入力したデータは次のツールへ引き継がれません。" : "Your inputs are not carried over to the next tool."}
      </p>
    </section>
  );
}
