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
  { code: "pt-BR", name: "Portuguese (Brazil)", native: "Português", dir: "ltr", active: true, promptsActive: false },
  { code: "fr", name: "French", native: "Français", dir: "ltr", active: true, promptsActive: false },
  { code: "de", name: "German", native: "Deutsch", dir: "ltr", active: true, promptsActive: false },
  { code: "it", name: "Italian", native: "Italiano", dir: "ltr", active: true, promptsActive: false },
  { code: "ru", name: "Russian", native: "Русский", dir: "ltr", active: true, promptsActive: false },
  { code: "ar", name: "Arabic", native: "العربية", dir: "rtl", active: false, promptsActive: false },
  { code: "hi", name: "Hindi", native: "हिन्दी", dir: "ltr", active: true, promptsActive: false },
  { code: "id", name: "Indonesian", native: "Bahasa Indonesia", dir: "ltr", active: true, promptsActive: false },
  { code: "th", name: "Thai", native: "ไทย", dir: "ltr", active: false, promptsActive: false },
  { code: "vi", name: "Vietnamese", native: "Tiếng Việt", dir: "ltr", active: false, promptsActive: false },
  { code: "tr", name: "Turkish", native: "Türkçe", dir: "ltr", active: false, promptsActive: false },
] as const;

export const LOCALES = LOCALE_DEFS.filter((l) => l.active).map((l) => l.code);
export const PROMPT_LOCALES = LOCALE_DEFS.filter((l) => l.promptsActive).map((l) => l.code);
export const ALL_LOCALES = LOCALE_DEFS.map((l) => l.code);
export const DEFAULT_LOCALE: Locale = "en";

export function getLocaleDef(code: string) {
  return LOCALE_DEFS.find((l) => l.code === code);
}

export function isPromptLocale(code: string): boolean {
  return (PROMPT_LOCALES as readonly string[]).includes(code);
}

export function getDirection(code: string): "ltr" | "rtl" {
  return getLocaleDef(code)?.dir === "rtl" ? "rtl" : "ltr";
}
