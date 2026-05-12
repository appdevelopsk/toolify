import { Link } from "@/lib/i18n/navigation";
import type { ToolMeta } from "@/lib/tools/types";
import { CATEGORY_CONFIG } from "@/lib/tools/categories";

export function ToolCard({ meta, title, description }: { meta: ToolMeta; title: string; description: string }) {
  const cfg = CATEGORY_CONFIG[meta.category];
  return (
    <Link
      href={`/tools/${meta.slug}`}
      className="group flex items-start gap-3 rounded-xl border border-slate-200 p-4 transition-all hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:hover:border-slate-700"
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xl ${cfg.iconBg}`}
        aria-hidden
      >
        {cfg.emoji}
      </span>
      <div className="min-w-0">
        <h3 className="font-semibold leading-snug group-hover:text-brand-600 dark:group-hover:text-brand-500">
          {title}
        </h3>
        <p className="mt-0.5 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{description}</p>
      </div>
    </Link>
  );
}
