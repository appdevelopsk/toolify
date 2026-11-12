import type { Locale } from "@/lib/i18n/locales";

/** Available browser-based software only; planned products retain catalog fallback. */
export const SOFTWARE_DESCRIPTIONS = {
  "en": {
    "csv-cleaner-pro": "Clean duplicate and empty CSV rows locally in your browser.",
    "json-studio": "Validate, format and minify JSON locally.",
    "text-batch-studio": "Clean, deduplicate and transform text lines locally."
  },
  "ja": {
    "csv-cleaner-pro": "CSVの重複行や空行をブラウザ内で削除します。",
    "json-studio": "JSONの検証・整形・圧縮をブラウザ内で行います。",
    "text-batch-studio": "テキスト行の整形・重複削除・変換をブラウザ内で行います。"
  },
  "zh-CN": {
    "csv-cleaner-pro": "在浏览器中清理 CSV 的重复行和空行。",
    "json-studio": "在本地验证、格式化和压缩 JSON。",
    "text-batch-studio": "在浏览器中清理、去重和转换文本行。"
  },
  "zh-TW": {
    "csv-cleaner-pro": "在瀏覽器中清理 CSV 的重複列與空白列。",
    "json-studio": "在本機驗證、格式化及壓縮 JSON。",
    "text-batch-studio": "在瀏覽器中整理、去除重複及轉換文字列。"
  },
  "ko": {
    "csv-cleaner-pro": "브라우저에서 CSV의 중복 행과 빈 행을 정리합니다.",
    "json-studio": "브라우저에서 JSON을 검증하고 서식을 지정하며 압축합니다.",
    "text-batch-studio": "브라우저에서 텍스트 줄을 정리하고 중복 제거 및 변환합니다."
  },
  "es": {
    "csv-cleaner-pro": "Elimina filas duplicadas y vacías de CSV en tu navegador.",
    "json-studio": "Valida, formatea y minifica JSON de forma local.",
    "text-batch-studio": "Limpia, elimina duplicados y transforma líneas de texto en tu navegador."
  },
  "pt-BR": {
    "csv-cleaner-pro": "Limpe linhas duplicadas e vazias de CSV no navegador.",
    "json-studio": "Valide, formate e compacte JSON localmente.",
    "text-batch-studio": "Limpe, remova duplicatas e transforme linhas de texto no navegador."
  },
  "fr": {
    "csv-cleaner-pro": "Supprimez les lignes CSV vides ou en double dans votre navigateur.",
    "json-studio": "Validez, formatez et minifiez du JSON en local.",
    "text-batch-studio": "Nettoyez, dédupliquez et transformez des lignes de texte dans le navigateur."
  },
  "de": {
    "csv-cleaner-pro": "Entferne doppelte und leere CSV-Zeilen direkt im Browser.",
    "json-studio": "Prüfe, formatiere und minimiere JSON lokal.",
    "text-batch-studio": "Bereinige, dedupliziere und transformiere Textzeilen im Browser."
  },
  "it": {
    "csv-cleaner-pro": "Rimuovi righe CSV vuote e duplicate direttamente nel browser.",
    "json-studio": "Convalida, formatta e minimizza JSON in locale.",
    "text-batch-studio": "Pulisci, deduplica e trasforma righe di testo nel browser."
  },
  "ru": {
    "csv-cleaner-pro": "Удаляйте пустые и повторяющиеся строки CSV прямо в браузере.",
    "json-studio": "Проверяйте, форматируйте и сжимайте JSON локально.",
    "text-batch-studio": "Очищайте, удаляйте дубликаты и преобразуйте строки текста в браузере."
  },
  "ar": {
    "csv-cleaner-pro": "احذف صفوف CSV الفارغة والمكررة داخل المتصفح.",
    "json-studio": "تحقق من JSON ونسّقه واضغطه محليًا.",
    "text-batch-studio": "نظّف أسطر النص واحذف التكرارات وحوّلها داخل المتصفح."
  },
  "hi": {
    "csv-cleaner-pro": "ब्राउज़र में CSV की खाली और दोहराई गई पंक्तियाँ हटाएँ।",
    "json-studio": "JSON को स्थानीय रूप से जाँचें, फ़ॉर्मैट करें और छोटा करें।",
    "text-batch-studio": "ब्राउज़र में टेक्स्ट पंक्तियाँ साफ़ करें, डुप्लिकेट हटाएँ और बदलें।"
  },
  "id": {
    "csv-cleaner-pro": "Hapus baris CSV yang kosong dan duplikat langsung di browser.",
    "json-studio": "Validasi, format, dan perkecil JSON secara lokal.",
    "text-batch-studio": "Bersihkan, hapus duplikat, dan ubah baris teks di browser."
  },
  "th": {
    "csv-cleaner-pro": "ลบแถว CSV ที่ว่างและซ้ำกันภายในเบราว์เซอร์",
    "json-studio": "ตรวจสอบ จัดรูปแบบ และย่อ JSON ภายในเครื่อง",
    "text-batch-studio": "จัดระเบียบ ลบข้อมูลซ้ำ และแปลงบรรทัดข้อความในเบราว์เซอร์"
  },
  "vi": {
    "csv-cleaner-pro": "Xóa các dòng CSV trống hoặc trùng lặp ngay trong trình duyệt.",
    "json-studio": "Kiểm tra, định dạng và thu gọn JSON tại máy của bạn.",
    "text-batch-studio": "Làm sạch, xóa trùng và chuyển đổi các dòng văn bản trong trình duyệt."
  },
  "tr": {
    "csv-cleaner-pro": "Tekrarlanan ve boş CSV satırlarını tarayıcınızda temizleyin.",
    "json-studio": "JSON verisini yerel olarak doğrulayın, biçimlendirin ve küçültün.",
    "text-batch-studio": "Metin satırlarını tarayıcıda temizleyin, yinelenenleri kaldırın ve dönüştürün."
  }
} as const satisfies Record<Locale, Record<"csv-cleaner-pro" | "json-studio" | "text-batch-studio", string>>;

export function softwareDescription(slug: string, locale: string, fallback: string): string {
  if (!Object.prototype.hasOwnProperty.call(SOFTWARE_DESCRIPTIONS, locale)) return fallback;
  const descriptions = SOFTWARE_DESCRIPTIONS[locale as Locale];
  return Object.prototype.hasOwnProperty.call(descriptions, slug)
    ? descriptions[slug as keyof typeof descriptions]
    : fallback;
}
