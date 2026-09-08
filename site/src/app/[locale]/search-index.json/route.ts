import { NextResponse } from "next/server";
import { LOCALES } from "@/lib/i18n/locales";
import { loadMessages } from "@/lib/i18n/loader";
import { listTools } from "@/lib/tools/registry";

export const dynamic = "force-static";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

/**
 * ロケール別のクライアント検索インデックス(/{locale}/search-index.json)。
 *
 * ヘッダー検索とトップページの「お気に入り / 最近使ったツール」が使う。
 * レイアウトはクライアントへ common メッセージしか渡さないため、ローカライズ済み
 * タイトルはこの静的 JSON から遅延取得する(初回フォーカス時に1回だけ)。
 * middleware の matcher は `.` を含むパスを除外しているので、ロケール判定に
 * 巻き込まれず素通りする。
 */
export async function GET(_req: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!(LOCALES as readonly string[]).includes(locale)) {
    return NextResponse.json({ error: "unknown locale" }, { status: 404 });
  }
  const messages = await loadMessages(locale);
  const toolMsgs = (messages.tools ?? {}) as Record<string, { title?: string; shortDescription?: string }>;
  const tools = listTools().map((t) => ({
    slug: t.slug,
    category: t.category,
    title: toolMsgs[t.slug]?.title ?? t.primaryKeyword[locale] ?? t.primaryKeyword.en ?? t.slug,
    keyword: t.primaryKeyword[locale] ?? t.primaryKeyword.en,
    description: toolMsgs[t.slug]?.shortDescription ?? "",
  }));
  return NextResponse.json(
    { version: 1, locale, count: tools.length, tools },
    { headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" } },
  );
}
