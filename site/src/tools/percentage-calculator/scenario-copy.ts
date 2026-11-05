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
