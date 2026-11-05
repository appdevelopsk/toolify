/** Compact A/B controls for all active locales. */
const COPY = {
  en: ["Compare scenarios", "Save current as A", "Restore A", "Clear A", "Difference (B − A)"],
  ja: ["条件を比較", "現在の条件をAに保存", "Aに戻す", "比較を解除", "差分 (B − A)"],
  "zh-CN": ["比较方案", "将当前方案保存为A", "恢复A", "清除A", "差值 (B − A)"],
  "zh-TW": ["比較方案", "將目前方案儲存為A", "還原A", "清除A", "差值 (B − A)"],
  ko: ["조건 비교", "현재 조건을 A로 저장", "A 복원", "A 지우기", "차이 (B − A)"],
  es: ["Comparar escenarios", "Guardar como A", "Restaurar A", "Borrar A", "Diferencia (B − A)"],
  "pt-BR": ["Comparar cenários", "Salvar como A", "Restaurar A", "Limpar A", "Diferença (B − A)"],
  fr: ["Comparer les scénarios", "Enregistrer comme A", "Restaurer A", "Effacer A", "Différence (B − A)"],
  de: ["Szenarien vergleichen", "Als A speichern", "A wiederherstellen", "A löschen", "Differenz (B − A)"],
  it: ["Confronta scenari", "Salva come A", "Ripristina A", "Cancella A", "Differenza (B − A)"],
  ru: ["Сравнить сценарии", "Сохранить как A", "Восстановить A", "Очистить A", "Разница (B − A)"],
  ar: ["مقارنة السيناريوهات", "حفظ الحالي كـ A", "استعادة A", "مسح A", "الفرق (B − A)"],
  hi: ["परिदृश्यों की तुलना करें", "वर्तमान को A के रूप में सहेजें", "A पुनर्स्थापित करें", "A हटाएँ", "अंतर (B − A)"],
  id: ["Bandingkan skenario", "Simpan sebagai A", "Pulihkan A", "Hapus A", "Selisih (B − A)"],
  th: ["เปรียบเทียบเงื่อนไข", "บันทึกเป็น A", "คืนค่า A", "ล้าง A", "ผลต่าง (B − A)"],
  vi: ["So sánh kịch bản", "Lưu hiện tại làm A", "Khôi phục A", "Xóa A", "Chênh lệch (B − A)"],
  tr: ["Senaryoları karşılaştır", "A olarak kaydet", "A'yı geri yükle", "A'yı temizle", "Fark (B − A)"],
} as const;

export function scenarioCopy(locale: string) {
  const labels = COPY[locale as keyof typeof COPY] ?? COPY.en;
  return { heading: labels[0], save: labels[1], restore: labels[2], clear: labels[3], difference: labels[4] };
}

const RESUME_COPY: Record<string, readonly [string, string, string, string]> = {
  en: ["Save for later", "Resume saved", "Delete saved", "Saved on this device for up to 7 days"],
  ja: ["後で再開するため保存", "保存した条件を再開", "保存内容を削除", "この端末に最大7日間保存します"],
  "zh-CN": ["保存以便稍后继续", "恢复已保存内容", "删除保存内容", "在本设备最多保存7天"],
  "zh-TW": ["儲存以便稍後繼續", "還原已儲存內容", "刪除儲存內容", "在此裝置最多儲存7天"],
  ko: ["나중에 계속하기 위해 저장", "저장한 내용 복원", "저장 내용 삭제", "이 기기에 최대 7일 저장"],
  es: ["Guardar para después", "Recuperar guardado", "Eliminar guardado", "Se guarda en este dispositivo hasta 7 días"],
  "pt-BR": ["Salvar para depois", "Retomar salvo", "Excluir salvo", "Armazenado neste dispositivo por até 7 dias"],
  fr: ["Enregistrer pour plus tard", "Reprendre la sauvegarde", "Supprimer la sauvegarde", "Enregistré sur cet appareil pendant 7 jours maximum"],
  de: ["Für später speichern", "Gespeichertes fortsetzen", "Gespeichertes löschen", "Bis zu 7 Tage auf diesem Gerät gespeichert"],
  it: ["Salva per dopo", "Riprendi il salvataggio", "Elimina il salvataggio", "Salvato su questo dispositivo per massimo 7 giorni"],
  ru: ["Сохранить на потом", "Восстановить сохранённое", "Удалить сохранённое", "Хранится на этом устройстве до 7 дней"],
  ar: ["حفظ لوقت لاحق", "استعادة المحفوظ", "حذف المحفوظ", "يُحفظ على هذا الجهاز لمدة تصل إلى 7 أيام"],
  hi: ["बाद के लिए सहेजें", "सहेजा हुआ पुनः खोलें", "सहेजा हुआ हटाएँ", "इस डिवाइस पर अधिकतम 7 दिनों तक सहेजा जाता है"],
  id: ["Simpan untuk nanti", "Lanjutkan tersimpan", "Hapus tersimpan", "Disimpan di perangkat ini hingga 7 hari"],
  th: ["บันทึกไว้ใช้ภายหลัง", "กลับไปยังที่บันทึก", "ลบข้อมูลที่บันทึก", "บันทึกในอุปกรณ์นี้สูงสุด 7 วัน"],
  vi: ["Lưu để dùng sau", "Tiếp tục bản lưu", "Xóa bản lưu", "Lưu trên thiết bị này tối đa 7 ngày"],
  tr: ["Sonrası için kaydet", "Kaydı sürdür", "Kaydı sil", "Bu cihazda en fazla 7 gün saklanır"],
};

export function resumeCopy(locale: string) {
  const labels = RESUME_COPY[locale] ?? RESUME_COPY.en;
  return { save: labels[0], restore: labels[1], clear: labels[2], disclosure: labels[3] };
}
