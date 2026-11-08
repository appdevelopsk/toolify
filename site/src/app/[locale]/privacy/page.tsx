import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { buildMetadata } from "@/lib/seo/metadata";
import { siteConfig } from "@/lib/config";
import type { Locale } from "@/lib/i18n/locales";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return buildMetadata({ locale: locale as Locale, title: t("nav.privacy"), description: t("site.description"), path: "/privacy", noindex: true /* 2026-10-11 索引対象を需要のあるツールへ絞った(sitemap.ts) */ });
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  if (locale === "ja") return <div className="prose prose-slate mx-auto max-w-3xl px-4 py-10 dark:prose-invert"><PrivacyJa /></div>;
  if (locale === "zh-CN") return <div className="prose prose-slate mx-auto max-w-3xl px-4 py-10 dark:prose-invert"><PrivacyZhCN /></div>;
  if (locale === "es") return <div className="prose prose-slate mx-auto max-w-3xl px-4 py-10 dark:prose-invert"><PrivacyEs /></div>;
  if (locale === "pt-BR") return <div className="prose prose-slate mx-auto max-w-3xl px-4 py-10 dark:prose-invert"><PrivacyPtBR /></div>;
  if (locale === "ko") return <div className="prose prose-slate mx-auto max-w-3xl px-4 py-10 dark:prose-invert"><PrivacyKo /></div>;
  if (locale === "fr") return <div className="prose prose-slate mx-auto max-w-3xl px-4 py-10 dark:prose-invert"><PrivacyFr /></div>;
  if (locale === "de") return <div className="prose prose-slate mx-auto max-w-3xl px-4 py-10 dark:prose-invert"><PrivacyDe /></div>;
  return <div className="prose prose-slate mx-auto max-w-3xl px-4 py-10 dark:prose-invert"><PrivacyEn /></div>;
}

function PrivacyEn() {
  return (
    <>
      <h1>Privacy Policy</h1>
      <p>Last updated: 2026-11-08</p>
      <p>
        This policy explains how {siteConfig.name} (&ldquo;we&rdquo;) collects, uses, and protects information
        when you use {siteConfig.name} ({siteConfig.url}). By using the site you agree to this policy.
      </p>
      <h2>Tool inputs and result-sharing links</h2>
      <p>
        Most calculations run in your browser. If you create or open a result-sharing link, its URL may include selected inputs. Recipients and scripts running on that page may be able to read those values. Older links using query parameters can also send inputs in the initial web request. Do not include sensitive information in shared links.
      </p>
      <h2>Cookies and analytics</h2>
      <p>
        We use Google Analytics 4 to understand traffic and tool usage. Our current configuration defaults analytics storage to denied in the EEA, UK and Switzerland, while it may be granted by default in other regions. Advertising and affiliate tags may also operate on the site. Our analytics events are designed to omit tool input values.
      </p>
      <h2>Advertising</h2>
      <p>
        We display ads through Google AdSense. Google and its partners may use cookies to serve ads based on your prior
        visits to this and other websites. You can opt out of personalized advertising by visiting
        {" "}<a href="https://www.google.com/settings/ads">Google Ads Settings</a> or
        {" "}<a href="https://www.aboutads.info/">aboutads.info</a>. EEA/UK users are presented a Google-certified
        consent prompt; declining limits ads to non-personalized.
      </p>
      <h2>Affiliate links</h2>
      <p>
        Some links on tool pages, labelled <em>&ldquo;Sponsored&rdquo;</em>, are affiliate links. If you click and
        complete a qualifying action (sign-up, purchase) at the partner&apos;s site, we may earn a commission. The
        price you pay is unchanged. We may use cookies set by the partner network for attribution. See our
        {" "}<a href="/en/disclosure">Advertising &amp; Affiliate Disclosure</a> for details.
      </p>
      <h2>Third-party services</h2>
      <ul>
        <li>Google AdSense (ads) — <a href="https://policies.google.com/technologies/ads">policy</a></li>
        <li>Google Analytics 4 (analytics) — <a href="https://policies.google.com/privacy">policy</a></li>
        <li>Affiliate networks (including Awin and impact.com) — see partner policies</li>
        <li>Microsoft Clarity (optional, only after a URL privacy review) — see provider policies</li>
      </ul>
      <h2>Your rights</h2>
      <p>
        Depending on your region (GDPR/CCPA/APPI etc.), you may have the right to access, delete, or restrict the use
        of your personal data. Contact us at <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>{" "}
        and we will respond within 30 days.
      </p>
      <h2>Children</h2>
      <p>The service is not directed to children under 13. We do not knowingly collect data from children.</p>
      <h2>Updates</h2>
      <p>We may update this policy and will revise the &ldquo;last updated&rdquo; date above when we do.</p>
      <h2>Contact</h2>
      <p>
        {siteConfig.name} — <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>
      </p>
    </>
  );
}

