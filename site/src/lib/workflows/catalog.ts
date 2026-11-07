import type { Locale } from "@/lib/i18n/locales";
import { WORKFLOWS } from "./steps";
import type { WorkflowId } from "./steps";

export { WORKFLOWS, getWorkflowContinuation } from "./steps";
export type { WorkflowId } from "./steps";

/**
 * [navigation, heading, explanation, step label, open label, privacy note,
 *  data workflow, writing workflow, shopping workflow, scheduling workflow].
 * Full 17-locale coverage. Existing tool translations provide each step's
 * descriptive copy, avoiding a second set of tool descriptions.
 */
const COPY: Record<Locale, readonly string[]> = {
  en: ["Guided workflows", "Finish a task with free online tools", "Choose a goal and use these tools in order. Return here between steps; no account or installation is needed.", "Step", "Open tool", "Your inputs are not passed between tools. No personal data is saved by this guide.", "Clean and convert data", "Prepare text for publishing", "Compare a purchase", "Plan dates and schedules"],
  ja: ["目的別ガイド", "無料ツールを組み合わせて目的を達成", "目的を選び、上から順番にツールを使います。各操作後はこのページに戻って次のステップに進めます。登録やインストールは不要です。", "手順", "ツールを開く", "入力内容はツール間で引き継がれず、このガイドには個人情報を保存しません。", "データを整理・変換する", "文章を公開用に整える", "購入前に価格を比較する", "日程や予定を組み立てる"],
  "zh-CN": ["任务指南", "使用免费在线工具完成任务", "选择目标并按顺序使用工具。每步完成后返回此页，无需注册或安装。", "步骤", "打开工具", "输入内容不会在工具之间传递，本指南不保存个人信息。", "清理与转换数据", "整理发布文本", "比较购物价格", "规划日期和日程"],
  "zh-TW": ["任務指南", "使用免費線上工具完成任務", "選擇目標並依序使用工具。每步完成後返回此頁，無須註冊或安裝。", "步驟", "開啟工具", "輸入內容不會在工具間傳遞，本指南不儲存個人資料。", "清理與轉換資料", "整理發佈文字", "比較購物價格", "規劃日期與行程"],
  ko: ["작업별 가이드", "무료 온라인 도구로 작업 완료하기", "목표를 선택하고 순서대로 도구를 사용하세요. 각 단계 후 이 페이지로 돌아오면 됩니다.", "단계", "도구 열기", "입력 내용은 도구 간에 전달되지 않으며 개인정보를 저장하지 않습니다.", "데이터 정리 및 변환", "게시할 글 준비", "구매 가격 비교", "날짜와 일정 계획"],
  es: ["Guías por objetivo", "Completa tareas con herramientas gratis", "Elige un objetivo y usa las herramientas en orden. Regresa aquí tras cada paso. Sin registro ni instalación.", "Paso", "Abrir herramienta", "Los datos ingresados no se transfieren entre herramientas ni se guardan aquí.", "Limpiar y convertir datos", "Preparar textos para publicar", "Comparar una compra", "Planificar fechas y horarios"],
  "pt-BR": ["Guias por objetivo", "Conclua tarefas com ferramentas grátis", "Escolha um objetivo e use as ferramentas em ordem. Volte aqui após cada etapa. Sem cadastro ou instalação.", "Etapa", "Abrir ferramenta", "Os dados inseridos não são transferidos entre ferramentas nem salvos neste guia.", "Limpar e converter dados", "Preparar textos para publicação", "Comparar uma compra", "Planejar datas e horários"],
  fr: ["Parcours guidés", "Terminez vos tâches avec des outils gratuits", "Choisissez un objectif et utilisez les outils dans l’ordre. Revenez ici entre les étapes, sans inscription.", "Étape", "Ouvrir l’outil", "Les données saisies ne sont ni transférées entre outils ni enregistrées par ce guide.", "Nettoyer et convertir des données", "Préparer un texte à publier", "Comparer un achat", "Planifier dates et horaires"],
  de: ["Geführte Abläufe", "Aufgaben mit kostenlosen Tools erledigen", "Wählen Sie ein Ziel und nutzen Sie die Tools der Reihe nach. Kehren Sie nach jedem Schritt zurück.", "Schritt", "Tool öffnen", "Eingaben werden nicht zwischen Tools übertragen oder von diesem Leitfaden gespeichert.", "Daten bereinigen und umwandeln", "Texte zur Veröffentlichung vorbereiten", "Einkaufspreise vergleichen", "Termine planen"],
  it: ["Percorsi guidati", "Completa attività con strumenti gratuiti", "Scegli un obiettivo e usa gli strumenti nell’ordine indicato. Torna qui dopo ogni passaggio.", "Passaggio", "Apri strumento", "I dati inseriti non passano tra gli strumenti e non vengono salvati in questa guida.", "Pulire e convertire dati", "Preparare testi da pubblicare", "Confrontare un acquisto", "Pianificare date e orari"],
  ru: ["Пошаговые инструкции", "Решайте задачи бесплатными инструментами", "Выберите задачу и используйте инструменты по порядку. После каждого шага возвращайтесь сюда.", "Шаг", "Открыть инструмент", "Введённые данные не передаются между инструментами и не сохраняются в руководстве.", "Очистка и конвертация данных", "Подготовка текста к публикации", "Сравнение покупок", "Планирование дат и времени"],
  ar: ["أدلة حسب المهمة", "أنجز مهامك بأدوات مجانية", "اختر هدفًا واستخدم الأدوات بالترتيب. عد إلى هذه الصفحة بعد كل خطوة، بلا تسجيل.", "خطوة", "فتح الأداة", "لا تنتقل المدخلات بين الأدوات ولا تُحفظ البيانات الشخصية في هذا الدليل.", "تنظيف البيانات وتحويلها", "إعداد النص للنشر", "مقارنة أسعار الشراء", "تخطيط المواعيد والجداول"],
  hi: ["कार्य मार्गदर्शिकाएँ", "मुफ़्त टूल से काम पूरा करें", "लक्ष्य चुनें और क्रम में टूल इस्तेमाल करें। हर चरण के बाद यहाँ लौटें; साइन-अप की ज़रूरत नहीं।", "चरण", "टूल खोलें", "आपका इनपुट टूल के बीच साझा नहीं होता और यह गाइड निजी डेटा नहीं रखती।", "डेटा साफ़ करें और बदलें", "प्रकाशन के लिए लेख तैयार करें", "खरीद की तुलना करें", "तारीख़ और समय की योजना"],
  id: ["Panduan tugas", "Selesaikan tugas dengan alat gratis", "Pilih tujuan dan gunakan alat secara berurutan. Kembali ke sini setiap selesai langkah.", "Langkah", "Buka alat", "Masukan tidak dikirim antaralat atau disimpan oleh panduan ini.", "Bersihkan dan konversi data", "Siapkan teks untuk publikasi", "Bandingkan harga belanja", "Rencanakan tanggal dan jadwal"],
  th: ["คู่มือแบบเป็นขั้นตอน", "ทำงานให้เสร็จด้วยเครื่องมือฟรี", "เลือกเป้าหมายและใช้เครื่องมือตามลำดับ กลับมาที่หน้านี้หลังแต่ละขั้นตอน", "ขั้นตอน", "เปิดเครื่องมือ", "ข้อมูลที่กรอกจะไม่ถูกส่งข้ามเครื่องมือหรือบันทึกโดยคู่มือนี้", "ทำความสะอาดและแปลงข้อมูล", "เตรียมข้อความสำหรับเผยแพร่", "เปรียบเทียบราคาก่อนซื้อ", "วางแผนวันและตารางเวลา"],
  vi: ["Hướng dẫn theo mục tiêu", "Hoàn thành việc với công cụ miễn phí", "Chọn mục tiêu và dùng các công cụ theo thứ tự. Quay lại đây sau mỗi bước, không cần đăng ký.", "Bước", "Mở công cụ", "Dữ liệu nhập không được chuyển giữa các công cụ hoặc lưu trong hướng dẫn này.", "Làm sạch và chuyển đổi dữ liệu", "Chuẩn bị văn bản để đăng", "So sánh giá mua hàng", "Lập kế hoạch ngày và lịch"],
  tr: ["Görev rehberleri", "Ücretsiz araçlarla işinizi bitirin", "Bir hedef seçin ve araçları sırayla kullanın. Her adımdan sonra buraya dönün.", "Adım", "Aracı aç", "Girdiler araçlar arasında aktarılmaz veya bu rehberde saklanmaz.", "Verileri temizle ve dönüştür", "Yayımlanacak metni hazırla", "Alışveriş fiyatlarını karşılaştır", "Tarih ve takvim planla"],
};

export function workflowCopy(locale: string) {
  const c = COPY[locale as Locale] ?? COPY.en;
  const get = (index: number): string => c[index] ?? COPY.en[index] ?? "";
  return {
    nav: get(0),
    heading: get(1),
    description: get(2),
    step: get(3),
    open: get(4),
    privacy: get(5),
    title: (id: WorkflowId): string => get(6 + WORKFLOWS.findIndex((flow) => flow.id === id)),
  };
}
