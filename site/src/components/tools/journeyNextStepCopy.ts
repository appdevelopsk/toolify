import type { Locale } from "@/lib/i18n/locales";

/** Text beside post-tool journey suggestions; user inputs never leave the current tool. */
export type JourneyNextStepCopy = {
  ariaLabel: string;
  progressLabel: string;
  nextToolLabel: string;
  privacyNote: string;
};

export const JOURNEY_NEXT_STEP_COPY = {
  "en": {
    "ariaLabel": "Next step",
    "progressLabel": "Continue this workflow",
    "nextToolLabel": "Next tool: ",
    "privacyNote": "Your inputs are not carried over to the next tool."
  },
  "ja": {
    "ariaLabel": "次の作業",
    "progressLabel": "次のステップ",
    "nextToolLabel": "次に使う：",
    "privacyNote": "入力したデータは次のツールへ引き継がれません。"
  },
  "zh-CN": {
    "ariaLabel": "下一步",
    "progressLabel": "继续此流程",
    "nextToolLabel": "下一个工具：",
    "privacyNote": "输入内容不会传递到下一个工具。"
  },
  "zh-TW": {
    "ariaLabel": "下一步",
    "progressLabel": "繼續此流程",
    "nextToolLabel": "下一個工具：",
    "privacyNote": "輸入內容不會傳送至下一個工具。"
  },
  "ko": {
    "ariaLabel": "다음 단계",
    "progressLabel": "이 작업 계속하기",
    "nextToolLabel": "다음 도구: ",
    "privacyNote": "입력 내용은 다음 도구로 전달되지 않습니다."
  },
  "es": {
    "ariaLabel": "Siguiente paso",
    "progressLabel": "Continúa esta tarea",
    "nextToolLabel": "Siguiente herramienta: ",
    "privacyNote": "Tus datos no se transfieren a la siguiente herramienta."
  },
  "pt-BR": {
    "ariaLabel": "Próxima etapa",
    "progressLabel": "Continue esta tarefa",
    "nextToolLabel": "Próxima ferramenta: ",
    "privacyNote": "Seus dados não são transferidos para a próxima ferramenta."
  },
  "fr": {
    "ariaLabel": "Étape suivante",
    "progressLabel": "Poursuivre ce parcours",
    "nextToolLabel": "Outil suivant : ",
    "privacyNote": "Vos données ne sont pas transférées à l'outil suivant."
  },
  "de": {
    "ariaLabel": "Nächster Schritt",
    "progressLabel": "Diesen Ablauf fortsetzen",
    "nextToolLabel": "Nächstes Tool: ",
    "privacyNote": "Deine Eingaben werden nicht an das nächste Tool übertragen."
  },
  "it": {
    "ariaLabel": "Passaggio successivo",
    "progressLabel": "Continua questa attività",
    "nextToolLabel": "Strumento successivo: ",
    "privacyNote": "I dati inseriti non vengono trasferiti allo strumento successivo."
  },
  "ru": {
    "ariaLabel": "Следующий шаг",
    "progressLabel": "Продолжить работу",
    "nextToolLabel": "Следующий инструмент: ",
    "privacyNote": "Введённые данные не передаются следующему инструменту."
  },
  "ar": {
    "ariaLabel": "الخطوة التالية",
    "progressLabel": "تابع هذه المهمة",
    "nextToolLabel": "الأداة التالية: ",
    "privacyNote": "لا تُنقل بياناتك المدخلة إلى الأداة التالية."
  },
  "hi": {
    "ariaLabel": "अगला चरण",
    "progressLabel": "यह क्रम जारी रखें",
    "nextToolLabel": "अगला टूल: ",
    "privacyNote": "आपके इनपुट अगले टूल में नहीं भेजे जाते।"
  },
  "id": {
    "ariaLabel": "Langkah berikutnya",
    "progressLabel": "Lanjutkan alur ini",
    "nextToolLabel": "Alat berikutnya: ",
    "privacyNote": "Input Anda tidak diteruskan ke alat berikutnya."
  },
  "th": {
    "ariaLabel": "ขั้นตอนถัดไป",
    "progressLabel": "ทำขั้นตอนนี้ต่อ",
    "nextToolLabel": "เครื่องมือถัดไป: ",
    "privacyNote": "ข้อมูลที่กรอกจะไม่ถูกส่งต่อไปยังเครื่องมือถัดไป"
  },
  "vi": {
    "ariaLabel": "Bước tiếp theo",
    "progressLabel": "Tiếp tục quy trình này",
    "nextToolLabel": "Công cụ tiếp theo: ",
    "privacyNote": "Dữ liệu nhập không được chuyển sang công cụ tiếp theo."
  },
  "tr": {
    "ariaLabel": "Sonraki adım",
    "progressLabel": "Bu işleme devam edin",
    "nextToolLabel": "Sonraki araç: ",
    "privacyNote": "Girdileriniz sonraki araca aktarılmaz."
  }
} as const satisfies Record<Locale, JourneyNextStepCopy>;

export function journeyNextStepCopyFor(locale: string): JourneyNextStepCopy {
  return Object.prototype.hasOwnProperty.call(JOURNEY_NEXT_STEP_COPY, locale)
    ? JOURNEY_NEXT_STEP_COPY[locale as Locale]
    : JOURNEY_NEXT_STEP_COPY.en;
}
