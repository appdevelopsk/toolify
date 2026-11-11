import { Link } from "@/lib/i18n/navigation";
import { listTools } from "@/lib/tools/registry";

/**
 * Intent-led navigation complements (rather than duplicates) per-tool Related tools.
 * Server-rendered links: navigable without JavaScript and visible to crawlers.
 * Deliberately scoped to indexed EN/JA locales while editorial copy is reviewed.
 */
export const TOOL_JOURNEYS = [
  { id: "deadline", en: "Plan a deadline", ja: "納期を決める",
    enDescription: "Calculate working days, set a due date, and check time zones.",
    jaDescription: "営業日を数え、締切日を決め、時差を確認します。",
    slugs: ["workdays-calculator", "date-calculator", "timezone-converter"] },
  { id: "writing", en: "Polish writing", ja: "文章を仕上げる",
    enDescription: "Check word count and reading time, then revise your text.",
    jaDescription: "文字数と読了時間を確認して文章を整えます。",
    slugs: ["word-counter", "reading-time-calculator", "text-replace"] },
  { id: "data", en: "Clean and convert data", ja: "データを整形する",
    enDescription: "Convert CSV, format JSON, and remove duplicate lines.",
    jaDescription: "CSVを変換し、JSONを整形して重複行を削除します。",
    slugs: ["csv-json-converter", "json-formatter", "duplicate-line-remover"] },
  { id: "design", en: "Prepare a web image", ja: "Web画像を準備する",
    enDescription: "Resize an image, verify proportions, then work with colors.",
    jaDescription: "画像をリサイズし、縦横比と色を確認します。",
    slugs: ["image-resizer", "aspect-ratio-calculator", "color-converter"] },
] as const;

export function ToolJourneys({ locale, toolTitle }: { locale: string; toolTitle: (slug: string) => string }) {
  if (locale !== "en" && locale !== "ja") return null;
  const ja = locale === "ja";
  const validSlugs = new Set(listTools().map((tool) => tool.slug));

  return (
    <section className="mt-12" aria-labelledby="goal-journeys-heading">
      <div className="mb-5">
        <h2 id="goal-journeys-heading" className="text-xl font-bold">
          {ja ? "目的からツールを探す" : "Start with what you want to do"}
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          {ja ? "作業を進める順番に、おすすめの無料ツールをまとめました。入力内容は引き継がれません。" : "Follow a practical sequence of free tools. Your inputs are not transferred between tools."}
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {TOOL_JOURNEYS.map((journey) => (
          <article key={journey.id} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="font-bold">{ja ? journey.ja : journey.en}</h3>
            <p className="mt-2 min-h-12 text-sm text-slate-600 dark:text-slate-400">
              {ja ? journey.jaDescription : journey.enDescription}
            </p>
            <ol className="mt-4 space-y-3">
              {journey.slugs.filter((slug) => validSlugs.has(slug)).map((slug, index) => (
                <li key={slug} className="flex items-start gap-2 text-sm">
                  <span aria-hidden="true" className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 font-semibold text-brand-700 dark:bg-slate-800 dark:text-brand-400">{index + 1}</span>
                  <Link prefetch={false} href={`/tools/${slug}`} className="min-h-9 rounded text-brand-700 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-brand-400">
                    {toolTitle(slug)}
                  </Link>
                </li>
              ))}
            </ol>
            {validSlugs.has(journey.slugs[0]) && (
              <Link prefetch={false} href={`/tools/${journey.slugs[0]}`}
                className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                {ja ? "最初のツールを開く" : "Start this workflow"} →
              </Link>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
