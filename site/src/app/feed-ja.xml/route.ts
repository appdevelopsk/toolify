import { siteConfig } from "@/lib/config";
import { listTools } from "@/lib/tools/registry";

export const dynamic = "force-static";

export function GET() {
  const tools = listTools()
    .slice()
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
    .slice(0, 50);

  const items = tools
    .map((t) => {
      const url = `${siteConfig.url}/ja/tools/${t.slug}`;
      const img = `${siteConfig.url}/api/og?slug=${encodeURIComponent(t.slug)}&locale=ja`;
      const titleJa = t.primaryKeyword.ja ?? t.primaryKeyword.en ?? t.slug;
      const title = escape(titleJa);
      const date = new Date(t.updatedAt).toUTCString();
      return `    <item>
      <title>${title}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${date}</pubDate>
      <category>${escape(t.category)}</category>
      <description>${escape(`無料の${titleJa} — ブラウザで即使える、登録不要、多言語対応。`)}</description>
      <enclosure url="${img}" type="image/png" length="0"/>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape(siteConfig.name)} — 最新ツール</title>
    <link>${siteConfig.url}</link>
    <atom:link href="${siteConfig.url}/feed-ja.xml" rel="self" type="application/rss+xml"/>
    <description>無料のブラウザ計算ツール・変換ツール。随時更新中。</description>
    <language>ja</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "cache-control": "public, max-age=3600, s-maxage=86400",
      "content-type": "application/rss+xml; charset=utf-8",
      "x-robots-tag": "noindex",
    },
  });
}

function escape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
