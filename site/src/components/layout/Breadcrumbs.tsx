import { Link } from "@/lib/i18n/navigation";

interface BreadcrumbItem {
  name: string;
  href?: string;
}

export function Breadcrumbs({
  items,
  hideCurrentOnMobile = false,
}: {
  items: BreadcrumbItem[];
  /** スマホ幅で現在ページの項目(直後の H1 と同じ文言)を隠し、パンくずを1行に収める */
  hideCurrentOnMobile?: boolean;
}) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-slate-600 dark:text-slate-400">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((it, i) => {
          const last = i === items.length - 1;
          return (
            <li key={i} className={`items-center gap-1 ${last && hideCurrentOnMobile ? "hidden sm:flex" : "flex"}`}>
              {it.href && !last ? (
                <Link href={it.href} className="hover:underline">
                  {it.name}
                </Link>
              ) : (
                <span aria-current={last ? "page" : undefined} className={last ? "text-slate-700 dark:text-slate-300" : ""}>
                  {it.name}
                </span>
              )}
              {!last && <span aria-hidden>›</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
