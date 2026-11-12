import type { Locale } from "@/lib/i18n/locales";

/** Goal-led tool navigation localized for each active site language. */
export type JourneyCopy = {
  heading: string;
  intro: string;
  cta: string;
  deadlineTitle: string;
  deadlineDescription: string;
  writingTitle: string;
  writingDescription: string;
  dataTitle: string;
  dataDescription: string;
  designTitle: string;
  designDescription: string;
};

export const JOURNEY_COPY = {
  "en": {
    "heading": "Start with what you want to do",
    "intro": "Follow these free tools in order. Inputs are not transferred between tools.",
    "cta": "Start this workflow",
    "deadlineTitle": "Plan a deadline",
    "deadlineDescription": "Count working days, choose a date, and compare time zones.",
    "writingTitle": "Polish writing",
    "writingDescription": "Count words, estimate reading time, and edit text.",
    "dataTitle": "Clean and convert data",
    "dataDescription": "Convert CSV, format JSON, and remove duplicates.",
    "designTitle": "Prepare a web image",
    "designDescription": "Resize an image, check proportions, and convert colors."
  },
  "ja": {
    "heading": "目的からツールを探す",
    "intro": "無料ツールを作業順にまとめました。入力内容はツール間で引き継がれません。",
    "cta": "最初のツールを開く",
    "deadlineTitle": "納期を決める",
    "deadlineDescription": "営業日を数え、日付を決め、時差を確認します。",
    "writingTitle": "文章を仕上げる",
    "writingDescription": "文字数と読了時間を確認し、文章を整えます。",
    "dataTitle": "データを整形する",
    "dataDescription": "CSV変換、JSON整形、重複行の削除を行います。",
    "designTitle": "Web画像を準備する",
    "designDescription": "画像サイズ、縦横比、色を調整します。"
  },
  "zh-CN": {
    "heading": "从要完成的任务开始",
    "intro": "按顺序使用这些免费工具。输入内容不会在工具之间传递。",
    "cta": "开始此流程",
    "deadlineTitle": "规划截止日期",
    "deadlineDescription": "计算工作日、确定日期并比较时区。",
    "writingTitle": "润色文字",
    "writingDescription": "统计字数、估算阅读时间并编辑文字。",
    "dataTitle": "清理和转换数据",
    "dataDescription": "转换 CSV、格式化 JSON 并删除重复项。",
    "designTitle": "准备网页图片",
    "designDescription": "调整尺寸、检查比例并转换颜色。"
  },
  "zh-TW": {
    "heading": "從要完成的工作開始",
    "intro": "依序使用這些免費工具。輸入內容不會在工具之間傳遞。",
    "cta": "開始此流程",
    "deadlineTitle": "規劃截止日期",
    "deadlineDescription": "計算工作日、設定日期並比較時區。",
    "writingTitle": "潤飾文字",
    "writingDescription": "統計字數、估算閱讀時間並編輯文字。",
    "dataTitle": "清理與轉換資料",
    "dataDescription": "轉換 CSV、格式化 JSON 並刪除重複項目。",
    "designTitle": "準備網頁圖片",
    "designDescription": "調整尺寸、檢查比例並轉換顏色。"
  },
  "ko": {
    "heading": "하려는 작업부터 시작하세요",
    "intro": "무료 도구를 순서대로 사용하세요. 입력 내용은 도구 간에 전달되지 않습니다.",
    "cta": "작업 시작",
    "deadlineTitle": "마감일 계획하기",
    "deadlineDescription": "근무일을 계산하고 날짜와 시간대를 비교합니다.",
    "writingTitle": "글 다듬기",
    "writingDescription": "단어 수와 읽기 시간을 확인하고 문장을 수정합니다.",
    "dataTitle": "데이터 정리 및 변환",
    "dataDescription": "CSV 변환, JSON 서식 지정, 중복 제거를 수행합니다.",
    "designTitle": "웹 이미지 준비",
    "designDescription": "이미지 크기와 비율을 확인하고 색상을 변환합니다."
  },
  "es": {
    "heading": "Empieza por lo que necesitas hacer",
    "intro": "Usa estas herramientas gratuitas en orden. Los datos no se transfieren entre ellas.",
    "cta": "Empezar esta tarea",
    "deadlineTitle": "Planificar un plazo",
    "deadlineDescription": "Cuenta días laborables, elige una fecha y compara zonas horarias.",
    "writingTitle": "Mejorar un texto",
    "writingDescription": "Cuenta palabras, estima el tiempo de lectura y edita.",
    "dataTitle": "Limpiar y convertir datos",
    "dataDescription": "Convierte CSV, da formato a JSON y elimina duplicados.",
    "designTitle": "Preparar una imagen web",
    "designDescription": "Cambia el tamaño, revisa las proporciones y convierte colores."
  },
  "pt-BR": {
    "heading": "Comece pelo que você precisa fazer",
    "intro": "Use estas ferramentas gratuitas em sequência. Os dados não são transferidos entre elas.",
    "cta": "Iniciar esta tarefa",
    "deadlineTitle": "Planejar um prazo",
    "deadlineDescription": "Conte dias úteis, escolha uma data e compare fusos horários.",
    "writingTitle": "Revisar um texto",
    "writingDescription": "Conte palavras, estime o tempo de leitura e edite.",
    "dataTitle": "Limpar e converter dados",
    "dataDescription": "Converta CSV, formate JSON e remova duplicatas.",
    "designTitle": "Preparar uma imagem para a web",
    "designDescription": "Redimensione, confira as proporções e converta cores."
  },
  "fr": {
    "heading": "Commencez par votre objectif",
    "intro": "Utilisez ces outils gratuits dans l'ordre. Vos données ne passent pas d'un outil à l'autre.",
    "cta": "Commencer",
    "deadlineTitle": "Planifier une échéance",
    "deadlineDescription": "Comptez les jours ouvrés, fixez une date et comparez les fuseaux horaires.",
    "writingTitle": "Améliorer un texte",
    "writingDescription": "Comptez les mots, estimez le temps de lecture et modifiez le texte.",
    "dataTitle": "Nettoyer et convertir des données",
    "dataDescription": "Convertissez des CSV, formatez du JSON et supprimez les doublons.",
    "designTitle": "Préparer une image web",
    "designDescription": "Redimensionnez, vérifiez les proportions et convertissez les couleurs."
  },
  "de": {
    "heading": "Beginne mit deinem Ziel",
    "intro": "Nutze diese kostenlosen Tools nacheinander. Eingaben werden nicht zwischen Tools übertragen.",
    "cta": "Ablauf starten",
    "deadlineTitle": "Eine Frist planen",
    "deadlineDescription": "Zähle Arbeitstage, lege ein Datum fest und vergleiche Zeitzonen.",
    "writingTitle": "Texte überarbeiten",
    "writingDescription": "Zähle Wörter, schätze die Lesezeit und bearbeite Text.",
    "dataTitle": "Daten bereinigen und umwandeln",
    "dataDescription": "Konvertiere CSV, formatiere JSON und entferne Duplikate.",
    "designTitle": "Webbilder vorbereiten",
    "designDescription": "Ändere die Größe, prüfe Proportionen und konvertiere Farben."
  },
  "it": {
    "heading": "Inizia da ciò che vuoi fare",
    "intro": "Usa questi strumenti gratuiti in sequenza. I dati non vengono trasferiti tra strumenti.",
    "cta": "Inizia il percorso",
    "deadlineTitle": "Pianificare una scadenza",
    "deadlineDescription": "Conta i giorni lavorativi, scegli una data e confronta i fusi orari.",
    "writingTitle": "Migliorare un testo",
    "writingDescription": "Conta le parole, stima il tempo di lettura e modifica il testo.",
    "dataTitle": "Pulire e convertire dati",
    "dataDescription": "Converti CSV, formatta JSON e rimuovi i duplicati.",
    "designTitle": "Preparare un'immagine web",
    "designDescription": "Ridimensiona, controlla le proporzioni e converti i colori."
  },
  "ru": {
    "heading": "Начните с вашей задачи",
    "intro": "Используйте бесплатные инструменты по порядку. Данные между ними не передаются.",
    "cta": "Начать",
    "deadlineTitle": "Спланировать срок",
    "deadlineDescription": "Посчитайте рабочие дни, выберите дату и сравните часовые пояса.",
    "writingTitle": "Отредактировать текст",
    "writingDescription": "Посчитайте слова, оцените время чтения и исправьте текст.",
    "dataTitle": "Очистить и преобразовать данные",
    "dataDescription": "Преобразуйте CSV, форматируйте JSON и удалите дубликаты.",
    "designTitle": "Подготовить изображение для сайта",
    "designDescription": "Измените размер, проверьте пропорции и преобразуйте цвета."
  },
  "ar": {
    "heading": "ابدأ بما تريد إنجازه",
    "intro": "استخدم هذه الأدوات المجانية بالترتيب. لا تُنقل المدخلات بين الأدوات.",
    "cta": "ابدأ هذه المهمة",
    "deadlineTitle": "تخطيط موعد نهائي",
    "deadlineDescription": "احسب أيام العمل وحدد التاريخ وقارن المناطق الزمنية.",
    "writingTitle": "تحسين النص",
    "writingDescription": "احسب الكلمات وقدّر وقت القراءة وعدّل النص.",
    "dataTitle": "تنظيف البيانات وتحويلها",
    "dataDescription": "حوّل CSV ونسّق JSON وأزل التكرارات.",
    "designTitle": "إعداد صورة للويب",
    "designDescription": "غيّر الحجم وتحقق من النسب وحوّل الألوان."
  },
  "hi": {
    "heading": "अपने काम से शुरुआत करें",
    "intro": "इन निःशुल्क टूल का क्रम से उपयोग करें। इनपुट एक टूल से दूसरे में नहीं भेजा जाता।",
    "cta": "शुरू करें",
    "deadlineTitle": "समय-सीमा तय करें",
    "deadlineDescription": "कार्यदिवस गिनें, तारीख चुनें और समय क्षेत्रों की तुलना करें।",
    "writingTitle": "लेखन सुधारें",
    "writingDescription": "शब्द गिनें, पढ़ने का समय जानें और पाठ संपादित करें।",
    "dataTitle": "डेटा साफ़ करें और बदलें",
    "dataDescription": "CSV बदलें, JSON फ़ॉर्मैट करें और डुप्लिकेट हटाएँ।",
    "designTitle": "वेब चित्र तैयार करें",
    "designDescription": "आकार बदलें, अनुपात जाँचें और रंग बदलें।"
  },
  "id": {
    "heading": "Mulai dari tujuan Anda",
    "intro": "Gunakan alat gratis ini secara berurutan. Input tidak dipindahkan antaralat.",
    "cta": "Mulai alur ini",
    "deadlineTitle": "Rencanakan tenggat",
    "deadlineDescription": "Hitung hari kerja, pilih tanggal, dan bandingkan zona waktu.",
    "writingTitle": "Rapikan tulisan",
    "writingDescription": "Hitung kata, perkirakan waktu baca, lalu sunting teks.",
    "dataTitle": "Bersihkan dan konversi data",
    "dataDescription": "Konversi CSV, format JSON, dan hapus duplikat.",
    "designTitle": "Siapkan gambar web",
    "designDescription": "Ubah ukuran, periksa rasio, dan konversi warna."
  },
  "th": {
    "heading": "เริ่มจากสิ่งที่คุณต้องการทำ",
    "intro": "ใช้เครื่องมือฟรีเหล่านี้ตามลำดับ ข้อมูลที่กรอกจะไม่ถูกส่งต่อระหว่างเครื่องมือ",
    "cta": "เริ่มขั้นตอนนี้",
    "deadlineTitle": "วางแผนกำหนดส่ง",
    "deadlineDescription": "นับวันทำงาน เลือกวันที่ และเปรียบเทียบเขตเวลา",
    "writingTitle": "ปรับปรุงงานเขียน",
    "writingDescription": "นับคำ ประเมินเวลาอ่าน และแก้ไขข้อความ",
    "dataTitle": "จัดระเบียบและแปลงข้อมูล",
    "dataDescription": "แปลง CSV จัดรูปแบบ JSON และลบรายการซ้ำ",
    "designTitle": "เตรียมภาพสำหรับเว็บ",
    "designDescription": "ปรับขนาด ตรวจสอบสัดส่วน และแปลงสี"
  },
  "vi": {
    "heading": "Bắt đầu từ việc bạn muốn làm",
    "intro": "Dùng các công cụ miễn phí theo thứ tự. Dữ liệu nhập không được chuyển giữa các công cụ.",
    "cta": "Bắt đầu quy trình",
    "deadlineTitle": "Lên kế hoạch thời hạn",
    "deadlineDescription": "Đếm ngày làm việc, chọn ngày và so sánh múi giờ.",
    "writingTitle": "Chỉnh sửa văn bản",
    "writingDescription": "Đếm từ, ước tính thời gian đọc và chỉnh sửa.",
    "dataTitle": "Làm sạch và chuyển đổi dữ liệu",
    "dataDescription": "Chuyển CSV, định dạng JSON và xóa mục trùng.",
    "designTitle": "Chuẩn bị ảnh cho web",
    "designDescription": "Đổi kích thước, kiểm tra tỷ lệ và chuyển đổi màu."
  },
  "tr": {
    "heading": "Yapmak istediğiniz işle başlayın",
    "intro": "Bu ücretsiz araçları sırayla kullanın. Girdiler araçlar arasında aktarılmaz.",
    "cta": "İşleme başla",
    "deadlineTitle": "Son tarih planlayın",
    "deadlineDescription": "İş günlerini sayın, tarih seçin ve saat dilimlerini karşılaştırın.",
    "writingTitle": "Metni düzenleyin",
    "writingDescription": "Kelimeleri sayın, okuma süresini tahmin edin ve metni düzeltin.",
    "dataTitle": "Verileri temizleyin ve dönüştürün",
    "dataDescription": "CSV dönüştürün, JSON biçimlendirin ve tekrarları kaldırın.",
    "designTitle": "Web görseli hazırlayın",
    "designDescription": "Boyutlandırın, oranları kontrol edin ve renkleri dönüştürün."
  }
} as const satisfies Record<Locale, JourneyCopy>;

/** Unknown locale: readable English fallback without affecting index policy. */
export function journeyCopyFor(locale: string): JourneyCopy {
  return Object.prototype.hasOwnProperty.call(JOURNEY_COPY, locale)
    ? JOURNEY_COPY[locale as Locale]
    : JOURNEY_COPY.en;
}
