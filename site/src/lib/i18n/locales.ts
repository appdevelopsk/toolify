export type Locale = (typeof LOCALES)[number];

/**
 * 17言語フル定義。`active` を true にすると有効化される（段階展開のため）。
 * Phase 0 では en/ja のみ active、Phase 2 で全有効化する。
 */
export const LOCALE_DEFS = [
  { code: "en", name: "English", native: "English", dir: "ltr", active: true },
  { code: "ja", name: "Japanese", native: "日本語", dir: "ltr", active: true },
  { code: "zh-CN", name: "Chinese (Simplified)", native: "简体中文", dir: "ltr", active: true },
  { code: "zh-TW", name: "Chinese (Traditional)", native: "繁體中文", dir: "ltr", active: false },
  { code: "ko", name: "Korean", native: "한국어", dir: "ltr", active: true },
  { code: "es", name: "Spanish", native: "Español", dir: "ltr", active: true },
  { code: "pt-BR", name: "Portuguese (Brazil)", native: "Português", dir: "ltr", active: false },
  { code: "fr", name: "French", native: "Français", dir: "ltr", active: false },
  { code: "de", name: "German", native: "Deutsch", dir: "ltr", active: false },
  { code: "it", name: "Italian", native: "Italiano", dir: "ltr", active: false },
  { code: "ru", name: "Russian", native: "Русский", dir: "ltr", active: false },
  { code: "ar", name: "Arabic", native: "العربية", dir: "rtl", active: false },
  { code: "hi", name: "Hindi", native: "हिन्दी", dir: "ltr", active: false },
  { code: "id", name: "Indonesian", native: "Bahasa Indonesia", dir: "ltr", active: false },
  { code: "th", name: "Thai", native: "ไทย", dir: "ltr", active: false },
  { code: "vi", name: "Vietnamese", native: "Tiếng Việt", dir: "ltr", active: false },
  { code: "tr", name: "Turkish", native: "Türkçe", dir: "ltr", active: false },
] as const;

export const LOCALES = LOCALE_DEFS.filter((l) => l.active).map((l) => l.code);
export const ALL_LOCALES = LOCALE_DEFS.map((l) => l.code);
export const DEFAULT_LOCALE: Locale = "en";

export function getLocaleDef(code: string) {
  return LOCALE_DEFS.find((l) => l.code === code);
}

export function getDirection(code: string): "ltr" | "rtl" {
  return getLocaleDef(code)?.dir === "rtl" ? "rtl" : "ltr";
}
