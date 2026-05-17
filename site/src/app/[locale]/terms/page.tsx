import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { buildMetadata } from "@/lib/seo/metadata";
import { siteConfig } from "@/lib/config";
import type { Locale } from "@/lib/i18n/locales";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return buildMetadata({ locale: locale as Locale, title: t("nav.terms"), description: t("site.description"), path: "/terms" });
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  if (locale === "ja") return <div className="prose prose-slate mx-auto max-w-3xl px-4 py-10 dark:prose-invert"><TermsJa /></div>;
  if (locale === "zh-CN") return <div className="prose prose-slate mx-auto max-w-3xl px-4 py-10 dark:prose-invert"><TermsZhCN /></div>;
  if (locale === "es") return <div className="prose prose-slate mx-auto max-w-3xl px-4 py-10 dark:prose-invert"><TermsEs /></div>;
  if (locale === "pt-BR") return <div className="prose prose-slate mx-auto max-w-3xl px-4 py-10 dark:prose-invert"><TermsPtBR /></div>;
  if (locale === "ko") return <div className="prose prose-slate mx-auto max-w-3xl px-4 py-10 dark:prose-invert"><TermsKo /></div>;
  if (locale === "fr") return <div className="prose prose-slate mx-auto max-w-3xl px-4 py-10 dark:prose-invert"><TermsFr /></div>;
  if (locale === "de") return <div className="prose prose-slate mx-auto max-w-3xl px-4 py-10 dark:prose-invert"><TermsDe /></div>;
  return <div className="prose prose-slate mx-auto max-w-3xl px-4 py-10 dark:prose-invert"><TermsEn /></div>;
}

function TermsJa() {
  return (
    <>
      <h1>利用規約</h1>
      <p>最終更新日: 2026-05-06</p>
      <h2>サービス内容</h2>
      <p>
        {siteConfig.name}（以下「本サービス」）は、計算・変換・参照などの汎用ツールをブラウザ上で無料提供するものです。本サービスの利用には本規約への同意が必要です。
      </p>
      <h2>免責事項</h2>
      <p>
        本サービスの計算結果はあくまで参考情報であり、医療・法律・税務・金融等の専門助言の代替ではありません。最終的な判断は専門家に確認のうえ、ご自身の責任で行ってください。当方は計算結果の正確性・最新性を可能な限り確保するよう努めますが、利用に伴う一切の損害について責任を負いません。
      </p>
      <h2>禁止事項</h2>
      <ul>
        <li>本サービスの不正アクセス・スクレイピングによる過大な負荷の発生</li>
        <li>広告のクリック率を不正に水増しする行為</li>
        <li>関連法令や公序良俗に反する目的での利用</li>
      </ul>
      <h2>広告・アフィリエイト</h2>
      <p>
        本サービスは Google AdSense による広告配信および、各ツールページに「広告」ラベル付きで掲載するアフィリエイトリンクにより運営されています。アフィリエイトリンクをクリックして提携先で成果が成立した場合、当方が紹介料を受け取ることがあります。利用者の支払額は変わりません。詳細は
        <a href="/disclosure">広告・アフィリエイトに関する開示</a>をご参照ください。
      </p>
      <h2>知的財産</h2>
      <p>
        サイトのデザイン・テキスト・コードは {siteConfig.organization} に帰属します。各ツールの計算式・公式は一般に公開されている事実情報であり、引用元は各ツール内に記載しています。
      </p>
      <h2>準拠法</h2>
      <p>本規約は日本法を準拠法とし、関連する紛争は東京地方裁判所を専属管轄とします。</p>
      <h2>お問い合わせ</h2>
      <p>
        {siteConfig.organization} — <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>
      </p>
    </>
  );
}

function TermsZhCN() {
  return (
    <>
      <h1>服务条款</h1>
      <p>最后更新：2026-05-06</p>
      <h2>服务说明</h2>
      <p>
        {siteConfig.name}（以下简称"本服务"）免费提供基于浏览器的计算器、单位换算及参考查询等实用工具。使用本服务即表示您同意本条款。
      </p>
      <h2>免责声明</h2>
      <p>
        本服务的计算结果仅供参考，不构成医疗、法律、税务或金融等领域的专业建议。我们尽力确保公式的准确性，但对依据计算结果所做决策引发的任何损失不承担责任，最终决策请咨询专业人士。
      </p>
      <h2>可接受使用</h2>
      <ul>
        <li>禁止通过爬虫或自动化流量对服务施加过度负载。</li>
        <li>禁止人为刷高广告点击量或展示次数。</li>
        <li>禁止将本服务用于违法目的。</li>
      </ul>
      <h2>广告与联盟链接</h2>
      <p>
        本服务通过 Google AdSense 广告及工具页面上标注"广告"的联盟链接维持运营。若您点击联盟链接并在合作方完成注册或购买，我们可能获得佣金，您的支付金额不受影响。详情请见
        <a href="/disclosure">广告与联盟链接披露</a>。
      </p>
      <h2>知识产权</h2>
      <p>
        网站设计、文字及代码归 {siteConfig.organization} 所有。工具中引用的数学公式为公开已知事实，引用来源已在各工具页面内标注。
      </p>
      <h2>适用法律</h2>
      <p>本条款受日本法律管辖，相关争议提交东京地方法院解决。</p>
      <h2>联系我们</h2>
      <p>
        {siteConfig.organization} — <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>
      </p>
    </>
  );
}

