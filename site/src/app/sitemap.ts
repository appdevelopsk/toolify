import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config";
import { LOCALES, PROMPT_LOCALES } from "@/lib/i18n/locales";
import { listTools } from "@/lib/tools/registry";
import { listPrompts } from "@/lib/prompts/registry";

export default function sitemap(): MetadataRoute.Sitemap {
  const sharedPaths = ["", "/tools", "/about", "/privacy", "/terms", "/contact"];
  const tools = listTools();
  const prompts = listPrompts();
  const entries: MetadataRoute.Sitemap = [];

  for (const path of sharedPaths) {
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

  // /prompts index — only emit for prompt-active locales
  for (const locale of PROMPT_LOCALES) {
    const path = "/prompts";
    const alternates: Record<string, string> = {};
    for (const l of PROMPT_LOCALES) alternates[l] = `${siteConfig.url}/${l}${path}`;
    entries.push({
      url: `${siteConfig.url}/${locale}${path}`,
      changeFrequency: "weekly",
      priority: 0.6,
      alternates: { languages: alternates },
    });
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

  for (const prompt of prompts) {
    for (const locale of PROMPT_LOCALES) {
      const path = `/prompts/${prompt.slug}`;
      const alternates: Record<string, string> = {};
      for (const l of PROMPT_LOCALES) alternates[l] = `${siteConfig.url}/${l}${path}`;
      entries.push({
        url: `${siteConfig.url}/${locale}${path}`,
        lastModified: prompt.updatedAt,
        changeFrequency: "monthly",
        priority: 0.7,
        alternates: { languages: alternates },
      });
    }
  }

  // Prompt category pages — only emit for categories that actually have entries
  // so we don't ship empty pages to Google.
  const populatedCats = new Set(prompts.map((p) => p.category));
  for (const cat of populatedCats) {
    for (const locale of PROMPT_LOCALES) {
      const path = `/prompts/category/${cat}`;
      const alternates: Record<string, string> = {};
      for (const l of PROMPT_LOCALES) alternates[l] = `${siteConfig.url}/${l}${path}`;
      entries.push({
        url: `${siteConfig.url}/${locale}${path}`,
        changeFrequency: "weekly",
        priority: 0.5,
        alternates: { languages: alternates },
      });
    }
  }

  return entries;
}
