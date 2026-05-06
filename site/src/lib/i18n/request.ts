import { getRequestConfig } from "next-intl/server";
import type { AbstractIntlMessages } from "next-intl";
import { routing } from "./routing";
import { LOCALES, type Locale } from "./locales";
import { loadMessages } from "./loader";

function isSupportedLocale(value: string | undefined): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale: Locale = isSupportedLocale(requested) ? requested : routing.defaultLocale;
  const messages = (await loadMessages(locale)) as AbstractIntlMessages;
  return { locale, messages };
});