function TermsEs() {
  return (
    <>
      <h1>Términos de Servicio</h1>
      <p>Última actualización: 2026-05-06</p>
      <h2>El Servicio</h2>
      <p>
        {siteConfig.name} (el «Servicio») ofrece gratuitamente herramientas de utilidad basadas en el navegador: calculadoras, conversores y referencias. El uso del Servicio implica la aceptación de estos términos.
      </p>
      <h2>Sin asesoramiento profesional</h2>
      <p>
        Los resultados del Servicio son informativos y no sustituyen el asesoramiento médico, legal, fiscal o financiero profesional. Hacemos esfuerzos razonables para mantener las fórmulas precisas, pero no aceptamos responsabilidad por decisiones tomadas en base a los resultados.
      </p>
      <h2>Uso aceptable</h2>
      <ul>
        <li>No abuses del Servicio mediante scraping o tráfico automatizado que genere una carga excesiva.</li>
        <li>No infles artificialmente los clics o las impresiones de anuncios.</li>
        <li>No utilices el Servicio para fines ilegales.</li>
      </ul>
      <h2>Publicidad y enlaces de afiliados</h2>
      <p>
        El Servicio se mantiene mediante publicidad de Google AdSense y enlaces de afiliados etiquetados como <em>«Patrocinado»</em> en las páginas de herramientas. Si haces clic en un enlace de afiliado y realizas una acción válida (registro, compra) en el sitio del socio, podemos recibir una comisión. El precio que pagas no varía. Consulta nuestra <a href="/disclosure">Divulgación de Publicidad y Afiliados</a> para más detalles.
      </p>
      <h2>Propiedad intelectual</h2>
      <p>
        El diseño, el texto y el código del sitio pertenecen a {siteConfig.organization}. Las fórmulas matemáticas citadas en las herramientas son hechos de dominio público y las fuentes se indican dentro de cada herramienta.
      </p>
      <h2>Ley aplicable</h2>
      <p>Estos términos se rigen por la legislación japonesa; las disputas están sujetas al Tribunal de Distrito de Tokio.</p>
      <h2>Contacto</h2>
      <p>
        {siteConfig.organization} — <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>
      </p>
    </>
  );
}

function TermsPtBR() {
  return (
    <>
      <h1>Termos de Serviço</h1>
      <p>Última atualização: 2026-05-06</p>
      <h2>O Serviço</h2>
      <p>
        {siteConfig.name} (o «Serviço») oferece gratuitamente ferramentas de utilidade baseadas no navegador: calculadoras, conversores e referências. O uso do Serviço constitui aceitação destes termos.
      </p>
      <h2>Sem aconselhamento profissional</h2>
      <p>
        Os resultados do Serviço são informativos e não substituem aconselhamento médico, jurídico, tributário ou financeiro profissional. Envidamos esforços razoáveis para manter as fórmulas precisas, mas não aceitamos responsabilidade por decisões tomadas com base nos resultados.
      </p>
      <h2>Uso aceitável</h2>
      <ul>
        <li>Não abuse do Serviço via scraping ou tráfego automatizado que imponha carga excessiva.</li>
        <li>Não infle artificialmente cliques ou impressões de anúncios.</li>
        <li>Não utilize o Serviço para fins ilegais.</li>
      </ul>
      <h2>Publicidade e links de afiliados</h2>
      <p>
        O Serviço é mantido por publicidade do Google AdSense e por links de afiliados identificados como <em>«Patrocinado»</em> nas páginas de ferramentas. Se você clicar em um link de afiliado e concluir uma ação qualificada (cadastro, compra) no site do parceiro, poderemos receber uma comissão. O preço que você paga não se altera. Veja nossa <a href="/disclosure">Divulgação de Publicidade e Afiliados</a> para detalhes.
      </p>
      <h2>Propriedade intelectual</h2>
      <p>
        O design, o texto e o código do site pertencem a {siteConfig.organization}. As fórmulas matemáticas referenciadas nas ferramentas são fatos de conhecimento público e as fontes são citadas em cada ferramenta.
      </p>
      <h2>Lei aplicável</h2>
      <p>Estes termos são regidos pelas leis do Japão; as disputas estão sujeitas ao Tribunal Distrital de Tóquio.</p>
      <h2>Contato</h2>
      <p>
        {siteConfig.organization} — <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>
      </p>
    </>
  );
}

