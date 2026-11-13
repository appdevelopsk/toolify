import type { Locale } from "@/lib/i18n/locales";

/** Recovery text when the lazy-loaded catalog is offline or malformed. */
export const SEARCH_RECOVERY_COPY = {
  "en": {
    "message": "Search is temporarily unavailable. Check your connection and try again.",
    "retry": "Try again"
  },
  "ja": {
    "message": "検索を読み込めませんでした。通信状態を確認して再試行してください。",
    "retry": "再試行"
  },
  "zh-CN": {
    "message": "暂时无法加载搜索。请检查网络连接后重试。",
    "retry": "重试"
  },
  "zh-TW": {
    "message": "暫時無法載入搜尋。請檢查網路連線後重試。",
    "retry": "重試"
  },
  "ko": {
    "message": "검색을 불러올 수 없습니다. 인터넷 연결을 확인하고 다시 시도하세요.",
    "retry": "다시 시도"
  },
  "es": {
    "message": "La búsqueda no está disponible. Revisa tu conexión e inténtalo de nuevo.",
    "retry": "Reintentar"
  },
  "pt-BR": {
    "message": "A busca está indisponível. Confira sua conexão e tente novamente.",
    "retry": "Tentar novamente"
  },
  "fr": {
    "message": "La recherche est indisponible. Vérifiez votre connexion et réessayez.",
    "retry": "Réessayer"
  },
  "de": {
    "message": "Die Suche ist momentan nicht verfügbar. Prüfe deine Verbindung und versuche es erneut.",
    "retry": "Erneut versuchen"
  },
  "it": {
    "message": "La ricerca non è disponibile. Controlla la connessione e riprova.",
    "retry": "Riprova"
  },
  "ru": {
    "message": "Поиск временно недоступен. Проверьте подключение и повторите попытку.",
    "retry": "Повторить"
  },
  "ar": {
    "message": "البحث غير متاح مؤقتًا. تحقق من اتصالك وحاول مجددًا.",
    "retry": "إعادة المحاولة"
  },
  "hi": {
    "message": "खोज अभी उपलब्ध नहीं है। अपना कनेक्शन जाँचें और दोबारा कोशिश करें।",
    "retry": "फिर कोशिश करें"
  },
  "id": {
    "message": "Pencarian sementara tidak tersedia. Periksa koneksi lalu coba lagi.",
    "retry": "Coba lagi"
  },
  "th": {
    "message": "การค้นหาไม่พร้อมใช้งานชั่วคราว โปรดตรวจสอบการเชื่อมต่อแล้วลองอีกครั้ง",
    "retry": "ลองอีกครั้ง"
  },
  "vi": {
    "message": "Tìm kiếm tạm thời không khả dụng. Kiểm tra kết nối rồi thử lại.",
    "retry": "Thử lại"
  },
  "tr": {
    "message": "Arama şu anda kullanılamıyor. Bağlantınızı kontrol edip yeniden deneyin.",
    "retry": "Yeniden dene"
  }
} as const satisfies Record<Locale, { message: string; retry: string }>;

export function searchRecoveryCopyFor(locale: string): { message: string; retry: string } {
  return Object.prototype.hasOwnProperty.call(SEARCH_RECOVERY_COPY, locale)
    ? SEARCH_RECOVERY_COPY[locale as Locale]
    : SEARCH_RECOVERY_COPY.en;
}
