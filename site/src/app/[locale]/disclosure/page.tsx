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
      {locale === "ja" ? <Ja /> : locale === "zh-CN" ? <Zh /> : locale === "es" ? <Es /> : locale === "pt-BR" ? <PtBR /> : locale === "ko" ? <Ko /> : locale === "fr" ? <Fr /> : locale === "de" ? <De /> : <En />}
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

function Es() {
  return (
    <>
      <h1>Divulgación de Publicidad y Afiliados</h1>
      <p>Última actualización: 2026-05-07</p>
      <p>{siteConfig.name} ({siteConfig.url}) está respaldado por publicidad y asociaciones de afiliados. Esta página explica qué significa eso y cómo te afecta.</p>
      <h2>Qué verás en el sitio</h2>
      <ul>
        <li><strong>Anuncios de display.</strong> Servidos por Google AdSense y claramente delimitados. Los anuncios son personalizados para usuarios que consientan mediante nuestro banner de cookies; de lo contrario se muestran no personalizados.</li>
        <li><strong>Tarjetas de afiliados.</strong> Tarjetas etiquetadas como <em>«Patrocinado»</em> en las secciones «Servicios recomendados» al final de las páginas de herramientas. Al hacer clic, puedes acceder a un sitio de terceros y podemos ganar una comisión si compras o te registras. El precio que pagas no varía.</li>
      </ul>
      <h2>Cómo elegimos los productos</h2>
      <p>Solo destacamos servicios relevantes para la categoría de la herramienta. Nunca aceptamos colocación pagada para productos que no recomendaríamos de otro modo.</p>
      <h2>Redes que usamos</h2>
      <p>Trabajamos (o planeamos trabajar) con Amazon Associates, A8.net, Moshimo Affiliate, Rakuten Affiliate, ValueCommerce y programas de socios directos. No todas las redes están activas en todas las regiones.</p>
      <h2>Independencia editorial</h2>
      <p>La compensación nunca influye en nuestro contenido editorial (resultados de calculadoras, artículos, preguntas frecuentes). Las respuestas de las herramientas se escriben de forma independiente de cualquier patrocinio.</p>
      <h2>Tus opciones</h2>
      <p>No estás obligado a hacer clic en enlaces de afiliados. Las herramientas son gratuitas sin ninguna interacción con publicidad u ofertas de afiliados. Rechaza el banner de cookies para optar por no recibir publicidad personalizada.</p>
      <h2>Preguntas</h2>
      <p>Escríbenos a <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a> para cualquier pregunta sobre un enlace, socio o esta divulgación.</p>
    </>
  );
}

function PtBR() {
  return (
    <>
      <h1>Divulgação de Publicidade e Afiliados</h1>
      <p>Última atualização: 2026-05-07</p>
      <p>{siteConfig.name} ({siteConfig.url}) é sustentado por publicidade e parcerias de afiliados. Esta página explica o que isso significa e como afeta você.</p>
      <h2>O que você verá no site</h2>
      <ul>
        <li><strong>Anúncios gráficos.</strong> Veiculados pelo Google AdSense e claramente delimitados. Os anúncios são personalizados para usuários que consentem por meio do banner de cookies; caso contrário, são exibidos não personalizados.</li>
        <li><strong>Cards de afiliados.</strong> Cards rotulados como <em>«Patrocinado»</em> nas seções «Serviços recomendados» no final das páginas de ferramentas. Clicar neles pode abrir um site de terceiros e podemos ganhar uma comissão se você comprar ou se cadastrar. O preço que você paga não muda.</li>
      </ul>
      <h2>Como escolhemos os produtos</h2>
      <p>Apenas destacamos serviços relevantes para a categoria da ferramenta. Nunca aceitamos colocação paga para produtos que não recomendaríamos de outra forma.</p>
      <h2>Redes que usamos</h2>
      <p>Trabalhamos (ou planejamos trabalhar) com Amazon Associates, A8.net, Moshimo Affiliate, Rakuten Affiliate, ValueCommerce e programas de parceiros diretos. Nem todas as redes estão ativas em todas as regiões.</p>
      <h2>Independência editorial</h2>
      <p>A remuneração nunca influencia nosso conteúdo editorial (resultados das calculadoras, artigos, FAQs). As respostas das ferramentas são escritas de forma independente de qualquer patrocínio.</p>
      <h2>Suas opções</h2>
      <p>Você não é obrigado a clicar em links de afiliados. As ferramentas permanecem gratuitas sem qualquer interação com publicidade ou ofertas de afiliados. Rejeite o banner de cookies para optar por não receber publicidade personalizada.</p>
      <h2>Dúvidas</h2>
      <p>Envie um e-mail para <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a> para qualquer dúvida sobre um link, parceiro ou esta divulgação.</p>
    </>
  );
}