function TermsKo() {
  return (
    <>
      <h1>이용약관</h1>
      <p>최종 업데이트: 2026-05-06</p>
      <h2>서비스</h2>
      <p>
        {siteConfig.name}（이하 "서비스"）은 계산기, 단위 변환기, 참조 도구 등 브라우저 기반 유틸리티 도구를 무료로 제공합니다. 서비스를 이용하면 본 약관에 동의한 것으로 간주됩니다.
      </p>
      <h2>전문적 조언 부재</h2>
      <p>
        서비스의 결과물은 정보 제공 목적으로만 제공되며, 의료·법률·세무·금융 분야의 전문적 조언을 대체하지 않습니다. 당사는 수식의 정확성 유지를 위해 합리적인 노력을 기울이나, 결과에 기반한 결정으로 인한 손해에 대해 책임을 지지 않습니다.
      </p>
      <h2>허용 가능한 이용</h2>
      <ul>
        <li>스크래핑 또는 자동화 트래픽으로 서비스에 과도한 부하를 주지 마십시오.</li>
        <li>광고 클릭수 또는 노출수를 인위적으로 부풀리지 마십시오.</li>
        <li>불법적인 목적으로 서비스를 이용하지 마십시오.</li>
      </ul>
      <h2>광고 및 제휴 링크</h2>
      <p>
        서비스는 Google AdSense 광고와 도구 페이지에 「광고」라고 표시된 제휴 링크를 통해 운영됩니다. 제휴 링크를 클릭하고 파트너 사이트에서 자격 있는 행동（가입, 구매）을 완료하면 당사가 수수료를 받을 수 있습니다. 이용자의 결제 금액에는 변동이 없습니다. 자세한 내용은 <a href="/disclosure">광고 및 제휴 공개</a>를 참조하세요.
      </p>
      <h2>지적재산권</h2>
      <p>
        사이트 디자인, 텍스트, 코드는 {siteConfig.organization}에 귀속됩니다. 도구에서 인용된 수학 공식은 공개된 사실이며, 출처는 각 도구 내에 명시되어 있습니다.
      </p>
      <h2>준거법</h2>
      <p>본 약관은 일본법에 따르며, 분쟁은 도쿄 지방법원의 전속 관할에 따릅니다.</p>
      <h2>문의</h2>
      <p>
        {siteConfig.organization} — <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>
      </p>
    </>
  );
}

function TermsFr() {
  return (
    <>
      <h1>Conditions d&apos;utilisation</h1>
      <p>Dernière mise à jour : 2026-05-06</p>
      <h2>Le Service</h2>
      <p>
        {siteConfig.name} (le « Service ») propose gratuitement des outils utilitaires basés sur le navigateur : calculatrices, convertisseurs et références. L&apos;utilisation du Service vaut acceptation des présentes conditions.
      </p>
      <h2>Absence de conseil professionnel</h2>
      <p>
        Les résultats du Service sont fournis à titre informatif et ne remplacent pas un avis médical, juridique, fiscal ou financier professionnel. Nous faisons des efforts raisonnables pour maintenir l&apos;exactitude des formules, mais nous déclinons toute responsabilité pour les décisions prises sur la base des résultats.
      </p>
      <h2>Utilisation acceptable</h2>
      <ul>
        <li>Ne pas abuser du Service par scraping ou trafic automatisé imposant une charge excessive.</li>
        <li>Ne pas gonfler artificiellement les clics ou les impressions publicitaires.</li>
        <li>Ne pas utiliser le Service à des fins illégales.</li>
      </ul>
      <h2>Publicité et liens d&apos;affiliation</h2>
      <p>
        Le Service est soutenu par la publicité Google AdSense et par des liens d&apos;affiliation étiquetés <em>« Sponsorisé »</em> sur les pages d&apos;outils. Si vous cliquez sur un lien d&apos;affiliation et réalisez une action qualifiante (inscription, achat) sur le site partenaire, nous pouvons percevoir une commission. Le prix que vous payez reste inchangé. Consultez notre <a href="/disclosure">Divulgation publicitaire et d&apos;affiliation</a> pour plus de détails.
      </p>
      <h2>Propriété intellectuelle</h2>
      <p>
        Le design, le texte et le code du site appartiennent à {siteConfig.organization}. Les formules mathématiques citées dans les outils sont des faits de notoriété publique et les sources sont indiquées dans chaque outil.
      </p>
      <h2>Droit applicable</h2>
      <p>Les présentes conditions sont régies par le droit japonais ; les litiges relèvent de la compétence du tribunal de district de Tokyo.</p>
      <h2>Contact</h2>
      <p>
        {siteConfig.organization} — <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>
      </p>
    </>
  );
}

