import { Link } from "@/lib/i18n/navigation";
import type { ToolMeta } from "@/lib/tools/types";

export function ToolCard({ meta, title, description }: { meta: ToolMeta; title: string; description: string }) {
  return (
    <Link
      href={`/tools/${meta.slug}`}
      className="group block rounded-lg border border-slate-200 p-5 transition hover:border-brand-500 hover:shadow-sm dark:border-slate-800"
    >
      <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">{meta.category}</div>
      <h3 className="mt-1 text-lg font-semibold group-hover:text-brand-600">{title}</h3>
      <p className="mt-1 line-clamp-2 text-sm text-slate-500">{description}</p>
    </Link>
  );
}