function PrivacyJa() {
  return (
    <>
      <h1>プライバシーポリシー</h1>
      <p>最終更新日: 2026-11-08</p>
      <p>
        本ポリシーは {siteConfig.name}（以下「当方」）が提供する {siteConfig.name}（{siteConfig.url}）における個人情報の取扱いを定めるものです。本サービスをご利用いただくことで、本ポリシーに同意したものとみなします。
      </p>
      <h2>ツールへの入力と結果共有リンク</h2>
      <p>
        多くの計算はブラウザ内で処理されます。ただし結果共有リンクを作成・閲覧すると、選択した入力値がURLに含まれる場合があります。リンクの受信者やページ上のスクリプトから読み取られる可能性があり、旧形式のリンクでは初回アクセス時にクエリ情報がサーバーへ送られる場合があります。機密情報を結果リンクに含めないでください。
      </p>
      <h2>Cookieとアクセス解析</h2>
      <p>
        アクセス状況やツールの利用状況を把握するため Google Analytics 4 を利用しています。現行設定ではEEA・英国・スイスの解析ストレージは初期状態で拒否され、それ以外の地域では初期状態で許可される場合があります。広告・アフィリエイトのタグも利用しています。解析イベントにはツールの入力値を含めない設計です。
      </p>
      <h2>広告について</h2>
      <p>
        当サイトは Google AdSense による広告を配信しています。Googleおよびそのパートナーは、お客様の過去の訪問履歴に基づいて広告を表示するためにCookieを利用することがあります。
        <a href="https://www.google.com/settings/ads">広告設定</a>または
        <a href="https://www.aboutads.info/"> aboutads.info </a>
        からパーソナライズ広告のオプトアウトが可能です。EEA/英国の利用者には Google認定の同意画面が表示され、拒否した場合は非パーソナライズ広告のみが配信されます。
      </p>
      <h2>アフィリエイトリンク</h2>
      <p>
        各ツールページに「広告」ラベル付きで掲載されるアフィリエイトリンクをクリックし、提携先サイトで会員登録・購入等の成果条件を満たした場合、当方が紹介料を受け取ることがあります。利用者の支払額は変わりません。計測のために提携ネットワークが Cookie を設置することがあります。詳しくは
        <a href="/ja/disclosure">広告・アフィリエイトに関する開示</a>をご覧ください。
      </p>
      <h2>第三者サービス</h2>
      <ul>
        <li>Google AdSense（広告配信）</li>
        <li>Google Analytics 4（アクセス解析）</li>
        <li>アフィリエイトネットワーク（Awin、impact.com等）</li>
        <li>Microsoft Clarity（URLのプライバシー確認後に有効化される場合があります）</li>
      </ul>
      <h2>権利行使</h2>
      <p>
        個人情報保護法・GDPR・CCPA等に基づく開示・削除・利用停止のご請求は
        <a href={`mailto:${siteConfig.contactEmail}`}> {siteConfig.contactEmail} </a>
        までご連絡ください。原則30日以内に回答いたします。
      </p>
      <h2>未成年</h2>
      <p>13歳未満の方を対象としたサービスではなく、未成年から意図的に情報を収集することはありません。</p>
      <h2>改定</h2>
      <p>本ポリシーは予告なく改定する場合があります。改定時は「最終更新日」を更新します。</p>
      <h2>お問い合わせ</h2>
      <p>
        {siteConfig.name} — <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>
      </p>
    </>
  );
}

