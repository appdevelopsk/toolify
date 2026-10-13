// Display currency per UI locale for money tools whose copy uses local-currency
// examples. Locales without an entry (en, es, ar, ko, th, zh-CN, zh-TW) fall back
// to USD because their examples are not uniform across tools; a tool whose copy
// uses another currency for those locales passes `overrides`.
export const LOCALE_CURRENCY: Record<string, string> = {
  ja: "JPY",
  de: "EUR",
  fr: "EUR",
  it: "EUR",
  hi: "INR",
  id: "IDR",
  "pt-BR": "BRL",
  ru: "RUB",
  tr: "TRY",
  vi: "VND",
};

// Currencies shown without decimals (Intl already does this for JPY/KRW/VND;
// IDR and TWD are listed because Intl would otherwise print two decimals).
const WHOLE_UNIT = new Set(["JPY", "KRW", "VND", "IDR", "TWD"]);

export function currencyForLocale(locale: string, overrides?: Record<string, string>): string {
  return overrides?.[locale] ?? LOCALE_CURRENCY[locale] ?? "USD";
}

export function currencyFormatter(locale: string, overrides?: Record<string, string>): Intl.NumberFormat {
  const currency = currencyForLocale(locale, overrides);
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: WHOLE_UNIT.has(currency) ? 0 : 2,
  });
}

/**
 * ツール別の上書き(2026-10-13)。
 * 各ツールの messages の例文が使っている通貨を実際に読んで決めた表で、
 * 一律の対応表ではない。例文が米ドルの言語は書かない(=米ドルのまま)。
 * "*" はそのツールの全言語(例文が全言語で米ドルのツール用)。
 */
export const TOOL_CURRENCY_OVERRIDES: Record<string, Record<string, string>> = {
  "loan-calculator": { ko: "KRW", th: "THB", "zh-CN": "CNY", "zh-TW": "TWD" },
  "savings-goal-calculator": { th: "THB" },
  "debt-payoff-calculator": { ar: "SAR", es: "EUR", ko: "KRW", th: "THB", "zh-CN": "CNY", "zh-TW": "TWD" },
  "unit-price-calculator": { ar: "SAR", es: "EUR", th: "THB" },
  "bill-split-calculator": { ko: "KRW", th: "THB", "zh-CN": "CNY", "zh-TW": "TWD" },
  "markup-calculator": { th: "THB", "zh-CN": "CNY", "zh-TW": "TWD" },
  // ja は言語の基本表で円(例文も円)。
  "tip-calculator": { ar: "SAR", ko: "KRW", th: "THB" },
  "sales-tax-calculator": { es: "EUR", th: "THB", "zh-CN": "CNY", "zh-TW": "TWD" },
  "discount-calculator": { ko: "KRW", th: "THB", "zh-CN": "CNY", "zh-TW": "TWD" },
  "compound-interest-calculator": { ko: "KRW", th: "THB", "zh-CN": "CNY", "zh-TW": "TWD" },
  "mortgage-calculator": { ko: "KRW", th: "THB" },
  // 米国の 28/36 ルールを説明する道具で、例文は全言語が米ドル。
  "house-affordability-calculator": { "*": "USD" },
  // zh は例文に金額が無い。zh-CN は人民元、zh-TW は新台湾ドル。ko は例文が米ドル。
  "investment-fee-impact-calculator": { th: "THB", "zh-CN": "CNY", "zh-TW": "TWD" },
  // hi は例文に金額が無いので従来の表示(米ドル)を保つ。ko/zh は例文が米ドル。
  "lease-vs-buy-calculator": { th: "THB", hi: "USD" },
  "mortgage-refinance-calculator": { th: "THB" },
  "fire-number-calculator": { ko: "KRW", th: "THB", "zh-CN": "CNY", "zh-TW": "TWD" },
};

/** ツールと言語から表示通貨を決める。上書き → 全言語指定 → 言語の基本表 → 米ドル。 */
export function toolCurrency(tool: string, locale: string): string {
  const o = TOOL_CURRENCY_OVERRIDES[tool];
  return o?.[locale] ?? o?.["*"] ?? LOCALE_CURRENCY[locale] ?? "USD";
}

/** 補助単位を使わない通貨か(小数を出さない)。 */
export function isWholeUnitCurrency(currency: string): boolean {
  return WHOLE_UNIT.has(currency);
}
