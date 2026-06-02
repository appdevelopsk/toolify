import "../../globals.css";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";

import { routing } from "@/lib/i18n/routing";
import { LOCALES, getDirection, type Locale } from "@/lib/i18n/locales";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

/**
 * Standalone shell for embeddable widgets — no header, footer, ads, or consent banner.
 * Lives outside the [locale] segment so it does not inherit the full-site chrome.
 */
export default async function EmbedLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as Locale)) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();
  const dir = getDirection(locale);

  return (
    <html lang={locale} dir={dir}>
      <body className="bg-transparent antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
