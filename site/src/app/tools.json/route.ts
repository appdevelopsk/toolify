import { NextResponse } from "next/server";
import { siteConfig } from "@/lib/config";
import { LOCALES } from "@/lib/i18n/locales";
import { listTools } from "@/lib/tools/registry";

export const dynamic = "force-static";

// Machine-readable tool directory feed. Lets aggregators (Product Hunt,
// AlternativeTo, ToolFinder, Hacker News submissions) discover the catalog
// without scraping HTML. Stable endpoint at /tools.json.
export function GET() {
  const tools = listTools();
  const data = {
    version: 1,
    generatedAt: new Date().toISOString(),
    site: {
      name: siteConfig.name,
      url: siteConfig.url,
      contact: siteConfig.contactEmail,
    },
    locales: LOCALES,
    count: tools.length,
    tools: tools.map((t) => ({
      slug: t.slug,
      category: t.category,
      applicationCategory: t.applicationCategory,
      updatedAt: t.updatedAt,
      url: `${siteConfig.url}/en/tools/${t.slug}`,
      urls: Object.fromEntries(LOCALES.map((l) => [l, `${siteConfig.url}/${l}/tools/${t.slug}`])),
      primaryKeyword: t.primaryKeyword,
      related: t.related,
    })),
  };
  return NextResponse.json(data, {
    headers: {
      "cache-control": "public, max-age=3600, s-maxage=86400",
      "content-type": "application/json; charset=utf-8",
    },
  });
}
