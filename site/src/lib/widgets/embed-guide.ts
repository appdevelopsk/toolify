import { siteConfig } from "@/lib/config";
import { LOCALES } from "@/lib/i18n/locales";

/** Curated, useful tools for third-party publishers (all existing routes). */
export const FEATURED_EMBED_SLUGS = [
  "workdays-calculator",
  "date-calculator",
  "percentage-calculator",
  "timezone-converter",
] as const;

/** Keep publisher discovery scoped to the four supported guide examples. */
export function isFeaturedPublisherTool(slug: string): boolean {
  return FEATURED_EMBED_SLUGS.some((value) => value === slug);
}

/** A voluntary click from a widget, not an impression or proof of placement.
 * Fixed campaign labels only: no host, user identifier, or calculator input.
 */
export function buildWidgetPublisherGuideHref(locale: string, slug: string): string | null {
  if (!isFeaturedPublisherTool(slug) || !(LOCALES as readonly string[]).includes(locale)) return null;
  const query = new URLSearchParams({
    utm_source: "toolify_widget",
    utm_medium: "referral",
    utm_campaign: "publisher_discovery",
  });
  return `/${locale}/embed-guide?${query.toString()}`;
}

export function escapeEmbedAttribute(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;")
    .replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/'/g, "&#39;");
}

/** Generates publisher-owned HTML, never inserts user values or tracking IDs. */
export function buildPublisherEmbedSnippet(slug: string, title: string, locale: string): string {
  if (!isFeaturedPublisherTool(slug) || !(LOCALES as readonly string[]).includes(locale)) {
    throw new Error("Unsupported embedded tool or locale");
  }
  const origin = siteConfig.url;
  const toolUrl = `${origin}/${locale}/tools/${slug}`;
  const widgetUrl = `${origin}/embed/${locale}/${slug}`;
  const safeTitle = escapeEmbedAttribute(title);
  return `<iframe src="${widgetUrl}" title="${safeTitle}" width="100%" height="520" loading="lazy" style="border:1px solid #e2e8f0;border-radius:12px"></iframe>\n<p><a href="${toolUrl}" target="_blank" rel="nofollow noopener noreferrer">${safeTitle}</a> by Toolify365.</p>`;
}
