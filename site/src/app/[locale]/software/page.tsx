import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";
import type { Locale } from "@/lib/i18n/locales";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import { SOFTWARE_PRODUCTS } from "@/lib/software/catalog";
import { softwareDescription } from "@/lib/software/descriptions";
import { DISTRIBUTION } from "@/lib/software/distribution";
import { softwareCopy } from "@/lib/software/copy";
export async function generateMetadata({params}:{params:Promise<{locale:string}>}):Promise<Metadata>{
  const {locale}=await params; const t=softwareCopy(locale);
  // 2026-11-03: noindex。sitemap に無いのに index,follow だった(sitemap = index 対象と一致させる方針・10/11 d573a94)。
  // 製品説明が英語のみ(ja 等で混在)・需要実績なしの薄いページのため、需要と翻訳が揃うまで索引させない。
  return buildMetadata({locale:locale as Locale,title:t.title,description:`${t.subtitle} ${t.privacy}`,path:"/software",noindex:true});
}
export default async function SoftwareIndex({params}:{params:Promise<{locale:string}>}) {
  const {locale}=await params; setRequestLocale(locale); const t=softwareCopy(locale);
  return <main className="mx-auto max-w-6xl px-4 py-12">
    <h1 className="text-3xl font-bold">{t.title}</h1><p className="mt-3 text-slate-600 dark:text-slate-300">{t.subtitle}</p>
    <p className="mt-2 text-sm text-slate-500">{t.payment}</p>
    <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{SOFTWARE_PRODUCTS.map(p=><article key={p.slug} className="rounded-xl border border-slate-200 p-5 dark:border-slate-700">
      <div className="flex justify-between gap-2 text-xs"><span>{p.category}</span><span>{p.mode==="available"?t.available:t.planned}</span></div>
      <h2 className="mt-3 text-xl font-bold">{p.name}</h2><p className="mt-2 min-h-14 text-sm text-slate-600 dark:text-slate-300">{softwareDescription(p.slug, locale, p.description)}</p>
      <div className="mt-3 flex flex-wrap gap-1">{DISTRIBUTION[p.slug].map(target => <span key={target.platform} className="rounded border border-slate-200 px-2 py-0.5 text-xs text-slate-500 dark:border-slate-700">{target.platform} · {target.state==="live"?t.available:t.planned}</span>)}</div>
      <div className="mt-3 text-sm">{t.free}: {p.free}</div><div className="mt-1 text-xs text-slate-500">{t.pro}: {p.pro}</div>
      {p.mode==="available" && <Link href={`/software/${p.slug}`} prefetch={false} className="mt-5 inline-block rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white">{t.open}</Link>}
    </article>)}</div>
  </main>;
}
