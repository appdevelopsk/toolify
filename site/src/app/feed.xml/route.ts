import { siteConfig } from "@/lib/config";
import { listTools } from "@/lib/tools/registry";

export const dynamic = "force-static";

// "What's new" feed. Aggregators (RSS readers, IFTTT, Zapier) and tool
// directories (BetaList, IndieHackers feeds) consume this to surface new tools.
export function GET() {
  const tools = listTools()
    .slice()
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
    .slice(0, 50);

  const items = tools
    .map((t) => {
      const url = `${siteConfig.url}/en/tools/${t.slug}`;
      const img = `${siteConfig.url}/api/og?slug=${encodeURIComponent(t.slug)}&locale=en`;
      const title = escape(t.primaryKeyword.en ?? t.slug);
      const date = new Date(t.updatedAt).toUTCString();
      return `    <item>
      <title>${title}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${date}</pubDate>
      <category>${escape(t.category)}</category>
      <description>${escape(`Free ${t.primaryKeyword.en ?? t.slug} — browser-based, no signup, multilingual.`)}</description>
      <enclosure url="${escape(img)}" type="image/png" length="0"/>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape(siteConfig.name)} — Latest tools</title>
    <link>${siteConfig.url}</link>
    <atom:link href="${siteConfig.url}/feed.xml" rel="self" type="application/rss+xml"/>
    <description>Free browser-based calculators and converters. Updated regularly.</description>
    <language>en</language>
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
