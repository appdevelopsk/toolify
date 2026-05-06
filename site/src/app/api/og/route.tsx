import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

const SIZE = { width: 1200, height: 630 };

/**
 * /api/og?title=...&subtitle=...&locale=...
 *
 * Edge-runtime で動的にOG画像を生成。
 * 各ツールページの buildMetadata から呼び出される（既定動作）。
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = (searchParams.get("title") ?? "Toolify").slice(0, 80);
  const subtitle = (searchParams.get("subtitle") ?? "Free, fast, ad-supported online tools").slice(0, 140);
  const locale = searchParams.get("locale") ?? "en";
  const isCjk = locale === "ja" || locale.startsWith("zh") || locale === "ko" || locale === "th";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          backgroundImage: "linear-gradient(135deg, #0c4a6e 0%, #0ea5e9 100%)",
          padding: "72px",
          color: "white",
          fontFamily: "system-ui, -apple-system, 'Hiragino Kaku Gothic ProN', sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              background: "white",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#0ea5e9",
              fontSize: "32px",
              fontWeight: 800,
            }}
          >
            T
          </div>
          <div style={{ fontSize: "32px", fontWeight: 700, opacity: 0.9 }}>Toolify</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "1056px" }}>
          <div
            style={{
              fontSize: isCjk ? "60px" : "72px",
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            {title}
          </div>
          <div style={{ fontSize: "26px", opacity: 0.85, lineHeight: 1.4 }}>{subtitle}</div>
        </div>
      </div>
    ),
    { ...SIZE },
  );
}
