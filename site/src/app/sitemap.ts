import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config";
import { LOCALES } from "@/lib/i18n/locales";
import { listTools } from "@/lib/tools/registry";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = ["", "/tools", "/about", "/privacy", "/terms", "/contact"];
  const tools = listTools();
  const entries: MetadataRoute.Sitemap = [];

  for (const path of staticPaths) {
    for (const locale of LOCALES) {
      const url = `${siteConfig.url}/${locale}${path}`;
      const alternates: Record<string, string> = {};
      for (const l of LOCALES) alternates[l] = `${siteConfig.url}/${l}${path}`;
      entries.push({
        url,
        changeFrequency: "weekly",
        priority: path === "" ? 1.0 : 0.6,
        alternates: { languages: alternates },
      });
    }
  }

  for (const tool of tools) {
    for (const locale of LOCALES) {
      const path = `/tools/${tool.slug}`;
      const alternates: Record<string, string> = {};
      for (const l of LOCALES) alternates[l] = `${siteConfig.url}/${l}${path}`;
      entries.push({
        url: `${siteConfig.url}/${locale}${path}`,
        lastModified: tool.updatedAt,
        changeFrequency: "monthly",
        priority: 0.8,
        alternates: { languages: alternates },
      });
    }
  }

  return entries;
}