function Ko() {
  return (
    <>
      <h1>광고 및 제휴 공개</h1>
      <p>최종 업데이트: 2026-05-07</p>
      <p>{siteConfig.name}（{siteConfig.url}）은 광고 및 제휴 파트너십을 통해 운영됩니다. 이 페이지는 그 의미와 귀하에게 미치는 영향을 설명합니다.</p>
      <h2>사이트에서 볼 수 있는 것</h2>
      <ul>
        <li><strong>디스플레이 광고.</strong> Google AdSense에서 제공하며 테두리로 명확히 구분됩니다. 쿠키 배너에서 동의한 사용자에게는 맞춤형 광고가, 그렇지 않은 경우에는 비맞춤형 광고가 표시됩니다.</li>
        <li><strong>제휴 카드.</strong> 도구 페이지 하단의 「추천 서비스」섹션에 <em>「광고」</em>로 표시된 카드입니다. 클릭하면 제3자 사이트로 이동하며, 구매 또는 가입 시 당사가 수수료를 받을 수 있습니다. 귀하의 결제 금액은 변하지 않습니다.</li>
      </ul>
      <h2>상품 선정 기준</h2>
      <p>도구 카테고리와 관련성이 높은 서비스만 소개합니다. 추천하지 않을 제품의 유료 게재는 수락하지 않습니다.</p>
      <h2>사용하는 네트워크</h2>
      <p>Amazon Associates, A8.net, Moshimo Affiliate, Rakuten Affiliate, ValueCommerce 및 직접 파트너 프로그램과 협력하고 있거나 협력할 예정입니다. 모든 네트워크가 모든 지역에서 운영되는 것은 아닙니다.</p>
      <h2>편집 독립성</h2>
      <p>수수료는 편집 내용（계산기 결과, 기사, FAQ）에 영향을 주지 않습니다. 도구 답변, 설명, FAQ 응답은 스폰서십과 독립적으로 작성됩니다.</p>
      <h2>귀하의 선택</h2>
      <p>제휴 링크를 클릭할 의무는 없습니다. 도구 자체는 광고나 제휴 상품과의 상호작용 없이 무료로 이용할 수 있습니다. 쿠키 배너를 거부하면 맞춤형 광고를 거부할 수 있습니다.</p>
      <h2>문의</h2>
      <p>특정 링크, 파트너 또는 본 공개에 관한 문의는 <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>로 보내주세요.</p>
    </>
  );
}