function PrivacyZhCN() {
  return (
    <>
      <h1>隐私政策</h1>
      <p>最后更新：2026-11-08</p>
      <p>
        本政策说明 {siteConfig.name}（以下简称"我们"）在您使用 {siteConfig.name}（{siteConfig.url}）时如何收集、使用和保护信息。使用本网站即表示您同意本政策。
      </p>
      <h2>工具输入与结果分享链接</h2>
      <p>
        大部分计算在浏览器中完成。但创建或打开结果分享链接时，网址可能包含您选择的输入值。收件人以及页面上运行的脚本可能读取这些值。旧版查询参数链接还可能在首次访问时将输入值发送至服务器。请勿在分享链接中包含敏感信息。
      </p>
      <h2>Cookie 与数据分析</h2>
      <p>
        我们使用 Google Analytics 4 了解流量和工具使用情况。当前设置在欧洲经济区、英国和瑞士默认拒绝分析存储，在其他地区可能默认允许。网站还可能使用广告和联盟营销标签。分析事件的设计旨在避免包含工具输入值。
      </p>
      <h2>广告</h2>
      <p>
        本网站通过 Google AdSense 展示广告。Google 及其合作伙伴可能根据您对本网站及其他网站的历史访问记录，使用 Cookie 投放广告。您可以访问
        <a href="https://www.google.com/settings/ads">Google 广告设置</a>或
        <a href="https://www.aboutads.info/">aboutads.info</a>
        选择退出个性化广告。欧洲经济区/英国用户将看到 Google 认证的同意提示；拒绝后仅展示非个性化广告。
      </p>
      <h2>联盟链接</h2>
      <p>
        工具页面上标注"广告"的部分链接为联盟链接。若您点击后在合作伙伴网站完成注册或购买等符合条件的操作，我们可能获得佣金，您的支付金额不受影响。合作网络可能为归因目的设置 Cookie。详情请见
        <a href="/zh-CN/disclosure">广告与联盟链接披露</a>。
      </p>
      <h2>第三方服务</h2>
      <ul>
        <li>Google AdSense（广告）— <a href="https://policies.google.com/technologies/ads">政策</a></li>
        <li>Google Analytics 4（数据分析）— <a href="https://policies.google.com/privacy">政策</a></li>
        <li>联盟网络（A8.net、Moshimo、ValueCommerce、Rakuten Affiliate）— 详见各合作方政策</li>
      </ul>
      <h2>您的权利</h2>
      <p>
        根据您所在地区的法律（GDPR/CCPA 等），您可能有权访问、删除或限制您的个人数据的使用。请发送邮件至
        <a href={`mailto:${siteConfig.contactEmail}`}> {siteConfig.contactEmail} </a>，我们将在 30 天内回复。
      </p>
      <h2>儿童</h2>
      <p>本服务不面向 13 岁以下儿童，我们不会故意收集儿童的个人数据。</p>
      <h2>更新</h2>
      <p>我们可能更新本政策，届时将修改上方的"最后更新"日期。</p>
      <h2>联系我们</h2>
      <p>
        {siteConfig.name} — <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>
      </p>
    </>
  );
}

