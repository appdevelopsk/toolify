import { JourneyLink } from "./JourneyLink";
import { journeyCopyFor } from "./journeyCopy";
import { listTools } from "@/lib/tools/registry";

/**
 * Goal-first navigation uses translated descriptions and existing localized
 * tool titles. It is a usability feature for all 17 active locales; showing
 * journeys does not change per-tool noindex and sitemap eligibility.
 */
export const TOOL_JOURNEYS = [
  {
    id: "deadline", titleKey: "deadlineTitle", descriptionKey: "deadlineDescription",
    slugs: ["workdays-calculator", "date-calculator", "timezone-converter"],
  },
  {
    id: "writing", titleKey: "writingTitle", descriptionKey: "writingDescription",
    slugs: ["word-counter", "reading-time-calculator", "text-replace"],
  },
  {
    id: "data", titleKey: "dataTitle", descriptionKey: "dataDescription",
    slugs: ["csv-json-converter", "json-formatter", "duplicate-line-remover"],
  },
  {
    id: "design", titleKey: "designTitle", descriptionKey: "designDescription",
    slugs: ["image-resizer", "aspect-ratio-calculator", "color-converter"],
  },
] as const;

export function ToolJourneys({ locale, toolTitle }: { locale: string; toolTitle: (slug: string) => string }) {
  const copy = journeyCopyFor(locale);
  const validSlugs = new Set(listTools().map((tool) => tool.slug));

  return (
    <section className="mt-12" aria-labelledby="goal-journeys-heading">
      <div className="mb-5">
        <h2 id="goal-journeys-heading" className="text-xl font-bold">
          {copy.heading}
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          {copy.intro}
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {TOOL_JOURNEYS.map((journey) => (
          <article key={journey.id} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="font-bold">{copy[journey.titleKey]}</h3>
            <p className="mt-2 min-h-12 text-sm text-slate-600 dark:text-slate-400">
              {copy[journey.descriptionKey]}
            </p>
            <ol className="mt-4 space-y-3">
              {journey.slugs.filter((slug) => validSlugs.has(slug)).map((slug, index) => (
                <li key={slug} className="flex items-start gap-2 text-sm">
                  <span aria-hidden="true" className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 font-semibold text-brand-700 dark:bg-slate-800 dark:text-brand-400">{index + 1}</span>
                  <JourneyLink journey={journey.id} destination={slug} locale={locale} position={index + 1} href={`/tools/${slug}`} className="min-h-9 rounded text-brand-700 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-brand-400">
                    {toolTitle(slug)}
                  </JourneyLink>
                </li>
              ))}
            </ol>
            {validSlugs.has(journey.slugs[0]) && (
              <JourneyLink journey={journey.id} destination={journey.slugs[0]} locale={locale} position={1} href={`/tools/${journey.slugs[0]}`}
                className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                {copy.cta} →
              </JourneyLink>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
