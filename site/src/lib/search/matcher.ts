import type { ToolCategory } from "@/lib/tools/types";

/**
 * クライアント検索の共通マッチャ。ヘッダー検索と /tools ページ検索の両方が使う。
 *
 * 対象: ローカライズ済みタイトル / slug / 主キーワード / カテゴリ語(id・英語ラベル・
 * メッセージで与える翻訳語)。大小無視、前方一致を部分一致より優先する。
 */
export type SearchItem = {
  slug: string;
  category: ToolCategory;
  title: string;
  /** ToolMeta.primaryKeyword[locale] */
  keyword?: string;
  description?: string;
};

export type CategoryKeywords = Partial<Record<ToolCategory, string>>;

const CATEGORY_BASE: Record<ToolCategory, string> = {
  health: "health fitness body",
  math: "math calculator numbers",
  converter: "converter unit conversion",
  datetime: "date time calendar",
  text: "text string",
  color: "color colour palette",
  finance: "finance money loan",
  image: "image photo picture",
};

export function normalize(s: string): string {
  return s.normalize("NFKC").toLowerCase().trim();
}

function score(item: SearchItem, q: string, catWords: string): number {
  const title = normalize(item.title);
  const slug = item.slug.toLowerCase();
  const slugWords = slug.replace(/-/g, " ");
  if (title === q || slug === q) return 100;
  if (title.startsWith(q) || slug.startsWith(q)) return 90;
  if (title.split(/\s+/).some((w) => w.startsWith(q)) || slugWords.split(" ").some((w) => w.startsWith(q))) return 80;
  if (title.includes(q) || slugWords.includes(q)) return 70;
  const kw = item.keyword ? normalize(item.keyword) : "";
  if (kw && (kw.startsWith(q) || kw.includes(q))) return 60;
  if (catWords.split(/\s+/).some((w) => w.startsWith(q))) return 40;
  if (item.description && normalize(item.description).includes(q)) return 30;
  return 0;
}

export function searchTools(
  items: readonly SearchItem[],
  query: string,
  opts: { limit?: number; categoryKeywords?: CategoryKeywords } = {},
): SearchItem[] {
  const q = normalize(query);
  if (!q) return [];
  const limit = opts.limit ?? 10;
  const catCache = new Map<ToolCategory, string>();
  const scored: { item: SearchItem; s: number }[] = [];
  for (const item of items) {
    let cw = catCache.get(item.category);
    if (cw === undefined) {
      cw = normalize(`${item.category} ${CATEGORY_BASE[item.category] ?? ""} ${opts.categoryKeywords?.[item.category] ?? ""}`);
      catCache.set(item.category, cw);
    }
    const s = score(item, q, cw);
    if (s > 0) scored.push({ item, s });
  }
  scored.sort((a, b) => b.s - a.s || a.item.title.localeCompare(b.item.title));
  return scored.slice(0, limit).map((x) => x.item);
}
