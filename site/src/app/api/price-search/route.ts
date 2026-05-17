import { NextRequest, NextResponse } from "next/server";

const APP_ID = process.env.RAKUTEN_APP_ID;
const ACCESS_KEY = process.env.RAKUTEN_ACCESS_KEY;
const AFFILIATE_ID = process.env.RAKUTEN_AFFILIATE_ID;
// 楽天APIのOrigin/Refererは登録済みApplication URLと一致する必要がある
// RAKUTEN_ORIGIN_URL: 楽天アプリ管理画面のApplication URLに合わせて設定
const SITE_URL = process.env.RAKUTEN_ORIGIN_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "https://toolify365.com";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q) return NextResponse.json({ error: "q is required" }, { status: 400 });
  if (!APP_ID || !ACCESS_KEY) return NextResponse.json({ error: "API not configured" }, { status: 503 });

  const params = new URLSearchParams({
    applicationId: APP_ID,
    accessKey: ACCESS_KEY,
    keyword: q,
    hits: "10",
    sort: "+itemPrice",
    format: "json",
    imageFlag: "1",
  });
  if (AFFILIATE_ID) params.set("affiliateId", AFFILIATE_ID);

  let data: Record<string, unknown>;
  try {
    const res = await fetch(
      `https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260401?${params}`,
      {
        signal: AbortSignal.timeout(8000),
        // 新APIはReferer/Originが必須
        headers: {
          Origin: SITE_URL,
          Referer: SITE_URL + "/",
        },
      },
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json({ error: "Rakuten API error", detail: err }, { status: 502 });
    }
    data = await res.json() as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Fetch failed" }, { status: 502 });
  }

  const raw = (data.Items as { Item: Record<string, unknown> }[]) ?? [];
  const items = raw.map((entry) => {
    const item = entry.Item;
    const images = item.mediumImageUrls as { imageUrl: string }[] | undefined;
    return {
      name: item.itemName,
      price: item.itemPrice,
      url: (item.affiliateUrl as string) || (item.itemUrl as string),
      image: images?.[0]?.imageUrl ?? null,
      shop: item.shopName,
      reviewCount: item.reviewCount ?? 0,
      reviewAverage: item.reviewAverage ?? 0,
    };
  });

  return NextResponse.json({ items }, {
    headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60" },
  });
}
