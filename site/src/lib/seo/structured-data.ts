import { siteConfig } from "@/lib/config";

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.organization,
    url: siteConfig.url,
    logo: `${siteConfig.url}/logo.png`,
    // E-E-A-T: 実在運営者（個人事業主）を founder として明示。sameAs は
    // 本人提供の実在プロフィールのみ。捏造した社会的証明は出さない。
    foundingDate: "2026",
    founder: {
      "@type": "Person",
      name: siteConfig.operator.name,
      url: siteConfig.operator.url,
      sameAs: [siteConfig.operator.url],
    },
    sameAs: [siteConfig.operator.url],
    contactPoint: {
      "@type": "ContactPoint",
      email: siteConfig.contactEmail,
      contactType: "customer support",
    },
  };
}

export function websiteJsonLd(locale: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: `${siteConfig.url}/${locale}`,
    inLanguage: locale,
  };
}

export function softwareAppJsonLd(params: {
  name: string;
  description: string;
  url: string;
  applicationCategory: string;
  inLanguage: string;
  /** Last-reviewed/updated date (ISO), from the tool's real updatedAt. */
  dateModified?: string;
  /** Authoritative source URLs (E-E-A-T). Emitted as schema.org citation. */
  citations?: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: params.name,
    description: params.description,
    url: params.url,
    applicationCategory: params.applicationCategory,
    operatingSystem: "Any (Web Browser)",
    inLanguage: params.inLanguage,
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    // E-E-A-T: real publisher entity + last-modified date. No fabricated
    // author or aggregateRating (those would be fake signals).
    publisher: {
      "@type": "Organization",
      name: siteConfig.organization,
      url: siteConfig.url,
    },
    ...(params.dateModified ? { dateModified: params.dateModified } : {}),
    ...(params.citations && params.citations.length
      ? { citation: params.citations }
      : {}),
  };
}

export function howToJsonLd(params: { name: string; steps: { name: string; text: string }[]; inLanguage: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: params.name,
    inLanguage: params.inLanguage,
    step: params.steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
  };
}

export function faqJsonLd(items: { q: string; a: string }[], inLanguage: string) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage,
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: it.a },
    })),
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}
