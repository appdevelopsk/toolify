import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { buildMetadata } from "@/lib/seo/metadata";
import { siteConfig } from "@/lib/config";
import type { Locale } from "@/lib/i18n/locales";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return buildMetadata({ locale: locale as Locale, title: t("nav.about"), description: t("site.description"), path: "/about" });
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const isJa = locale === "ja";
  return (
    <div className="prose prose-slate mx-auto max-w-3xl px-4 py-10 dark:prose-invert">
      <h1>{t("nav.about")}</h1>
      {isJa ? (
        <>
          <p>
            {siteConfig.name} は、ブラウザだけで使える無料ツール集です。健康・計算・変換・日付・テキストなど、
            日常で「ちょっと知りたい」場面に答える小さなツールを集めて公開しています。
          </p>
          <h2>方針</h2>
          <ul>
            <li>すべての処理はあなたのブラウザ内で完結し、入力データはサーバーに送信されません。</li>
            <li>正確性と読みやすさを重視し、各ツールには計算式・出典・注意点を併記しています。</li>
            <li>無料運営のため広告（Google AdSense）を表示していますが、利用に対価は不要です。</li>
            <li>
              ツールごとに最終更新日を明記し、計算式の変更や算定基準の更新を反映しています。
            </li>
          </ul>
          <h2>運営</h2>
          <p>
            運営: {siteConfig.organization}。お問い合わせは
            <a href={`mailto:${siteConfig.contactEmail}`}> {siteConfig.contactEmail} </a>
            まで。
          </p>
        </>
      ) : (
        <>
          <p>
            {siteConfig.name} is a free collection of online utilities that run entirely in your browser.
            We build small, focused tools for the kinds of everyday questions that don't deserve a full app.
          </p>
          <h2>Our principles</h2>
          <ul>
            <li>Everything runs locally in your browser. We don't send your inputs to a server.</li>
            <li>Each tool ships with its formula, sources, and caveats so you can trust the result.</li>
            <li>We rely on Google AdSense to keep the site free — no subscription, no paywall.</li>
            <li>We track when each tool was last updated and revise it when standards change.</li>
          </ul>
          <h2>About us</h2>
          <p>
            Operated by {siteConfig.organization}. Reach us at
            <a href={`mailto:${siteConfig.contactEmail}`}> {siteConfig.contactEmail}</a>.
          </p>
        </>
      )}
    </div>
  );
}
