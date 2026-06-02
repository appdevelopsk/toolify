import createMiddleware from "next-intl/middleware";
import { routing } from "@/lib/i18n/routing";
import type { NextRequest } from "next/server";

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
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
