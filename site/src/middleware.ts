import createMiddleware from "next-intl/middleware";
import { routing } from "@/lib/i18n/routing";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const intlMiddleware = createMiddleware(routing);

/** タイミング攻撃を避けるため長さに依らず全文字を比較する。 */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/**
 * /admin/* の Basic 認証。ロケール処理(next-intl)の外に置く。
 * 認証情報が未設定なら閉じる(403)= 設定漏れが全公開にならない。
 */
function adminGate(request: NextRequest): Response {
  const noStore = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" };
  const user = process.env.ADMIN_BASIC_USER;
  const pass = process.env.ADMIN_BASIC_PASS;
  if (!user || !pass) {
    return new Response("管理画面の認証情報(ADMIN_BASIC_USER / ADMIN_BASIC_PASS)が未設定です。", {
      status: 403,
      headers: { ...noStore, "Content-Type": "text/plain; charset=utf-8" },
    });
  }
  const challenge = {
    ...noStore,
    "Content-Type": "text/plain; charset=utf-8",
    "WWW-Authenticate": 'Basic realm="Toolify Admin", charset="UTF-8"',
  };
  const header = request.headers.get("authorization") ?? "";
  if (!header.startsWith("Basic ")) return new Response("認証が必要です。", { status: 401, headers: challenge });
  let decoded = "";
  try {
    decoded = atob(header.slice(6));
  } catch {
    return new Response("認証ヘッダを解釈できません。", { status: 400, headers: noStore });
  }
  const sep = decoded.indexOf(":");
  const gotUser = sep < 0 ? decoded : decoded.slice(0, sep);
  const gotPass = sep < 0 ? "" : decoded.slice(sep + 1);
  if (!safeEqual(gotUser, user) || !safeEqual(gotPass, pass)) {
    return new Response("ユーザー名またはパスワードが違います。", { status: 401, headers: challenge });
  }
  const res = NextResponse.next();
  res.headers.set("Cache-Control", "no-store");
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  return res;
}

export default function middleware(request: NextRequest) {
  const p = request.nextUrl.pathname;
  if (p === "/admin" || p.startsWith("/admin/")) return adminGate(request);

  const response = intlMiddleware(request);
  // next-intl defaults to 307; upgrade to 301 for GET so Googlebot passes PageRank
  if (response.status === 307 && request.method === "GET") {
    return new Response(null, { status: 301, headers: response.headers });
  }
  return response;
}

export const config = {
  matcher: ["/((?!api|embed|_next|_vercel|.*\\..*).*)"],
};
