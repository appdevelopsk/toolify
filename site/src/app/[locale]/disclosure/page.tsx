import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { buildMetadata } from "@/lib/seo/metadata";
import { siteConfig } from "@/lib/config";
import type { Locale } from "@/lib/i18n/locales";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return buildMetadata({
    locale: locale as Locale,
    title: t("affiliate.footerLink"),
    description: t("site.description"),
    path: "/disclosure",
  });
}

export default async function DisclosurePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="prose prose-slate mx-auto max-w-3xl px-4 py-10 dark:prose-invert">
      {locale === "ja" ? <Ja /> : locale === "zh-CN" ? <Zh /> : <En />}
    </div>
  );
}

function En() {
  return (
    <>
      <h1>Advertising & Affiliate Disclosure</h1>
      <p>Last updated: 2026-05-07</p>
      <p>
        {siteConfig.name} ({siteConfig.url}) is supported by advertising and affiliate partnerships. This page explains
        what that means and how it affects you.
      </p>

      <h2>What you'll see on the site</h2>
      <ul>
        <li>
          <strong>Display ads.</strong> Served by Google AdSense and clearly bordered. Ads are personalized for users
          who consent under our cookie banner; non-personalized ads are shown otherwise.
        </li>
        <li>
          <strong>Affiliate cards.</strong> Cards labelled <em>&ldquo;Sponsored&rdquo;</em> in the
          &ldquo;Recommended services&rdquo; sections at the bottom of tool pages. Clicking these may open a third-party
          site and may earn us a commission if you buy or sign up. The price you pay is unchanged.
        </li>
      </ul>

      <h2>How we choose advertised products</h2>
      <p>
        We only feature services we consider relevant to a tool's category. We never accept paid placement for products
        we wouldn't otherwise recommend. We update or remove offers if a partner's quality drops.
      </p>

      <h2>How affiliate income flows</h2>
      <ul>
        <li>You click a &ldquo;Sponsored&rdquo; card or button.</li>
        <li>You're directed to the partner's site through a tracked URL.</li>
        <li>If you complete a qualifying action (sign-up, purchase, etc.), the partner pays us a commission.</li>
        <li>Commissions support the free tools and content on this site.</li>
      </ul>

      <h2>Networks we use</h2>
      <p>We work (or plan to work) with networks including Amazon Associates, A8.net, Moshimo Affiliate, Rakuten
      Affiliate, ValueCommerce, and direct partner programs (Adobe, 1Password, Notion, etc.). Not all networks are
      live in all regions.</p>

      <h2>Independence</h2>
      <p>
        Compensation never influences our editorial content (the calculator outputs, articles, FAQs). Tool answers,
        explanations, and FAQ replies are written independently of any sponsorship.
      </p>

      <h2>Your choices</h2>
      <p>
        You are not required to click affiliate links. The tools themselves remain free without any interaction with
        advertising or affiliate offers. Reject the cookie banner to opt out of personalized advertising.
      </p>

      <h2>Questions</h2>
      <p>
        Email <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a> for any question about a
        specific link, partner, or this disclosure.
      </p>
    </>
  );
}

