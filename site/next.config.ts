import type { NextConfig } from "next";
import path from "node:path";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/lib/i18n/request.ts");

const config: NextConfig = {
  // VPS（PM2 + nginx reverse proxy）でのデプロイ用に standalone モードを指定。
  // .next/standalone/ に必要最小限のNode.jsサーバとファイルが出力される。
  output: "standalone",
  // 出力パスが Dropbox/web_advertisement/site/... と入れ子にならないよう、
  // tracing root を site/ ディレクトリ自身に固定する。
  outputFileTracingRoot: path.resolve(__dirname),
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
        ],
      },
      {
        // Everything except the embed widgets must not be framed by other sites.
        source: "/((?!embed).*)",
        headers: [{ key: "X-Frame-Options", value: "SAMEORIGIN" }],
      },
      {
        // Embeddable widgets are intentionally framable anywhere (drives backlinks).
        source: "/embed/:path*",
        headers: [{ key: "Content-Security-Policy", value: "frame-ancestors *" }],
      },
      {
        source: "/_next/static/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default withNextIntl(config);