function PrivacyEs() {
  return (
    <>
      <h1>Política de Privacidad</h1>
      <p>Última actualización: 2026-11-08</p>
      <p>
        Esta política explica cómo {siteConfig.name} («nosotros») recopila, usa y protege la información cuando utilizas {siteConfig.name} ({siteConfig.url}). Al usar el sitio, aceptas esta política.
      </p>
      <h2>Entradas de herramientas y enlaces de resultados</h2>
      <p>
        La mayoría de los cálculos se realizan en tu navegador. Al crear o abrir un enlace de resultados, la URL puede incluir valores que hayas introducido. Los destinatarios y los scripts de la página pueden leerlos. Los enlaces antiguos con parámetros de consulta también pueden enviar esos valores al servidor en la primera visita. No compartas información sensible en estos enlaces.
      </p>
      <h2>Cookies y analítica</h2>
      <p>
        Usamos Google Analytics 4 para analizar el tráfico y el uso de las herramientas. La configuración actual deniega por defecto el almacenamiento analítico en el EEE, Reino Unido y Suiza, y puede permitirlo por defecto en otras regiones. También pueden operar etiquetas publicitarias y de afiliación. Los eventos de analítica están diseñados para excluir los datos introducidos en las herramientas.
      </p>
      <h2>Publicidad</h2>
      <p>
        Mostramos anuncios a través de Google AdSense. Google y sus socios pueden usar cookies para mostrar anuncios basados en tus visitas anteriores a este y otros sitios web. Puedes optar por no recibir publicidad personalizada en
        {" "}<a href="https://www.google.com/settings/ads">Configuración de anuncios de Google</a> o en
        {" "}<a href="https://www.aboutads.info/">aboutads.info</a>. A los usuarios del EEE/Reino Unido se les presenta un aviso de consentimiento certificado por Google; si lo rechazan, los anuncios quedan limitados a no personalizados.
      </p>
      <h2>Enlaces de afiliados</h2>
      <p>
        Algunos enlaces en las páginas de herramientas, etiquetados como <em>«Patrocinado»</em>, son enlaces de afiliados. Si haces clic y completas una acción válida (registro, compra) en el sitio del socio, podemos ganar una comisión. El precio que pagas no varía. Consulta nuestra <a href="/es/disclosure">Divulgación de Publicidad y Afiliados</a> para más detalles.
      </p>
      <h2>Servicios de terceros</h2>
      <ul>
        <li>Google AdSense (anuncios) — <a href="https://policies.google.com/technologies/ads">política</a></li>
        <li>Google Analytics 4 (analítica) — <a href="https://policies.google.com/privacy">política</a></li>
        <li>Redes de afiliados (A8.net, Moshimo, ValueCommerce, Rakuten Affiliate) — ver políticas de cada socio</li>
      </ul>
      <h2>Tus derechos</h2>
      <p>
        Según tu región (RGPD/CCPA, etc.), puedes tener derecho a acceder, eliminar o restringir el uso de tus datos personales. Contáctanos en <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a> y responderemos en un plazo de 30 días.
      </p>
      <h2>Menores</h2>
      <p>El servicio no está dirigido a menores de 13 años. No recopilamos datos de menores de forma consciente.</p>
      <h2>Actualizaciones</h2>
      <p>Podemos actualizar esta política y revisaremos la fecha de «última actualización» cuando lo hagamos.</p>
      <h2>Contacto</h2>
      <p>
        {siteConfig.name} — <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>
      </p>
    </>
  );
}

function PrivacyPtBR() {
  return (
    <>
      <h1>Política de Privacidade</h1>
      <p>Última atualização: 2026-11-08</p>
      <p>
        Esta política explica como {siteConfig.name} («nós») coleta, usa e protege informações quando você usa {siteConfig.name} ({siteConfig.url}). Ao usar o site, você concorda com esta política.
      </p>
      <h2>Entradas das ferramentas e links de resultados</h2>
      <p>
        A maioria dos cálculos ocorre no navegador. Ao criar ou abrir um link de resultado, a URL pode incluir valores informados. Destinatários e scripts executados na página podem lê-los. Links antigos com parâmetros de consulta também podem enviar esses dados ao servidor no primeiro acesso. Não inclua informações sensíveis em links compartilhados.
      </p>
      <h2>Cookies e análise</h2>
      <p>
        Usamos o Google Analytics 4 para compreender o tráfego e o uso das ferramentas. A configuração atual nega por padrão o armazenamento analítico no EEE, Reino Unido e Suíça, mas pode permiti-lo por padrão em outras regiões. Tags de publicidade e afiliados também podem operar no site. Os eventos de análise são projetados para não incluir os valores inseridos nas ferramentas.
      </p>
      <h2>Publicidade</h2>
      <p>
        Exibimos anúncios por meio do Google AdSense. O Google e seus parceiros podem usar cookies para exibir anúncios com base em suas visitas anteriores a este e outros sites. Você pode optar por não receber publicidade personalizada visitando
        {" "}<a href="https://www.google.com/settings/ads">Configurações de anúncios do Google</a> ou
        {" "}<a href="https://www.aboutads.info/">aboutads.info</a>. Usuários do EEE/Reino Unido recebem um aviso de consentimento certificado pelo Google; recusá-lo limita os anúncios a não personalizados.
      </p>
      <h2>Links de afiliados</h2>
      <p>
        Alguns links nas páginas de ferramentas, rotulados como <em>«Patrocinado»</em>, são links de afiliados. Se você clicar e concluir uma ação qualificada (cadastro, compra) no site do parceiro, podemos ganhar uma comissão. O preço que você paga não se altera. Consulte nossa <a href="/pt-BR/disclosure">Divulgação de Publicidade e Afiliados</a> para detalhes.
      </p>
      <h2>Serviços de terceiros</h2>
      <ul>
        <li>Google AdSense (anúncios) — <a href="https://policies.google.com/technologies/ads">política</a></li>
        <li>Google Analytics 4 (análise) — <a href="https://policies.google.com/privacy">política</a></li>
        <li>Redes de afiliados (A8.net, Moshimo, ValueCommerce, Rakuten Affiliate) — ver políticas de cada parceiro</li>
      </ul>
      <h2>Seus direitos</h2>
      <p>
        Dependendo da sua região (LGPD/GDPR/CCPA, etc.), você pode ter o direito de acessar, excluir ou restringir o uso dos seus dados pessoais. Entre em contato conosco em <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a> e responderemos em até 30 dias.
      </p>
      <h2>Crianças</h2>
      <p>O serviço não é direcionado a crianças menores de 13 anos. Não coletamos dados de crianças intencionalmente.</p>
      <h2>Atualizações</h2>
      <p>Podemos atualizar esta política e revisaremos a data de «última atualização» quando o fizermos.</p>
      <h2>Contato</h2>
      <p>
        {siteConfig.name} — <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>
      </p>
    </>
  );
}