function TermsDe() {
  return (
    <>
      <h1>Nutzungsbedingungen</h1>
      <p>Zuletzt aktualisiert: 2026-05-06</p>
      <h2>Der Dienst</h2>
      <p>
        {siteConfig.name} (der „Dienst") stellt kostenlos browserbasierte Hilfsprogramme bereit: Rechner, Konverter und Nachschlagewerke. Durch die Nutzung des Dienstes akzeptieren Sie diese Bedingungen.
      </p>
      <h2>Kein Fachrat</h2>
      <p>
        Die Ergebnisse des Dienstes sind informativ und ersetzen keinen medizinischen, rechtlichen, steuerlichen oder finanziellen Fachrat. Wir bemühen uns, die Formeln korrekt zu halten, übernehmen jedoch keine Haftung für Entscheidungen, die auf Grundlage der Ergebnisse getroffen werden.
      </p>
      <h2>Zulässige Nutzung</h2>
      <ul>
        <li>Missbrauchen Sie den Dienst nicht durch Scraping oder automatisierten Datenverkehr, der zu übermäßiger Last führt.</li>
        <li>Manipulieren Sie Anzeigenklicks oder -impressionen nicht künstlich.</li>
        <li>Nutzen Sie den Dienst nicht für rechtswidrige Zwecke.</li>
      </ul>
      <h2>Werbung und Partnerlinks</h2>
      <p>
        Der Dienst wird durch Google AdSense-Werbung und durch auf den Werkzeugseiten als <em>„Gesponsert"</em> gekennzeichnete Partnerlinks finanziert. Wenn Sie auf einen Partnerlink klicken und beim Partner eine qualifizierende Aktion (Anmeldung, Kauf) abschließen, erhalten wir möglicherweise eine Provision. Der von Ihnen bezahlte Preis ändert sich nicht. Details finden Sie in unserer <a href="/disclosure">Werbe- und Affiliate-Offenlegung</a>.
      </p>
      <h2>Geistiges Eigentum</h2>
      <p>
        Design, Text und Code der Website gehören {siteConfig.organization}. Die in den Werkzeugen referenzierten mathematischen Formeln sind allgemein bekannte Fakten; die Quellen sind in jedem Werkzeug angegeben.
      </p>
      <h2>Anwendbares Recht</h2>
      <p>Diese Bedingungen unterliegen japanischem Recht; Streitigkeiten unterliegen der Zuständigkeit des Bezirksgerichts Tokio.</p>
      <h2>Kontakt</h2>
      <p>
        {siteConfig.organization} — <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>
      </p>
    </>
  );
}

function TermsEn() {
  return (
    <>
      <h1>Terms of Service</h1>
      <p>Last updated: 2026-05-06</p>
      <h2>Service</h2>
      <p>
        {siteConfig.name} (the &ldquo;Service&rdquo;) provides browser-based utility tools (calculators, converters,
        references) free of charge. Using the Service constitutes acceptance of these terms.
      </p>
      <h2>No professional advice</h2>
      <p>
        Results from the Service are informational and are not a substitute for professional medical, legal, tax,
        or financial advice. We make reasonable efforts to keep formulas accurate but accept no liability for
        decisions made based on the output.
      </p>
      <h2>Acceptable use</h2>
      <ul>
        <li>Do not abuse the Service via scraping or automated traffic that imposes undue load.</li>
        <li>Do not artificially inflate ad clicks or impressions.</li>
        <li>Do not use the Service for unlawful purposes.</li>
      </ul>
      <h2>Advertising and affiliate links</h2>
      <p>
        The Service is supported by Google AdSense advertising and by affiliate links labelled
        <em>&ldquo;Sponsored&rdquo;</em> on tool pages. If you click an affiliate link and complete a qualifying
        action (sign-up, purchase) at the partner site, we may receive a commission. The price you pay is unchanged.
        See our <a href="/disclosure">Advertising &amp; Affiliate Disclosure</a> for details.
      </p>
      <h2>Intellectual property</h2>
      <p>
        Site design, text, and code belong to {siteConfig.organization}. Mathematical formulas referenced in tools
        are publicly known facts and sources are cited within each tool.
      </p>
      <h2>Governing law</h2>
      <p>These terms are governed by the laws of Japan; disputes are subject to the Tokyo District Court.</p>
      <h2>Contact</h2>
      <p>
        {siteConfig.organization} — <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>
      </p>
    </>
  );
}
