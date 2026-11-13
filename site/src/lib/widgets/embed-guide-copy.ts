import type { Locale } from "@/lib/i18n/locales";

/** Native-language instructions for legitimate third-party widget publishers. */
export type EmbedGuideCopy = {
  metaTitle: string;
  metaDescription: string;
  heading: string;
  intro: string;
  installHeading: string;
  steps: readonly [string, string, string];
  iframeFallback: string;
  featuredHeading: string;
  referenceNote: string;
  copyCode: string;
  fullTool: string;
  previewWidget: string;
  notesHeading: string;
  notesBody: string;
};

export const EMBED_GUIDE_COPY = {
  "en": {
    "metaTitle": "Embed Free Online Tools on Your Website",
    "metaDescription": "Add free Toolify365 calculators to your blog or education site using accessible, copy-ready iframe code.",
    "heading": "Embed free calculators on your website",
    "intro": "Offer visitors calculators for dates, working days, percentages and time zones. Copy the iframe code; no account is required.",
    "installHeading": "How to install",
    "steps": [
      "Choose a tool below and copy its HTML snippet.",
      "Paste the code into an HTML block on your website.",
      "Check the widget on desktop and mobile."
    ],
    "iframeFallback": "If your platform blocks iframes, link to the full tool instead.",
    "featuredHeading": "Four embed-ready tools",
    "referenceNote": "Each snippet includes a visible link to the original tool.",
    "copyCode": "Copy this HTML",
    "fullTool": "Open full tool",
    "previewWidget": "Preview widget",
    "notesHeading": "Publisher notes",
    "notesBody": "The widget needs an internet connection. Explain each tool's limits, review its handling of sensitive inputs, and keep the visible link so visitors can open the full tool."
  },
  "ja": {
    "metaTitle": "無料計算ツールをサイトに埋め込む方法",
    "metaDescription": "ブログや教育サイトにToolify365の無料計算ツールを設置するためのHTMLコードと手順です。",
    "heading": "無料ツールをあなたのサイトに埋め込む",
    "intro": "日付、営業日、割合、時差などの計算ツールをブログや学習サイトに設置できます。アカウント登録は不要です。",
    "installHeading": "設置手順",
    "steps": [
      "下からツールを選び、HTMLコードをコピーします。",
      "サイトのHTML編集欄やカスタムHTMLブロックに貼り付けます。",
      "PCとスマートフォンで表示と操作を確認します。"
    ],
    "iframeFallback": "iframeが使えない場合はツール本体へのリンクを設置してください。",
    "featuredHeading": "すぐ使える4つのツール",
    "referenceNote": "コードにはツール本体への見える参照リンクも含まれます。",
    "copyCode": "コピーするHTML",
    "fullTool": "ツール本体を見る",
    "previewWidget": "埋め込み表示を試す",
    "notesHeading": "掲載時の注意",
    "notesBody": "ツールの利用には通信が必要です。用途と制限を説明し、機密データの扱いを確認してください。参照リンクは全画面での利用にも役立ちます。"
  },
  "zh-CN": {
    "metaTitle": "在网站中嵌入免费在线工具",
    "metaDescription": "将免费的 Toolify365 计算器嵌入博客或教学网站，提供可复制的 HTML 代码。",
    "heading": "在你的网站中嵌入免费计算器",
    "intro": "让访客直接使用日期、工作日、百分比和时区计算器。无需注册账号。",
    "installHeading": "安装步骤",
    "steps": [
      "选择下方工具并复制 HTML 代码。",
      "将代码粘贴到网站的自定义 HTML 区块中。",
      "在电脑和手机上检查显示和操作。"
    ],
    "iframeFallback": "如果平台不支持 iframe，请直接链接到完整工具。",
    "featuredHeading": "四款可嵌入工具",
    "referenceNote": "每段代码都附有指向原始工具的可见链接。",
    "copyCode": "复制这段 HTML",
    "fullTool": "打开完整工具",
    "previewWidget": "预览小工具",
    "notesHeading": "发布者须知",
    "notesBody": "小工具需要网络连接。请说明用途和限制，注意敏感输入，并保留可见链接，方便访客打开完整工具。"
  },
  "zh-TW": {
    "metaTitle": "在網站中嵌入免費線上工具",
    "metaDescription": "將免費的 Toolify365 計算器嵌入部落格或教學網站，提供可複製的 HTML 程式碼。",
    "heading": "在你的網站嵌入免費計算器",
    "intro": "讓訪客直接使用日期、工作日、百分比和時區計算器，無須註冊帳號。",
    "installHeading": "安裝步驟",
    "steps": [
      "選擇下方工具並複製 HTML 程式碼。",
      "將程式碼貼到網站的自訂 HTML 區塊。",
      "在電腦與手機上檢查顯示及操作。"
    ],
    "iframeFallback": "若平台不支援 iframe，請直接連結至完整工具。",
    "featuredHeading": "四款可嵌入工具",
    "referenceNote": "每段程式碼都附有通往原始工具的可見連結。",
    "copyCode": "複製這段 HTML",
    "fullTool": "開啟完整工具",
    "previewWidget": "預覽小工具",
    "notesHeading": "發布者須知",
    "notesBody": "小工具需要網路連線。請說明用途與限制，留意敏感輸入，並保留可見連結供訪客開啟完整工具。"
  },
  "ko": {
    "metaTitle": "웹사이트에 무료 온라인 도구 삽입하기",
    "metaDescription": "블로그나 교육 사이트에 Toolify365 계산기를 삽입할 수 있는 HTML 코드와 안내입니다.",
    "heading": "웹사이트에 무료 계산기 삽입하기",
    "intro": "방문자가 날짜, 근무일, 백분율, 시간대 계산기를 바로 사용할 수 있습니다. 회원가입은 필요 없습니다.",
    "installHeading": "설치 방법",
    "steps": [
      "아래에서 도구를 선택하고 HTML 코드를 복사하세요.",
      "웹사이트의 사용자 지정 HTML 블록에 붙여 넣으세요.",
      "데스크톱과 모바일에서 표시 및 작동을 확인하세요."
    ],
    "iframeFallback": "플랫폼에서 iframe을 지원하지 않으면 전체 도구로 연결하세요.",
    "featuredHeading": "삽입 가능한 도구 4개",
    "referenceNote": "각 코드에는 원본 도구로 연결되는 링크가 표시됩니다.",
    "copyCode": "HTML 복사",
    "fullTool": "전체 도구 열기",
    "previewWidget": "위젯 미리보기",
    "notesHeading": "게시자 안내",
    "notesBody": "위젯에는 인터넷 연결이 필요합니다. 용도와 제한을 설명하고 민감한 입력을 검토하며 전체 도구 링크를 유지하세요."
  },
  "es": {
    "metaTitle": "Inserta herramientas gratuitas en tu web",
    "metaDescription": "Añade calculadoras gratuitas de Toolify365 a tu blog o sitio educativo con código iframe listo para copiar.",
    "heading": "Inserta calculadoras gratis en tu sitio web",
    "intro": "Tus visitantes podrán calcular fechas, días laborables, porcentajes y zonas horarias sin registrarse.",
    "installHeading": "Cómo instalar",
    "steps": [
      "Elige una herramienta y copia el código HTML.",
      "Pega el código en un bloque HTML de tu sitio web.",
      "Comprueba el funcionamiento en ordenador y móvil."
    ],
    "iframeFallback": "Si tu plataforma bloquea los iframe, enlaza la herramienta completa.",
    "featuredHeading": "Cuatro herramientas listas para insertar",
    "referenceNote": "Cada código incluye un enlace visible a la herramienta original.",
    "copyCode": "Copiar este HTML",
    "fullTool": "Abrir herramienta completa",
    "previewWidget": "Vista previa del widget",
    "notesHeading": "Notas para editores",
    "notesBody": "El widget requiere conexión a Internet. Explica sus límites, revisa los datos sensibles y conserva el enlace para abrir la herramienta completa."
  },
  "pt-BR": {
    "metaTitle": "Incorpore ferramentas gratuitas no seu site",
    "metaDescription": "Adicione calculadoras gratuitas do Toolify365 ao seu blog ou site educacional com código iframe pronto para copiar.",
    "heading": "Incorpore calculadoras gratuitas no seu site",
    "intro": "Seus visitantes podem calcular datas, dias úteis, porcentagens e fusos horários sem cadastro.",
    "installHeading": "Como instalar",
    "steps": [
      "Escolha uma ferramenta abaixo e copie o HTML.",
      "Cole o código em um bloco HTML do seu site.",
      "Teste a exibição e o uso no computador e no celular."
    ],
    "iframeFallback": "Se a plataforma bloquear iframes, crie um link para a ferramenta completa.",
    "featuredHeading": "Quatro ferramentas prontas para incorporar",
    "referenceNote": "Cada código inclui um link visível para a ferramenta original.",
    "copyCode": "Copiar este HTML",
    "fullTool": "Abrir ferramenta completa",
    "previewWidget": "Prévia do widget",
    "notesHeading": "Orientações para publicadores",
    "notesBody": "O widget precisa de internet. Explique suas limitações, avalie o uso de dados sensíveis e mantenha o link para a ferramenta completa."
  },
  "fr": {
    "metaTitle": "Intégrer des outils gratuits sur votre site",
    "metaDescription": "Ajoutez les calculateurs gratuits Toolify365 à votre blog ou site éducatif avec un code iframe prêt à copier.",
    "heading": "Intégrez des calculateurs gratuits à votre site",
    "intro": "Vos visiteurs peuvent calculer des dates, jours ouvrés, pourcentages et fuseaux horaires sans inscription.",
    "installHeading": "Installation",
    "steps": [
      "Choisissez un outil ci-dessous et copiez le code HTML.",
      "Collez le code dans un bloc HTML de votre site.",
      "Vérifiez l'affichage sur ordinateur et mobile."
    ],
    "iframeFallback": "Si votre plateforme bloque les iframes, créez un lien vers l'outil complet.",
    "featuredHeading": "Quatre outils prêts à intégrer",
    "referenceNote": "Chaque extrait inclut un lien visible vers l'outil d'origine.",
    "copyCode": "Copier ce HTML",
    "fullTool": "Ouvrir l'outil complet",
    "previewWidget": "Aperçu du widget",
    "notesHeading": "Conseils aux éditeurs",
    "notesBody": "Le widget requiert Internet. Expliquez ses limites, vérifiez l'usage de données sensibles et conservez le lien vers l'outil complet."
  },
  "de": {
    "metaTitle": "Kostenlose Online-Tools auf deiner Website einbetten",
    "metaDescription": "Binde kostenlose Toolify365-Rechner mit kopierfertigem iframe-Code in Blogs oder Lernseiten ein.",
    "heading": "Kostenlose Rechner auf deiner Website einbetten",
    "intro": "Besucher können Datum, Arbeitstage, Prozente und Zeitzonen direkt berechnen – ohne Anmeldung.",
    "installHeading": "So funktioniert es",
    "steps": [
      "Wähle unten ein Tool und kopiere den HTML-Code.",
      "Füge den Code in einen HTML-Block deiner Website ein.",
      "Prüfe Darstellung und Bedienung auf Desktop und Smartphone."
    ],
    "iframeFallback": "Wenn deine Plattform iframes sperrt, verlinke das vollständige Tool.",
    "featuredHeading": "Vier einbettbare Tools",
    "referenceNote": "Jeder Code enthält einen sichtbaren Link zum Originaltool.",
    "copyCode": "Diesen HTML-Code kopieren",
    "fullTool": "Vollständiges Tool öffnen",
    "previewWidget": "Widget-Vorschau",
    "notesHeading": "Hinweise für Betreiber",
    "notesBody": "Das Widget benötigt Internet. Erkläre seine Grenzen, prüfe sensible Eingaben und behalte den Link zum vollständigen Tool bei."
  },
  "it": {
    "metaTitle": "Incorpora strumenti gratuiti nel tuo sito",
    "metaDescription": "Aggiungi i calcolatori gratuiti Toolify365 al tuo blog o sito didattico con codice iframe pronto da copiare.",
    "heading": "Incorpora calcolatori gratuiti nel tuo sito",
    "intro": "I visitatori potranno calcolare date, giorni lavorativi, percentuali e fusi orari senza registrarsi.",
    "installHeading": "Come installare",
    "steps": [
      "Scegli uno strumento qui sotto e copia il codice HTML.",
      "Incolla il codice in un blocco HTML del tuo sito.",
      "Controlla il funzionamento su computer e telefono."
    ],
    "iframeFallback": "Se la piattaforma blocca gli iframe, inserisci un link allo strumento completo.",
    "featuredHeading": "Quattro strumenti pronti da incorporare",
    "referenceNote": "Ogni codice include un link visibile allo strumento originale.",
    "copyCode": "Copia questo HTML",
    "fullTool": "Apri lo strumento completo",
    "previewWidget": "Anteprima widget",
    "notesHeading": "Note per gli editori",
    "notesBody": "Il widget richiede Internet. Spiega i suoi limiti, valuta i dati sensibili e conserva il link allo strumento completo."
  },
  "ru": {
    "metaTitle": "Встроить бесплатные инструменты на сайт",
    "metaDescription": "Добавьте бесплатные калькуляторы Toolify365 в блог или образовательный сайт с готовым HTML-кодом iframe.",
    "heading": "Встройте бесплатные калькуляторы на сайт",
    "intro": "Посетители смогут считать даты, рабочие дни, проценты и часовые пояса без регистрации.",
    "installHeading": "Как установить",
    "steps": [
      "Выберите инструмент ниже и скопируйте HTML-код.",
      "Вставьте код в HTML-блок своего сайта.",
      "Проверьте работу на компьютере и телефоне."
    ],
    "iframeFallback": "Если платформа блокирует iframe, добавьте ссылку на полную версию.",
    "featuredHeading": "Четыре инструмента для встраивания",
    "referenceNote": "Каждый код содержит видимую ссылку на исходный инструмент.",
    "copyCode": "Копировать HTML",
    "fullTool": "Открыть полный инструмент",
    "previewWidget": "Предпросмотр виджета",
    "notesHeading": "Примечания для издателей",
    "notesBody": "Виджету нужен интернет. Укажите ограничения, учитывайте конфиденциальные данные и сохраните ссылку на полный инструмент."
  },
  "ar": {
    "metaTitle": "تضمين أدوات مجانية في موقعك",
    "metaDescription": "أضف حاسبات Toolify365 المجانية إلى مدونتك أو موقعك التعليمي باستخدام كود iframe جاهز للنسخ.",
    "heading": "ضمّن حاسبات مجانية في موقعك",
    "intro": "يمكن للزوار حساب التواريخ وأيام العمل والنسب المئوية والمناطق الزمنية دون تسجيل.",
    "installHeading": "طريقة التثبيت",
    "steps": [
      "اختر أداة أدناه وانسخ كود HTML.",
      "ألصق الكود في قسم HTML المخصص في موقعك.",
      "تحقق من العرض والاستخدام على الحاسوب والهاتف."
    ],
    "iframeFallback": "إذا كانت منصتك تمنع iframe، فضع رابطًا إلى الأداة الكاملة.",
    "featuredHeading": "أربع أدوات جاهزة للتضمين",
    "referenceNote": "يتضمن كل كود رابطًا ظاهرًا إلى الأداة الأصلية.",
    "copyCode": "نسخ كود HTML",
    "fullTool": "فتح الأداة الكاملة",
    "previewWidget": "معاينة الأداة",
    "notesHeading": "ملاحظات للناشرين",
    "notesBody": "تحتاج الأداة إلى الإنترنت. وضّح حدود استخدامها وتحقق من حماية المدخلات الحساسة واحتفظ بالرابط إلى الأداة الكاملة."
  },
  "hi": {
    "metaTitle": "अपनी वेबसाइट में मुफ्त टूल जोड़ें",
    "metaDescription": "कॉपी करने योग्य iframe HTML कोड से अपने ब्लॉग या शैक्षिक साइट पर मुफ्त Toolify365 कैलकुलेटर जोड़ें।",
    "heading": "अपनी वेबसाइट में मुफ्त कैलकुलेटर जोड़ें",
    "intro": "आगंतुक बिना पंजीकरण के तारीख, कार्यदिवस, प्रतिशत और समय क्षेत्र की गणना कर सकते हैं।",
    "installHeading": "स्थापना कैसे करें",
    "steps": [
      "नीचे से टूल चुनें और HTML कोड कॉपी करें।",
      "कोड को अपनी वेबसाइट के HTML ब्लॉक में चिपकाएँ।",
      "डेस्कटॉप और मोबाइल पर इसे जाँचें।"
    ],
    "iframeFallback": "यदि iframe उपलब्ध नहीं है, तो पूरे टूल का लिंक दें।",
    "featuredHeading": "जोड़ने के लिए चार टूल",
    "referenceNote": "हर कोड में मूल टूल का दिखाई देने वाला लिंक शामिल है।",
    "copyCode": "यह HTML कॉपी करें",
    "fullTool": "पूरा टूल खोलें",
    "previewWidget": "विजेट का पूर्वावलोकन",
    "notesHeading": "प्रकाशकों के लिए सूचना",
    "notesBody": "विजेट को इंटरनेट चाहिए। उसकी सीमाएँ समझाएँ, संवेदनशील इनपुट की जाँच करें और पूरे टूल का लिंक बनाए रखें।"
  },
  "id": {
    "metaTitle": "Sematkan alat gratis di situs Anda",
    "metaDescription": "Tambahkan kalkulator gratis Toolify365 ke blog atau situs pendidikan dengan kode iframe siap salin.",
    "heading": "Sematkan kalkulator gratis di situs Anda",
    "intro": "Pengunjung dapat menghitung tanggal, hari kerja, persentase, dan zona waktu tanpa mendaftar.",
    "installHeading": "Cara memasang",
    "steps": [
      "Pilih alat di bawah dan salin kode HTML.",
      "Tempelkan kode ke blok HTML di situs Anda.",
      "Periksa tampilan di komputer dan ponsel."
    ],
    "iframeFallback": "Jika platform melarang iframe, tautkan ke alat lengkap.",
    "featuredHeading": "Empat alat siap disematkan",
    "referenceNote": "Setiap kode menyertakan tautan yang terlihat ke alat aslinya.",
    "copyCode": "Salin HTML ini",
    "fullTool": "Buka alat lengkap",
    "previewWidget": "Pratinjau widget",
    "notesHeading": "Catatan untuk penerbit",
    "notesBody": "Widget memerlukan internet. Jelaskan batasannya, periksa data sensitif, dan pertahankan tautan ke alat lengkap."
  },
  "th": {
    "metaTitle": "ฝังเครื่องมือฟรีในเว็บไซต์ของคุณ",
    "metaDescription": "เพิ่มเครื่องคำนวณ Toolify365 ฟรีลงในบล็อกหรือเว็บไซต์การศึกษาด้วยโค้ด iframe ที่คัดลอกได้",
    "heading": "ฝังเครื่องคำนวณฟรีในเว็บไซต์",
    "intro": "ผู้เข้าชมคำนวณวันที่ วันทำงาน เปอร์เซ็นต์ และเขตเวลาได้โดยไม่ต้องสมัครสมาชิก",
    "installHeading": "วิธีติดตั้ง",
    "steps": [
      "เลือกเครื่องมือด้านล่างแล้วคัดลอกโค้ด HTML",
      "วางโค้ดในบล็อก HTML ของเว็บไซต์คุณ",
      "ตรวจสอบการแสดงผลบนคอมพิวเตอร์และมือถือ"
    ],
    "iframeFallback": "หากแพลตฟอร์มไม่รองรับ iframe ให้ลิงก์ไปยังเครื่องมือฉบับเต็ม",
    "featuredHeading": "เครื่องมือพร้อมฝัง 4 รายการ",
    "referenceNote": "แต่ละโค้ดมีลิงก์ที่มองเห็นได้ไปยังเครื่องมือต้นฉบับ",
    "copyCode": "คัดลอก HTML นี้",
    "fullTool": "เปิดเครื่องมือฉบับเต็ม",
    "previewWidget": "ดูตัวอย่างวิดเจ็ต",
    "notesHeading": "คำแนะนำสำหรับผู้เผยแพร่",
    "notesBody": "วิดเจ็ตต้องใช้อินเทอร์เน็ต อธิบายข้อจำกัด ระวังข้อมูลที่ละเอียดอ่อน และเก็บลิงก์ไปยังเครื่องมือฉบับเต็มไว้"
  },
  "vi": {
    "metaTitle": "Nhúng công cụ miễn phí vào website",
    "metaDescription": "Thêm các máy tính Toolify365 miễn phí vào blog hoặc trang giáo dục bằng mã iframe sẵn để sao chép.",
    "heading": "Nhúng máy tính miễn phí vào website",
    "intro": "Khách truy cập có thể tính ngày, ngày làm việc, phần trăm và múi giờ mà không cần đăng ký.",
    "installHeading": "Cách cài đặt",
    "steps": [
      "Chọn một công cụ bên dưới và sao chép mã HTML.",
      "Dán mã vào khối HTML trên website của bạn.",
      "Kiểm tra giao diện trên máy tính và điện thoại."
    ],
    "iframeFallback": "Nếu nền tảng chặn iframe, hãy dẫn liên kết đến công cụ đầy đủ.",
    "featuredHeading": "Bốn công cụ sẵn sàng để nhúng",
    "referenceNote": "Mỗi đoạn mã có liên kết hiển thị đến công cụ gốc.",
    "copyCode": "Sao chép HTML này",
    "fullTool": "Mở công cụ đầy đủ",
    "previewWidget": "Xem trước tiện ích",
    "notesHeading": "Lưu ý cho nhà xuất bản",
    "notesBody": "Tiện ích cần Internet. Hãy giải thích giới hạn, xem xét dữ liệu nhạy cảm và giữ liên kết đến công cụ đầy đủ."
  },
  "tr": {
    "metaTitle": "Web sitenize ücretsiz araçlar ekleyin",
    "metaDescription": "Ücretsiz Toolify365 hesaplayıcılarını kopyalanabilir iframe koduyla blogunuza veya eğitim sitenize yerleştirin.",
    "heading": "Web sitenize ücretsiz hesaplayıcılar yerleştirin",
    "intro": "Ziyaretçiler kayıt olmadan tarih, iş günü, yüzde ve saat dilimi hesaplayabilir.",
    "installHeading": "Nasıl kurulur",
    "steps": [
      "Aşağıdan bir araç seçin ve HTML kodunu kopyalayın.",
      "Kodu web sitenizdeki HTML bloğuna yapıştırın.",
      "Masaüstü ve telefonda görüntüyü ve çalışmasını kontrol edin."
    ],
    "iframeFallback": "Platformunuz iframe'i engelliyorsa tam araca bağlantı verin.",
    "featuredHeading": "Yerleştirmeye hazır dört araç",
    "referenceNote": "Her kod, özgün araca görünen bir bağlantı içerir.",
    "copyCode": "Bu HTML kodunu kopyala",
    "fullTool": "Tam aracı aç",
    "previewWidget": "Widget önizlemesi",
    "notesHeading": "Yayıncı notları",
    "notesBody": "Widget internet bağlantısı gerektirir. Sınırlarını açıklayın, hassas verileri değerlendirin ve tam araca bağlantıyı koruyun."
  }
} as const satisfies Record<Locale, EmbedGuideCopy>;

export function embedGuideCopyFor(locale: string): EmbedGuideCopy {
  return Object.prototype.hasOwnProperty.call(EMBED_GUIDE_COPY, locale)
    ? EMBED_GUIDE_COPY[locale as Locale]
    : EMBED_GUIDE_COPY.en;
}
