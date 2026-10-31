import { setRequestLocale } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import { SOFTWARE_PRODUCTS } from "@/lib/software/catalog";
import { softwareCopy } from "@/lib/software/copy";
export default async function SoftwareIndex({params}:{params:Promise<{locale:string}>}) {
  const {locale}=await params; setRequestLocale(locale); const t=softwareCopy(locale);
  return <main className="mx-auto max-w-6xl px-4 py-12">
    <h1 className="text-3xl font-bold">{t.title}</h1><p className="mt-3 text-slate-600 dark:text-slate-300">{t.subtitle}</p>
    <p className="mt-2 text-sm text-slate-500">{t.payment}</p>
    <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{SOFTWARE_PRODUCTS.map(p=><article key={p.slug} className="rounded-xl border border-slate-200 p-5 dark:border-slate-700">
      <div className="flex justify-between gap-2 text-xs"><span>{p.category}</span><span>{p.mode==="available"?t.available:t.planned}</span></div>
      <h2 className="mt-3 text-xl font-bold">{p.name}</h2><p className="mt-2 min-h-14 text-sm text-slate-600 dark:text-slate-300">{p.description}</p>
      <div className="mt-3 text-sm">{t.free}: {p.free}</div><div className="mt-1 text-xs text-slate-500">{t.pro}: {p.pro}</div>
      {p.mode==="available" && <Link href={`/software/${p.slug}`} prefetch={false} className="mt-5 inline-block rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white">{t.open}</Link>}
    </article>)}</div>
  </main>;
}
