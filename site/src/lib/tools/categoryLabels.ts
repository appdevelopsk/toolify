import type { Locale } from "@/lib/i18n/locales";
import type { ToolCategory } from "./types";

/** Localized navigation/category labels for all 17 active locales. */
export const CATEGORY_LABELS = {
  "en": {
    "health": "Health & Fitness",
    "math": "Math & Numbers",
    "converter": "Unit Converters",
    "datetime": "Date & Time",
    "text": "Text & Code",
    "color": "Color & Design",
    "finance": "Finance",
    "image": "Image & Files"
  },
  "ja": {
    "health": "健康・フィットネス",
    "math": "数学・数字",
    "converter": "単位変換",
    "datetime": "日付・時刻",
    "text": "テキスト・コード",
    "color": "色・デザイン",
    "finance": "金融",
    "image": "画像・ファイル"
  },
  "zh-CN": {
    "health": "健康与健身",
    "math": "数学与数字",
    "converter": "单位换算",
    "datetime": "日期与时间",
    "text": "文本与代码",
    "color": "颜色与设计",
    "finance": "金融",
    "image": "图片与文件"
  },
  "zh-TW": {
    "health": "健康與健身",
    "math": "數學與數字",
    "converter": "單位換算",
    "datetime": "日期與時間",
    "text": "文字與程式碼",
    "color": "色彩與設計",
    "finance": "金融",
    "image": "圖片與檔案"
  },
  "ko": {
    "health": "건강 및 피트니스",
    "math": "수학 및 숫자",
    "converter": "단위 변환",
    "datetime": "날짜 및 시간",
    "text": "텍스트 및 코드",
    "color": "색상 및 디자인",
    "finance": "금융",
    "image": "이미지 및 파일"
  },
  "es": {
    "health": "Salud y ejercicio",
    "math": "Matemáticas y números",
    "converter": "Conversores de unidades",
    "datetime": "Fecha y hora",
    "text": "Texto y código",
    "color": "Color y diseño",
    "finance": "Finanzas",
    "image": "Imágenes y archivos"
  },
  "pt-BR": {
    "health": "Saúde e bem-estar",
    "math": "Matemática e números",
    "converter": "Conversores de unidades",
    "datetime": "Data e hora",
    "text": "Texto e código",
    "color": "Cores e design",
    "finance": "Finanças",
    "image": "Imagens e arquivos"
  },
  "fr": {
    "health": "Santé et forme",
    "math": "Maths et nombres",
    "converter": "Conversions d'unités",
    "datetime": "Date et heure",
    "text": "Texte et code",
    "color": "Couleurs et design",
    "finance": "Finance",
    "image": "Images et fichiers"
  },
  "de": {
    "health": "Gesundheit & Fitness",
    "math": "Mathematik & Zahlen",
    "converter": "Einheiten umrechnen",
    "datetime": "Datum & Uhrzeit",
    "text": "Text & Code",
    "color": "Farben & Design",
    "finance": "Finanzen",
    "image": "Bilder & Dateien"
  },
  "it": {
    "health": "Salute e fitness",
    "math": "Matematica e numeri",
    "converter": "Convertitori di unità",
    "datetime": "Data e ora",
    "text": "Testo e codice",
    "color": "Colori e design",
    "finance": "Finanza",
    "image": "Immagini e file"
  },
  "ru": {
    "health": "Здоровье и фитнес",
    "math": "Математика и числа",
    "converter": "Конвертеры единиц",
    "datetime": "Дата и время",
    "text": "Текст и код",
    "color": "Цвет и дизайн",
    "finance": "Финансы",
    "image": "Изображения и файлы"
  },
  "ar": {
    "health": "الصحة واللياقة",
    "math": "الرياضيات والأرقام",
    "converter": "تحويل الوحدات",
    "datetime": "التاريخ والوقت",
    "text": "النصوص والبرمجة",
    "color": "الألوان والتصميم",
    "finance": "المال والأعمال",
    "image": "الصور والملفات"
  },
  "hi": {
    "health": "स्वास्थ्य और फिटनेस",
    "math": "गणित और संख्याएँ",
    "converter": "इकाई परिवर्तक",
    "datetime": "तारीख और समय",
    "text": "पाठ और कोड",
    "color": "रंग और डिज़ाइन",
    "finance": "वित्त",
    "image": "चित्र और फ़ाइलें"
  },
  "id": {
    "health": "Kesehatan & kebugaran",
    "math": "Matematika & angka",
    "converter": "Konversi satuan",
    "datetime": "Tanggal & waktu",
    "text": "Teks & kode",
    "color": "Warna & desain",
    "finance": "Keuangan",
    "image": "Gambar & berkas"
  },
  "th": {
    "health": "สุขภาพและฟิตเนส",
    "math": "คณิตศาสตร์และตัวเลข",
    "converter": "ตัวแปลงหน่วย",
    "datetime": "วันที่และเวลา",
    "text": "ข้อความและโค้ด",
    "color": "สีและการออกแบบ",
    "finance": "การเงิน",
    "image": "รูปภาพและไฟล์"
  },
  "vi": {
    "health": "Sức khỏe và thể chất",
    "math": "Toán học và con số",
    "converter": "Chuyển đổi đơn vị",
    "datetime": "Ngày và giờ",
    "text": "Văn bản và mã",
    "color": "Màu sắc và thiết kế",
    "finance": "Tài chính",
    "image": "Hình ảnh và tệp"
  },
  "tr": {
    "health": "Sağlık ve fitness",
    "math": "Matematik ve sayılar",
    "converter": "Birim dönüştürücüler",
    "datetime": "Tarih ve saat",
    "text": "Metin ve kod",
    "color": "Renk ve tasarım",
    "finance": "Finans",
    "image": "Görsel ve dosyalar"
  }
} as const satisfies Record<Locale, Record<ToolCategory, string>>;

export function localizedCategoryLabel(category: ToolCategory, locale: string): string {
  return Object.prototype.hasOwnProperty.call(CATEGORY_LABELS, locale)
    ? CATEGORY_LABELS[locale as Locale][category]
    : CATEGORY_LABELS.en[category];
}
