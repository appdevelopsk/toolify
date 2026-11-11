import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import { LOCALES, type Locale } from "@/lib/i18n/locales";
import { buildMetadata } from "@/lib/seo/metadata";
import { buildPublisherEmbedSnippet, FEATURED_EMBED_SLUGS } from "@/lib/widgets/embed-guide";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const ja = locale === "ja";
  return buildMetadata({
    locale: locale as Locale,
    title: ja ? "ブログに無料ツールを埋め込む方法" : "Embed Free Online Tools on Your Website",
    description: ja
      ? "ブログや教育サイトにToolify365の無料計算ツールを設置する方法と、コピーできるiframeコードを紹介します。"
      : "Add free Toolify365 calculators to your blog or education website with copy-ready iframe code and an accessible link to the original tool.",
    path: "/embed-guide",
    // Installation helper, not a separate search-landing page competing with canonical tools.
    noindex: true,
  });
}

export default async function EmbedGuidePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const language = locale === "ja" ? "ja" : "en";
  const ja = language === "ja";
  const t = await getTranslations({ locale });
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <nav className="text-sm text-brand-700 dark:text-brand-400">
        <Link href="/tools" className="underline">{ja ? "無料ツール一覧" : "All free tools"}</Link>
      </nav>
      <h1 className="mt-5 text-3xl font-bold tracking-tight">
        {ja ? "無料ツールをあなたのサイトに埋め込む" : "Embed free calculators on your website"}
      </h1>
      <p className="mt-4 text-slate-700 dark:text-slate-300">
        {ja
          ? "ブログ、学習サイト、社内Wikiに実際に動く計算ツールを設置できます。下のコードをあなたのHTMLにコピーしてください。アカウント登録は不要です。"
          : "Let your visitors calculate working days, dates, percentages, or time zones without leaving your blog, classroom page, or documentation. Copy an iframe snippet into your HTML. No Toolify365 account required."}
      </p>
      <section className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-xl font-semibold">{ja ? "設置手順" : "How to install"}</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-6 text-sm leading-7">
          <li>{ja ? "下からツールを選び、コード欄をコピーします。" : "Choose a tool below and copy its complete HTML snippet."}</li>
          <li>{ja ? "サイトのHTML編集欄やカスタムHTMLブロックに貼り付けます。" : "Paste it into an HTML block or your website's page template."}</li>
          <li>{ja ? "PCとスマートフォンで表示を確認し、プレビューから操作します。" : "Preview the page and check keyboard and mobile usability."}</li>
        </ol>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          {ja
            ? "サイト側でiframeが禁止されている場合は、ツール本体への通常リンクをご利用ください。"
            : "If your publishing platform blocks iframes, link directly to the tool instead."}
        </p>
      </section>
      <section className="mt-10" aria-label={ja ? "利用可能なツール" : "Embed-ready tools"}>
        <h2 className="text-xl font-semibold">{ja ? "すぐ使える4つのツール" : "Four embed-ready tools"}</h2>
        <div className="mt-4 space-y-6">
          {FEATURED_EMBED_SLUGS.map((slug) => {
            const title = t(`tools.${slug}.title`);
            const snippet = buildPublisherEmbedSnippet(slug, title, language);
            return (
              <article key={slug} className="rounded-xl border border-slate-200 p-5 dark:border-slate-800">
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  {ja ? "iframeと、ツール本体への参照リンクをセットで設置できます。" : "Includes an iframe and a visible reference link to the original tool."}
                </p>
                <label htmlFor={`embed-${slug}`} className="mt-4 block text-sm font-medium">
                  {ja ? "コピーするHTML" : "Copy this HTML"}
                </label>
                <textarea
                  id={`embed-${slug}`}
                  readOnly
                  defaultValue={snippet}
                  rows={4}
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 p-3 font-mono text-xs dark:border-slate-700 dark:bg-slate-950"
                />
                <div className="mt-3 flex flex-wrap gap-4 text-sm">
                  <Link href={`/tools/${slug}`} className="text-brand-700 underline dark:text-brand-400">
                    {ja ? "ツール本体を見る" : "Open full tool"}
                  </Link>
                  <a href={`/embed/${language}/${slug}`} className="text-brand-700 underline dark:text-brand-400" target="_blank" rel="noopener noreferrer">
                    {ja ? "埋め込み表示を試す" : "Preview widget"}
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </section>
      <section className="mt-10 rounded-xl border border-slate-200 p-5 dark:border-slate-800">
        <h2 className="text-xl font-semibold">{ja ? "掲載時の注意" : "Publisher notes"}</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7">
          <li>{ja ? "ツールは外部サイトから読み込まれます。オフラインでは動きません。" : "The widget loads from Toolify365 and needs an internet connection."}</li>
          <li>{ja ? "配置するページにはツールの用途・制限を説明し、誤解を招く推薦や保証を付けないでください。" : "Explain the tool's purpose and limitations on your page; avoid misleading claims."}</li>
          <li>{ja ? "入力内容の機密性に注意し、設置前に個別ツールの動作を確認してください。" : "Do not embed in a workflow involving confidential data without reviewing the tool's behavior."}</li>
          <li>{ja ? "ツール本体への参照リンクは利用者が全画面で操作するためにも役立ちます。" : "Keep the included link so visitors can open the full-size accessible tool."}</li>
        </ul>
      </section>
    </main>
  );
}
