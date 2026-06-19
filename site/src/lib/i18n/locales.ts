export type Locale = (typeof LOCALES)[number];

/**
 * 17言語フル定義。`active` を true にすると有効化される（段階展開のため）。
 * `promptsActive` はプロンプト機能（/prompts）の対象ロケール。
 * 言語の段階的活性化中、ツール翻訳と AI プロンプト翻訳の進度は別管理する。
 */
export const LOCALE_DEFS = [
  { code: "en", name: "English", native: "English", dir: "ltr", active: true, promptsActive: true },
  { code: "ja", name: "Japanese", native: "日本語", dir: "ltr", active: true, promptsActive: true },
  { code: "zh-CN", name: "Chinese (Simplified)", native: "简体中文", dir: "ltr", active: true, promptsActive: true },
  { code: "zh-TW", name: "Chinese (Traditional)", native: "繁體中文", dir: "ltr", active: true, promptsActive: true },
  { code: "ko", name: "Korean", native: "한국어", dir: "ltr", active: true, promptsActive: true },
  { code: "es", name: "Spanish", native: "Español", dir: "ltr", active: true, promptsActive: true },
  { code: "pt-BR", name: "Portuguese (Brazil)", native: "Português", dir: "ltr", active: true, promptsActive: true },
  { code: "fr", name: "French", native: "Français", dir: "ltr", active: true, promptsActive: true },
  { code: "de", name: "German", native: "Deutsch", dir: "ltr", active: true, promptsActive: true },
  { code: "it", name: "Italian", native: "Italiano", dir: "ltr", active: true, promptsActive: true },
  { code: "ru", name: "Russian", native: "Русский", dir: "ltr", active: true, promptsActive: true },
  { code: "ar", name: "Arabic", native: "العربية", dir: "rtl", active: true, promptsActive: true },
  { code: "hi", name: "Hindi", native: "हिन्दी", dir: "ltr", active: true, promptsActive: true },
  { code: "id", name: "Indonesian", native: "Bahasa Indonesia", dir: "ltr", active: true, promptsActive: true },
  { code: "th", name: "Thai", native: "ไทย", dir: "ltr", active: true, promptsActive: true },
  { code: "vi", name: "Vietnamese", native: "Tiếng Việt", dir: "ltr", active: true, promptsActive: true },
  { code: "tr", name: "Turkish", native: "Türkçe", dir: "ltr", active: true, promptsActive: true },
] as const;

export const LOCALES = LOCALE_DEFS.filter((l) => l.active).map((l) => l.code);
export const PROMPT_LOCALES = LOCALE_DEFS.filter((l) => l.promptsActive).map((l) => l.code);
export const ALL_LOCALES = LOCALE_DEFS.map((l) => l.code);
export const DEFAULT_LOCALE: Locale = "en";

/**
 * 検索インデックス対象ロケール（2026-06-19）。toolify は Search Console 28日で
 * 全17言語ともクリック0（検索が完全崩壊・量産薄コンテンツがHCU判定でディインデックス）。
 * 回復戦略（被リンク配布・埋め込み・カテゴリハブ）は全て英語狙いで、運営は日本。
 * → en + ja のみ index 対象とし、残り15言語（222ツール×15≒3,300の死蔵ページ）を
 *   noindex + sitemap除外してサイト全体のHCU評価を英語に集中させる。
 *   ページ自体/UI言語切替は不変＝可逆（本配列に戻すだけ）。
 */
export const INDEXED_LOCALES: Locale[] = ["en", "ja"];

export function isIndexedLocale(code: string): boolean {
  return (INDEXED_LOCALES as readonly string[]).includes(code);
}

export function getLocaleDef(code: string) {
  return LOCALE_DEFS.find((l) => l.code === code);
}

export function isPromptLocale(code: string): boolean {
  return (PROMPT_LOCALES as readonly string[]).includes(code);
}

export function getDirection(code: string): "ltr" | "rtl" {
  return getLocaleDef(code)?.dir === "rtl" ? "rtl" : "ltr";
}
