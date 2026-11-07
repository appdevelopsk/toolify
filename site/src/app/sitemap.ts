import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config";
import { LOCALES, isIndexedLocale } from "@/lib/i18n/locales";
import { listTools, listIndexableByCategory, indexableLocalesFor } from "@/lib/tools/registry";
import { CATEGORY_CONFIG } from "@/lib/tools/categories";
import type { ToolCategory } from "@/lib/tools/types";

/**
 * sitemap = index 対象ページだけ(robots noindex と完全に一致させる)。
 *
 * 2026-10-11: 索引対象を需要の実績があるページへ絞った(registry.ts CORE_TOOLS_BY_DEMAND)。
 *   - 載せる: トップ / ツール一覧 / 妊娠ハブ / カテゴリハブ(en・ja) と索引対象ツール
 *     (en・ja + INDEX_EXCEPTIONS のロケール別ページ)
 *   - 外す: about/privacy/terms/contact/disclosure と /prompts 一式(いずれも noindex)
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const sharedPaths = ["", "/tools", "/pregnancy"];
  const entries: MetadataRoute.Sitemap = [];
  const IDX = LOCALES.filter(isIndexedLocale);

  const cluster = (path: string, locales: readonly string[]) => {
    const alternates: Record<string, string> = {};
    for (const l of locales) alternates[l] = `${siteConfig.url}/${l}${path}`;
    if (alternates["en"]) alternates["x-default"] = alternates["en"];
    return alternates;
  };

  for (const path of sharedPaths) {
    const languages = cluster(path, IDX);
    for (const locale of IDX) {
      entries.push({
        url: `${siteConfig.url}/${locale}${path}`,
        changeFrequency: "weekly",
        priority: path === "" ? 1.0 : 0.6,
        alternates: { languages },
      });
    }
  }

  for (const tool of listTools()) {
    const locales = indexableLocalesFor(tool.slug);
    if (locales.length === 0) continue; // noindex ツールは sitemap から除外
    const path = `/tools/${tool.slug}`;
    const languages = cluster(path, locales);
    for (const locale of locales) {
      entries.push({
        url: `${siteConfig.url}/${locale}${path}`,
        lastModified: tool.updatedAt,
        changeFrequency: "monthly",
        priority: 0.8,
        alternates: { languages },
      });
    }
  }

  // Tool category hubs — index 対象ツールを含むカテゴリだけ(総数でなく件数で判定。
  // 総数だと中身が全部 noindex のカテゴリが実質空のハブとして載る)。
  const toolCats = (Object.keys(CATEGORY_CONFIG) as ToolCategory[]).filter(
    (c) => listIndexableByCategory(c).length > 0,
  );
  for (const cat of toolCats) {
    const path = `/tools/category/${cat}`;
    const languages = cluster(path, IDX);
    for (const locale of IDX) {
      entries.push({
        url: `${siteConfig.url}/${locale}${path}`,
        changeFrequency: "weekly",
        priority: 0.5,
        alternates: { languages },
      });
    }
  }

  return entries;
}