function PrivacyKo() {
  return (
    <>
      <h1>개인정보 처리방침</h1>
      <p>최종 업데이트: 2026-11-08</p>
      <p>
        본 방침은 {siteConfig.name}（이하 "당사"）이 귀하가 {siteConfig.name}（{siteConfig.url}）을 이용할 때 정보를 수집·사용·보호하는 방법을 설명합니다. 사이트 이용은 본 방침에 동의함을 의미합니다.
      </p>
      <h2>도구 입력값과 결과 공유 링크</h2>
      <p>
        대부분의 계산은 브라우저에서 처리됩니다. 결과 공유 링크를 만들거나 열면 선택한 입력값이 URL에 포함될 수 있습니다. 링크 수신자와 페이지에서 실행되는 스크립트가 해당 값을 읽을 수 있습니다. 기존 쿼리 방식 링크는 최초 접속 시 입력값이 서버에 전달될 수도 있습니다. 민감한 정보는 공유 링크에 포함하지 마세요.
      </p>
      <h2>쿠키 및 분석</h2>
      <p>
        Google Analytics 4를 사용하여 방문 및 도구 이용 현황을 파악합니다. 현재 설정은 EEA, 영국 및 스위스에서 분석 저장을 기본적으로 거부하지만 다른 지역에서는 기본 허용될 수 있습니다. 광고 및 제휴 태그도 사용될 수 있습니다. 분석 이벤트에는 도구 입력값이 포함되지 않도록 설계되어 있습니다.
      </p>
      <h2>광고</h2>
      <p>
        당사는 Google AdSense를 통해 광고를 게재합니다. Google 및 파트너사는 본 사이트 및 기타 웹사이트 방문 이력을 기반으로 광고를 게재하기 위해 쿠키를 사용할 수 있습니다.
        <a href="https://www.google.com/settings/ads">Google 광고 설정</a> 또는
        <a href="https://www.aboutads.info/">aboutads.info</a>에서 맞춤 광고를 거부할 수 있습니다. EEA/영국 이용자에게는 Google 인증 동의 안내가 표시되며, 거부 시 비맞춤 광고만 게재됩니다.
      </p>
      <h2>제휴 링크</h2>
      <p>
        도구 페이지에 「광고」로 표시된 일부 링크는 제휴 링크입니다. 링크를 클릭하고 파트너 사이트에서 유효한 행동（가입, 구매）을 완료하면 당사가 수수료를 받을 수 있습니다. 이용자의 결제 금액은 변경되지 않습니다. 자세한 내용은 <a href="/ko/disclosure">광고 및 제휴 공개</a>를 참조하세요.
      </p>
      <h2>제3자 서비스</h2>
      <ul>
        <li>Google AdSense（광고）— <a href="https://policies.google.com/technologies/ads">정책</a></li>
        <li>Google Analytics 4（분석）— <a href="https://policies.google.com/privacy">정책</a></li>
        <li>제휴 네트워크（A8.net, Moshimo, ValueCommerce, Rakuten Affiliate）— 각 파트너 정책 참조</li>
      </ul>
      <h2>귀하의 권리</h2>
      <p>
        귀하의 지역에 따라（GDPR/CCPA/개인정보 보호법 등）개인 데이터 접근, 삭제 또는 처리 제한을 요청할 권리가 있을 수 있습니다. <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>로 문의하시면 30일 이내에 회신해 드립니다.
      </p>
      <h2>어린이</h2>
      <p>본 서비스는 만 13세 미만 어린이를 대상으로 하지 않으며, 어린이로부터 의도적으로 데이터를 수집하지 않습니다.</p>
      <h2>업데이트</h2>
      <p>본 방침은 변경될 수 있으며, 변경 시 위의 「최종 업데이트」 날짜를 수정합니다.</p>
      <h2>문의</h2>
      <p>
        {siteConfig.name} — <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>
      </p>
    </>
  );
}

