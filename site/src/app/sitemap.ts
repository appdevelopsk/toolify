import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config";
import { LOCALES, PROMPT_LOCALES, isIndexedLocale } from "@/lib/i18n/locales";
import { listIndexableTools, listByCategory } from "@/lib/tools/registry";
import { CATEGORY_CONFIG } from "@/lib/tools/categories";
import { listPrompts } from "@/lib/prompts/registry";
import type { ToolCategory } from "@/lib/tools/types";

export default function sitemap(): MetadataRoute.Sitemap {
  const sharedPaths = ["", "/tools", "/pregnancy", "/about", "/privacy", "/terms", "/contact"];
  const tools = listIndexableTools(); // noindex ツールは sitemap から除外（robots noindex と整合）
  const prompts = listPrompts();
  const entries: MetadataRoute.Sitemap = [];
  // 検索インデックス対象ロケール（en/ja）のみ sitemap / hreflang に載せる（死蔵言語は除外）。
  const IDX = LOCALES.filter(isIndexedLocale);
  const IDX_PROMPT = PROMPT_LOCALES.filter(isIndexedLocale);

  for (const path of sharedPaths) {
    for (const locale of IDX) {
      const url = `${siteConfig.url}/${locale}${path}`;
      const alternates: Record<string, string> = {};
      for (const l of IDX) alternates[l] = `${siteConfig.url}/${l}${path}`;
      entries.push({
        url,
        changeFrequency: "weekly",
        priority: path === "" ? 1.0 : 0.6,
        alternates: { languages: alternates },
      });
    }
  }

  // /prompts index — only emit for prompt-active locales
  for (const locale of IDX_PROMPT) {
    const path = "/prompts";
    const alternates: Record<string, string> = {};
    for (const l of IDX_PROMPT) alternates[l] = `${siteConfig.url}/${l}${path}`;
    entries.push({
      url: `${siteConfig.url}/${locale}${path}`,
      changeFrequency: "weekly",
      priority: 0.6,
      alternates: { languages: alternates },
    });
  }

  for (const tool of tools) {
    for (const locale of IDX) {
      const path = `/tools/${tool.slug}`;
      const alternates: Record<string, string> = {};
      for (const l of IDX) alternates[l] = `${siteConfig.url}/${l}${path}`;
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
    for (const locale of IDX_PROMPT) {
      const path = `/prompts/${prompt.slug}`;
      const alternates: Record<string, string> = {};
      for (const l of IDX_PROMPT) alternates[l] = `${siteConfig.url}/${l}${path}`;
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
    for (const locale of IDX_PROMPT) {
      const path = `/prompts/category/${cat}`;
      const alternates: Record<string, string> = {};
      for (const l of IDX_PROMPT) alternates[l] = `${siteConfig.url}/${l}${path}`;
      entries.push({
        url: `${siteConfig.url}/${locale}${path}`,
        changeFrequency: "weekly",
        priority: 0.5,
        alternates: { languages: alternates },
      });
    }
  }

  // Tool category hubs — one per populated category, all locales (mirrors the page's
  // generateStaticParams). These concentrate internal-link authority on each category.
  const toolCats = (Object.keys(CATEGORY_CONFIG) as ToolCategory[]).filter(
    (c) => listByCategory(c).length > 0,
  );
  for (const cat of toolCats) {
    for (const locale of IDX) {
      const path = `/tools/category/${cat}`;
      const alternates: Record<string, string> = {};
      for (const l of IDX) alternates[l] = `${siteConfig.url}/${l}${path}`;
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
