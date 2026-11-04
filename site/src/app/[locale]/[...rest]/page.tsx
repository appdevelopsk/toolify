import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

// 存在しない /<locale>/… を [locale]/not-found.tsx(各言語・ヘッダー/フッター付き)で返すための受け皿。
// これが無いと一致しない URL は Next 既定の無装飾 404 になっていた(2026-11-04)
export default async function CatchAllNotFound({
  params,
}: {
  params: Promise<{ locale: string; rest: string[] }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  notFound();
}