function PrivacyFr() {
  return (
    <>
      <h1>Politique de confidentialité</h1>
      <p>Dernière mise à jour : 2026-11-08</p>
      <p>
        Cette politique explique comment {siteConfig.name} («nous») collecte, utilise et protège les informations lorsque vous utilisez {siteConfig.name} ({siteConfig.url}). En utilisant le site, vous acceptez cette politique.
      </p>
      <h2>Saisies des outils et liens de résultat</h2>
      <p>
        La plupart des calculs s'effectuent dans votre navigateur. Un lien de résultat créé ou ouvert peut contenir des valeurs saisies dans son URL. Les destinataires et les scripts exécutés sur la page peuvent les lire. Les anciens liens utilisant des paramètres de requête peuvent aussi transmettre ces valeurs au serveur lors du premier accès. N'incluez aucune information sensible dans un lien partagé.
      </p>
      <h2>Cookies et analyse</h2>
      <p>
        Nous utilisons Google Analytics 4 pour comprendre le trafic et l'utilisation des outils. La configuration actuelle refuse par défaut le stockage analytique dans l'EEE, au Royaume-Uni et en Suisse, mais peut l'autoriser par défaut ailleurs. Des balises publicitaires et d'affiliation peuvent aussi fonctionner sur le site. Les événements d'analyse sont conçus pour exclure les valeurs saisies dans les outils.
      </p>
      <h2>Publicité</h2>
      <p>
        Nous affichons des publicités via Google AdSense. Google et ses partenaires peuvent utiliser des cookies pour diffuser des annonces basées sur vos visites précédentes de ce site et d&apos;autres sites. Vous pouvez refuser la publicité personnalisée en visitant
        {" "}<a href="https://www.google.com/settings/ads">Paramètres des annonces Google</a> ou
        {" "}<a href="https://www.aboutads.info/">aboutads.info</a>. Les utilisateurs de l&apos;EEE/Royaume-Uni voient une invite de consentement certifiée Google ; la refuser limite les annonces aux non personnalisées.
      </p>
      <h2>Liens d&apos;affiliation</h2>
      <p>
        Certains liens sur les pages d&apos;outils, étiquetés <em>«Sponsorisé»</em>, sont des liens d&apos;affiliation. Si vous cliquez et effectuez une action éligible (inscription, achat) sur le site partenaire, nous pouvons percevoir une commission. Le prix que vous payez reste inchangé. Consultez notre <a href="/fr/disclosure">Divulgation publicitaire et d&apos;affiliation</a> pour plus de détails.
      </p>
      <h2>Services tiers</h2>
      <ul>
        <li>Google AdSense (publicités) — <a href="https://policies.google.com/technologies/ads">politique</a></li>
        <li>Google Analytics 4 (analyse) — <a href="https://policies.google.com/privacy">politique</a></li>
        <li>Réseaux d&apos;affiliation (A8.net, Moshimo, ValueCommerce, Rakuten Affiliate) — voir les politiques des partenaires</li>
      </ul>
      <h2>Vos droits</h2>
      <p>
        Selon votre région (RGPD/CCPA, etc.), vous pouvez avoir le droit d&apos;accéder à vos données personnelles, de les supprimer ou d&apos;en restreindre l&apos;utilisation. Contactez-nous à <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a> et nous répondrons dans les 30 jours.
      </p>
      <h2>Mineurs</h2>
      <p>Le service n&apos;est pas destiné aux enfants de moins de 13 ans. Nous ne collectons pas sciemment de données d&apos;enfants.</p>
      <h2>Mises à jour</h2>
      <p>Nous pouvons mettre à jour cette politique et réviserons la date de «dernière mise à jour» ci-dessus.</p>
      <h2>Contact</h2>
      <p>
        {siteConfig.name} — <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>
      </p>
    </>
  );
}

