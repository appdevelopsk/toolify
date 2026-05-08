import { Link } from "@/lib/i18n/navigation";
import type { PromptMeta } from "@/lib/prompts/types";

export function PromptCard({
  meta,
  title,
  description,
}: {
  meta: PromptMeta;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={`/prompts/${meta.slug}`}
      className="group block rounded-lg border border-slate-200 p-5 transition hover:border-brand-500 hover:shadow-sm dark:border-slate-800"
    >
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
        <span>{meta.category}</span>
        <span aria-hidden>·</span>
        <span>{meta.recommendedFor.slice(0, 3).join(" / ")}</span>
      </div>
      <h3 className="mt-1 text-lg font-semibold group-hover:text-brand-600">{title}</h3>
      <p className="mt-1 line-clamp-2 text-sm text-slate-500">{description}</p>
    </Link>
  );
}