function Fr() {
  return (
    <>
      <h1>Divulgation publicitaire et d&apos;affiliation</h1>
      <p>Dernière mise à jour : 2026-05-07</p>
      <p>{siteConfig.name} ({siteConfig.url}) est soutenu par la publicité et des partenariats d&apos;affiliation. Cette page explique ce que cela signifie et comment cela vous affecte.</p>
      <h2>Ce que vous verrez sur le site</h2>
      <ul>
        <li><strong>Annonces display.</strong> Diffusées par Google AdSense et clairement délimitées. Les annonces sont personnalisées pour les utilisateurs qui consentent via notre bandeau cookie ; sinon, des annonces non personnalisées sont affichées.</li>
        <li><strong>Cartes d&apos;affiliation.</strong> Cartes étiquetées <em>«Sponsorisé»</em> dans les sections «Services recommandés» en bas des pages d&apos;outils. En cliquant, vous pouvez accéder à un site tiers et nous pouvons percevoir une commission si vous achetez ou vous inscrivez. Le prix que vous payez reste inchangé.</li>
      </ul>
      <h2>Comment nous choisissons les produits</h2>
      <p>Nous ne mettons en avant que des services pertinents pour la catégorie de l&apos;outil. Nous n&apos;acceptons jamais de placement payant pour des produits que nous ne recommanderions pas autrement.</p>
      <h2>Réseaux utilisés</h2>
      <p>Nous travaillons (ou prévoyons de travailler) avec Amazon Associates, A8.net, Moshimo Affiliate, Rakuten Affiliate, ValueCommerce et des programmes de partenaires directs. Tous les réseaux ne sont pas actifs dans toutes les régions.</p>
      <h2>Indépendance éditoriale</h2>
      <p>La rémunération n&apos;influence jamais notre contenu éditorial (résultats des calculatrices, articles, FAQ). Les réponses des outils sont rédigées indépendamment de tout parrainage.</p>
      <h2>Vos choix</h2>
      <p>Vous n&apos;êtes pas obligé de cliquer sur les liens d&apos;affiliation. Les outils restent gratuits sans aucune interaction avec la publicité ou les offres d&apos;affiliation. Refusez le bandeau cookie pour ne pas recevoir de publicité personnalisée.</p>
      <h2>Questions</h2>
      <p>Écrivez-nous à <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a> pour toute question sur un lien, un partenaire ou cette divulgation.</p>
    </>
  );
}

function De() {
  return (
    <>
      <h1>Werbe- und Affiliate-Offenlegung</h1>
      <p>Zuletzt aktualisiert: 2026-05-07</p>
      <p>{siteConfig.name} ({siteConfig.url}) wird durch Werbung und Affiliate-Partnerschaften unterstützt. Diese Seite erklärt, was das bedeutet und wie es Sie betrifft.</p>
      <h2>Was Sie auf der Website sehen</h2>
      <ul>
        <li><strong>Display-Anzeigen.</strong> Bereitgestellt von Google AdSense und klar umrandet. Anzeigen werden für Nutzer personalisiert, die über unser Cookie-Banner zustimmen; andernfalls werden nicht personalisierte Anzeigen angezeigt.</li>
        <li><strong>Affiliate-Karten.</strong> Karten mit der Bezeichnung <em>„Gesponsert"</em> in den Abschnitten „Empfohlene Dienste" am Ende der Werkzeugseiten. Das Anklicken kann eine Drittanbieter-Website öffnen, und wir erhalten möglicherweise eine Provision, wenn Sie kaufen oder sich anmelden. Der von Ihnen gezahlte Preis ändert sich nicht.</li>
      </ul>
      <h2>Wie wir Produkte auswählen</h2>
      <p>Wir empfehlen nur Dienste, die für die Kategorie des Werkzeugs relevant sind. Wir akzeptieren keine bezahlte Platzierung für Produkte, die wir anderweitig nicht empfehlen würden.</p>
      <h2>Netzwerke, die wir nutzen</h2>
      <p>Wir arbeiten (oder planen zu arbeiten) mit Amazon Associates, A8.net, Moshimo Affiliate, Rakuten Affiliate, ValueCommerce und direkten Partnerprogrammen. Nicht alle Netzwerke sind in allen Regionen aktiv.</p>
      <h2>Redaktionelle Unabhängigkeit</h2>
      <p>Vergütung beeinflusst niemals unsere redaktionellen Inhalte (Rechner-Ergebnisse, Artikel, FAQs). Werkzeugantworten, Erklärungen und FAQ-Antworten werden unabhängig von jeglichem Sponsoring verfasst.</p>
      <h2>Ihre Wahlmöglichkeiten</h2>
      <p>Sie sind nicht verpflichtet, auf Affiliate-Links zu klicken. Die Werkzeuge bleiben kostenlos ohne jegliche Interaktion mit Werbung oder Affiliate-Angeboten. Lehnen Sie das Cookie-Banner ab, um personalisierte Werbung abzuwählen.</p>
      <h2>Fragen</h2>
      <p>Schreiben Sie uns an <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a> bei Fragen zu einem bestimmten Link, Partner oder dieser Offenlegung.</p>
    </>
  );
}
