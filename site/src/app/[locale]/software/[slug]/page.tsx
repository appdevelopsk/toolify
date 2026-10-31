import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import { AVAILABLE_SOFTWARE, findSoftware } from "@/lib/software/catalog";
import { softwareCopy } from "@/lib/software/copy";
import { SoftwareWorkbench } from "@/components/software/SoftwareWorkbench";
export function generateStaticParams() {return AVAILABLE_SOFTWARE.map(p=>({slug:p.slug}));}
export default async function SoftwareProductPage({params}:{params:Promise<{locale:string;slug:string}>}) {
  const {locale,slug}=await params;setRequestLocale(locale);
  const product=findSoftware(slug); if(!product || product.mode!=="available") notFound();
  const t=softwareCopy(locale);
  const active=product.slug as "csv-cleaner-pro"|"json-studio"|"text-batch-studio";
  return <main className="mx-auto max-w-4xl px-4 py-12">
    <Link href="/software" className="text-sm text-brand-600">{t.back}</Link>
    <h1 className="mt-4 text-3xl font-bold">{product.name}</h1><p className="mt-2 text-slate-600 dark:text-slate-300">{product.description}</p>
    <p className="my-4 text-sm">{t.free}: {product.free}</p>
    <SoftwareWorkbench slug={active} labels={{input:t.input,output:t.output,process:t.process,download:t.download,limit:t.limit,placeholder:t.placeholder,error:t.error,minify:t.minify}}/>
    <p className="mt-4 text-sm text-slate-500">{t.privacy}</p>
    <p className="mt-2 text-sm text-slate-500">{t.payment}</p>
  </main>;
}