function PrivacyDe() {
  return (
    <>
      <h1>Datenschutzerklärung</h1>
      <p>Zuletzt aktualisiert: 2026-11-08</p>
      <p>
        Diese Erklärung beschreibt, wie {siteConfig.name} («wir») Informationen erhebt, verwendet und schützt, wenn Sie {siteConfig.name} ({siteConfig.url}) nutzen. Durch die Nutzung der Website stimmen Sie dieser Erklärung zu.
      </p>
      <h2>Werkzeugeingaben und Ergebnislinks</h2>
      <p>
        Die meisten Berechnungen erfolgen im Browser. Wenn Sie einen Ergebnislink erstellen oder öffnen, kann dessen URL ausgewählte Eingabewerte enthalten. Empfänger und auf der Seite laufende Skripte können diese lesen. Ältere Links mit Abfrageparametern können die Werte schon beim ersten Aufruf an den Server senden. Teilen Sie keine vertraulichen Daten über Ergebnislinks.
      </p>
      <h2>Cookies und Analyse</h2>
      <p>
        Wir verwenden Google Analytics 4 zur Analyse von Zugriffen und Werkzeugnutzung. Die aktuelle Konfiguration verweigert Analysespeicherung im EWR, im Vereinigten Königreich und in der Schweiz standardmäßig; in anderen Regionen kann sie standardmäßig erlaubt sein. Werbe- und Affiliate-Tags können ebenfalls verwendet werden. Analyseereignisse sollen keine Werkzeugeingaben enthalten.
      </p>
      <h2>Werbung</h2>
      <p>
        Wir schalten Anzeigen über Google AdSense. Google und seine Partner können Cookies verwenden, um Anzeigen basierend auf Ihren früheren Besuchen dieser und anderer Websites zu schalten. Sie können personalisierte Werbung unter
        {" "}<a href="https://www.google.com/settings/ads">Google Anzeigeneinstellungen</a> oder
        {" "}<a href="https://www.aboutads.info/">aboutads.info</a> ablehnen. EWR/UK-Nutzer erhalten eine Google-zertifizierte Einwilligungsaufforderung; eine Ablehnung beschränkt Anzeigen auf nicht personalisierte.
      </p>
      <h2>Affiliate-Links</h2>
      <p>
        Einige Links auf Werkzeugseiten, die als <em>„Gesponsert"</em> gekennzeichnet sind, sind Affiliate-Links. Wenn Sie klicken und eine qualifizierende Aktion (Anmeldung, Kauf) auf der Partnerseite abschließen, erhalten wir möglicherweise eine Provision. Der von Ihnen gezahlte Preis ändert sich nicht. Weitere Details finden Sie in unserer <a href="/de/disclosure">Werbe- und Affiliate-Offenlegung</a>.
      </p>
      <h2>Drittanbieter-Dienste</h2>
      <ul>
        <li>Google AdSense (Werbung) — <a href="https://policies.google.com/technologies/ads">Richtlinie</a></li>
        <li>Google Analytics 4 (Analyse) — <a href="https://policies.google.com/privacy">Richtlinie</a></li>
        <li>Affiliate-Netzwerke (A8.net, Moshimo, ValueCommerce, Rakuten Affiliate) — siehe Partnerrichtlinien</li>
      </ul>
      <h2>Ihre Rechte</h2>
      <p>
        Je nach Ihrer Region (DSGVO/CCPA usw.) haben Sie möglicherweise das Recht, auf Ihre personenbezogenen Daten zuzugreifen, sie zu löschen oder deren Nutzung einzuschränken. Kontaktieren Sie uns unter <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a> und wir antworten innerhalb von 30 Tagen.
      </p>
      <h2>Kinder</h2>
      <p>Der Dienst richtet sich nicht an Kinder unter 13 Jahren. Wir erheben wissentlich keine Daten von Kindern.</p>
      <h2>Aktualisierungen</h2>
      <p>Wir können diese Erklärung aktualisieren und werden das Datum der «letzten Aktualisierung» oben entsprechend anpassen.</p>
      <h2>Kontakt</h2>
      <p>
        {siteConfig.name} — <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>
      </p>
    </>
  );
}
