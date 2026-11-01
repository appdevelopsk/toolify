import { Link } from "@/lib/i18n/navigation";
import type { ToolMeta } from "@/lib/tools/types";
import { CATEGORY_CONFIG } from "@/lib/tools/categories";

/** カード描画に要るのは slug と category だけ。クライアントへ渡す props を小さく保つため Pick にする。 */
export type ToolCardMeta = Pick<ToolMeta, "slug" | "category">;

export function ToolCard({ meta, title, description }: { meta: ToolCardMeta; title: string; description: string }) {
  const cfg = CATEGORY_CONFIG[meta.category];
  return (
    <Link
      href={`/tools/${meta.slug}`}
      className="group flex min-h-28 items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-brand-700"
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xl ${cfg.iconBg}`}
        aria-hidden
      >
        {cfg.emoji}
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold leading-snug group-hover:text-brand-600 dark:group-hover:text-brand-500">
          {title}
        </h3>
        <p className="mt-0.5 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">{description}</p>
      </div>
    </Link>
  );
}
