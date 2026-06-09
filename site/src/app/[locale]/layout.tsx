import "../globals.css";
import { Suspense, type ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { routing } from "@/lib/i18n/routing";
import { LOCALES, getDirection, type Locale } from "@/lib/i18n/locales";
import { siteConfig } from "@/lib/config";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ConsentBanner } from "@/components/ConsentBanner";
import { AdScript } from "@/components/ads/AdScript";
import { FundingChoices } from "@/components/cmp/FundingChoices";
import { GoogleAnalytics } from "@/lib/analytics/gtag";
import { PageViewTracker } from "@/lib/analytics/pageview";
import { RegisterSW } from "@/components/pwa/RegisterSW";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo/structured-data";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "site" });
  return {
    metadataBase: new URL(siteConfig.url),
    title: { default: t("name"), template: `%s · ${t("name")}` },
    description: t("description"),
    applicationName: t("name"),
    manifest: "/manifest.webmanifest",
    appleWebApp: { capable: true, statusBarStyle: "default", title: t("name") },
    icons: {
      icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
      apple: "/icon.svg",
    },
    verification: {
      google: "ty7Dbj63wSnnx02l4aFJ4rQP5cEkqF04WChcVLckmXI",
      ...(process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
        ? { other: { "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION } }
        : {}),
      ...(process.env.NEXT_PUBLIC_YANDEX_SITE_VERIFICATION
        ? { yandex: process.env.NEXT_PUBLIC_YANDEX_SITE_VERIFICATION }
        : {}),
    },
    other: {
      ...(siteConfig.adsense.client
        ? { "google-adsense-account": siteConfig.adsense.client }
        : {}),
    },
  };
}

export default async function LocaleLayout({
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
      <head>
        {siteConfig.adsense.client && (
          <>
            <link rel="preconnect" href="https://pagead2.googlesyndication.com" crossOrigin="anonymous" />
            <link rel="dns-prefetch" href="https://googleads.g.doubleclick.net" />
          </>
        )}
        {siteConfig.analytics.gaId && (
          <link rel="preconnect" href="https://www.googletagmanager.com" />
        )}
        <link rel="alternate" type="application/rss+xml" title={`${siteConfig.name} — Latest tools (EN)`} href={`${siteConfig.url}/feed.xml`} />
        <link rel="alternate" type="application/rss+xml" title={`${siteConfig.name} — 最新ツール (日本語)`} href={`${siteConfig.url}/feed-ja.xml`} />
        <link rel="alternate" type="application/json" title={`${siteConfig.name} — Tool directory`} href={`${siteConfig.url}/tools.json`} />
        <link rel="search" type="application/opensearchdescription+xml" title={siteConfig.name} href={`${siteConfig.url}/opensearch.xml`} />
        {siteConfig.adsense.client && (
          // eslint-disable-next-line @next/next/no-sync-scripts
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${siteConfig.adsense.client}`}
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body className="min-h-screen flex flex-col antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Header />
          <div className="flex-1">{children}</div>
          <Footer />
          <ConsentBanner />
        </NextIntlClientProvider>
        <GoogleAnalytics />
        <Suspense fallback={null}>
          <PageViewTracker />
        </Suspense>
        <FundingChoices />
        <AdScript />
        <RegisterSW />
        <JsonLd data={[organizationJsonLd(), websiteJsonLd(locale)]} />
      </body>
    </html>
  );
}
