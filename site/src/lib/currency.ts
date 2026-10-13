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
// IDR is listed because Intl would otherwise print two decimals).
const WHOLE_UNIT = new Set(["JPY", "KRW", "VND", "IDR"]);

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