function Ja() {
  return (
    <>
      <h1>広告・アフィリエイトに関する開示</h1>
      <p>最終更新日: 2026-05-07</p>
      <p>
        {siteConfig.name}（{siteConfig.url}）は、広告およびアフィリエイトパートナーシップによって運営されています。
        本ページは、その内容と利用者への影響について説明します（景品表示法ステマ規制・特定商取引法に基づく開示）。
      </p>

      <h2>表示される広告の種類</h2>
      <ul>
        <li>
          <strong>ディスプレイ広告：</strong>Google AdSense によって配信され、枠線で明示されます。Cookie同意を
          いただいた場合はパーソナライズ広告、それ以外は非パーソナライズ広告を表示します。
        </li>
        <li>
          <strong>アフィリエイト紹介：</strong>各ツールページ下部の「おすすめサービス」セクションに、
          <em>「広告」</em>ラベル付きで掲載しています。クリックすると第三者サイトに遷移し、
          そこで購入・登録が成立した場合に当方が紹介料を受け取る場合があります。
          利用者の支払額が変わることはありません。
        </li>
      </ul>

      <h2>商品選定の方針</h2>
      <p>
        ツールのカテゴリに関連性の高いサービスのみ掲載します。利用者にお勧めできない商品の有償掲載はお断りしています。
        パートナーの品質が低下した場合は掲載を更新・停止します。
      </p>

      <h2>収益の流れ</h2>
      <ul>
        <li>「広告」ラベル付きカード／ボタンをクリック</li>
        <li>計測URLを介して提携先サイトへ遷移</li>
        <li>会員登録・購入等の成果条件を満たすと、提携先から当方に紹介料が支払われる</li>
        <li>紹介料は本サイトの無料ツール・コンテンツの維持運営に充当されます</li>
      </ul>

      <h2>利用ASP・パートナー</h2>
      <p>
        Amazonアソシエイト、A8.net、もしもアフィリエイト、楽天アフィリエイト、バリューコマース、および
        Adobe・1Password・Notionなど直接パートナープログラムと提携または提携予定です。
        全ASPがすべての地域で稼働しているわけではありません。
      </p>

      <h2>編集の独立性</h2>
      <p>
        広告報酬が記事内容（計算結果、解説、FAQ）に影響することはありません。ツールの数式、説明文、Q&A は
        スポンサーシップとは独立して執筆されています。
      </p>

      <h2>利用者の選択</h2>
      <p>
        アフィリエイトリンクをクリックする義務はありません。ツール本体は広告・アフィリエイトとの一切の
        関わりなしに無料でご利用いただけます。Cookieバナーで拒否すればパーソナライズ広告をオプトアウトできます。
      </p>

      <h2>特定商取引法に基づく表記</h2>
      <ul>
        <li>事業者: {siteConfig.organization}</li>
        <li>運営責任者: 坂本 健一郎（Kenichiro Sakamoto）</li>
        <li>お問い合わせ: <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a></li>
        <li>
          所在地: お問い合わせいただければ遅滞なく開示します（個人事業者のため、原則メールでのお問い合わせとさせて
          いただきます）。
        </li>
        <li>取引種類: アフィリエイト紹介（自社で物販・サービス提供は行っていません）</li>
      </ul>

      <h2>お問い合わせ</h2>
      <p>
        個別のリンク・パートナー・本ポリシーに関するご質問は
        <a href={`mailto:${siteConfig.contactEmail}`}> {siteConfig.contactEmail} </a>まで。
      </p>
    </>
  );
}

function Zh() {
  return (
    <>
      <h1>广告与联盟营销披露</h1>
      <p>最后更新: 2026-05-07</p>
      <p>
        {siteConfig.name}（{siteConfig.url}）由广告和联盟营销合作支持。本页说明这意味着什么以及对您的影响。
      </p>

      <h2>本站显示的内容</h2>
      <ul>
        <li>
          <strong>展示广告：</strong>由 Google AdSense 投放, 有明确边框。同意 Cookie 横幅的用户看到个性化广告;
          否则显示非个性化广告。
        </li>
        <li>
          <strong>联盟推荐卡片：</strong>位于工具页面底部「推荐服务」区域, 标注为<em>「广告」</em>。
          点击后会打开第三方网站, 若您完成购买或注册, 我们可能获得佣金。您支付的价格不变。
        </li>
      </ul>

      <h2>商品选择标准</h2>
      <p>
        我们仅推荐与工具类别相关的服务。绝不接受我们本不推荐产品的付费推广。合作方质量下降时我们会更新或移除。
      </p>

      <h2>联盟收入流向</h2>
      <ul>
        <li>您点击「广告」标签的卡片或按钮</li>
        <li>通过追踪 URL 进入合作伙伴网站</li>
        <li>若您完成符合条件的操作 (注册、购买等), 合作伙伴向我们支付佣金</li>
        <li>佣金支持本站免费工具和内容</li>
      </ul>

      <h2>合作的联盟网络</h2>
      <p>
        我们与 Amazon Associates、A8.net、Moshimo Affiliate、楽天 Affiliate、ValueCommerce, 以及 Adobe、1Password、
        Notion 等直接合作伙伴项目合作 (或计划合作)。并非所有网络在所有地区均已上线。
      </p>

      <h2>独立性</h2>
      <p>
        报酬绝不影响编辑内容 (计算器输出、文章、FAQ)。工具答案、说明、FAQ 回复与赞助独立编写。
      </p>

      <h2>您的选择</h2>
      <p>
        您没有义务点击联盟链接。工具本身无需与任何广告或联盟产品互动即可免费使用。拒绝 Cookie 横幅可选择不参与个性化广告。
      </p>

      <h2>问题反馈</h2>
      <p>
        关于具体链接、合作方或本披露的任何问题, 请发送邮件至
        <a href={`mailto:${siteConfig.contactEmail}`}> {siteConfig.contactEmail}</a>。
      </p>
    </>
  );
}
