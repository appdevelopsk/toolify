import { siteConfig } from "@/lib/config";

/** Curated, useful tools for third-party publishers (all existing routes). */
export const FEATURED_EMBED_SLUGS = [
  "workdays-calculator",
  "date-calculator",
  "percentage-calculator",
  "timezone-converter",
] as const;

export function escapeEmbedAttribute(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;")
    .replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/'/g, "&#39;");
}

/** Generates publisher-owned HTML, never inserts user values or tracking IDs. */
export function buildPublisherEmbedSnippet(slug: string, title: string, locale: string): string {
  if (!FEATURED_EMBED_SLUGS.some((value) => value === slug) || !["en", "ja"].includes(locale)) {
    throw new Error("Unsupported embedded tool or locale");
  }
  const origin = siteConfig.url;
  const toolUrl = `${origin}/${locale}/tools/${slug}`;
  const widgetUrl = `${origin}/embed/${locale}/${slug}`;
  const safeTitle = escapeEmbedAttribute(title);
  return `<iframe src="${widgetUrl}" title="${safeTitle}" width="100%" height="520" loading="lazy" style="border:1px solid #e2e8f0;border-radius:12px"></iframe>\n<p>Free <a href="${toolUrl}" target="_blank" rel="noopener noreferrer">${safeTitle}</a> by Toolify365.</p>`;
}
