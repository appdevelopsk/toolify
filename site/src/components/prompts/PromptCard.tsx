import { Link } from "@/lib/i18n/navigation";
import type { PromptMeta } from "@/lib/prompts/types";
import { PROMPT_CATEGORY_CONFIG } from "@/lib/prompts/categories";

export function PromptCard({
  meta,
  title,
  description,
}: {
  meta: PromptMeta;
  title: string;
  description: string;
}) {
  const cfg = PROMPT_CATEGORY_CONFIG[meta.category];
  return (
    <Link
      href={`/prompts/${meta.slug}`}
      className="group flex items-start gap-3 rounded-xl border border-slate-200 p-4 transition-all hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:hover:border-slate-700"
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xl ${cfg.iconBg}`}
        aria-hidden
      >
        {cfg.emoji}
      </span>
      <div className="min-w-0">
        <div className="text-xs text-slate-600 dark:text-slate-400">
          {meta.recommendedFor.slice(0, 2).join(" · ")}
        </div>
        <h3 className="font-semibold leading-snug group-hover:text-brand-600 dark:group-hover:text-brand-500">
          {title}
        </h3>
        <p className="mt-0.5 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">{description}</p>
      </div>
    </Link>
  );
}
