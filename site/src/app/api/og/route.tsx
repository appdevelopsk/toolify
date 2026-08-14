import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

// nodejs ランタイム必須。edge ランタイム（standalone/VPS）では satori が既定フォントを
// 取得できず全リクエストが 1×1 透明 PNG フォールバックに落ちていた（= 全OG画像が空白、
// Pinterest RSS が「画像なし」でフィードを拒否）。フォントは public/fonts から明示的に読む。
export const runtime = "nodejs";

const FONT_FAMILY = "Noto Sans";

// standalone サーバの cwd = DEPLOY_PATH。deploy.yml が public/ をそこへ rsync する。
let fontCache: { name: string; data: Buffer; weight: 400 | 700; style: "normal" }[] | null = null;
function loadFonts() {
  if (!fontCache) {
    const dir = join(process.cwd(), "public", "fonts");
    fontCache = [
      { name: FONT_FAMILY, data: readFileSync(join(dir, "noto-sans-regular.ttf")), weight: 400, style: "normal" },
      { name: FONT_FAMILY, data: readFileSync(join(dir, "noto-sans-bold.ttf")), weight: 700, style: "normal" },
    ];
  }
  return fontCache;
}

const SIZE = { width: 1200, height: 630 };
// Pinterest 推奨の縦長 2:3（統合集客: growth/pinterest-post.mjs が ?format=pin で参照）
const PIN_SIZE = { width: 1000, height: 1500 };

// Locales whose scripts require complex OpenType shaping (GSUB lookupType:5/substFormat:3)
// that the built-in Noto Sans Latin font cannot handle — satori crashes with:
// "Error: lookupType: 5 - substFormat: 3 is not yet supported"
// Fall back to English text for these locales to prevent 502 errors.
const COMPLEX_SCRIPT_LOCALES = new Set([
  "ar", "fa", "he", "ur", // Arabic / Hebrew / RTL
  "hi", "bn", "gu", "pa", "mr", "ne", // Devanagari / Indic
  "ta", "te", "kn", "ml", "si", // South Indian
  "my", "km", "lo", "ka", "am", // Burmese / Khmer / Lao / Georgian / Amharic
  "ko", // Korean Hangul — jamo combination GSUB tables crash satori on VPS system fonts
  "zh-CN", "zh-TW", "zh", // CJK Chinese — system Noto CJK fonts trigger GSUB substFormat:3 crash
  "ja", // Japanese CJK — same GSUB crash as Chinese on VPS with Noto CJK installed
  "th", // Thai — complex script shaping causes GSUB crash on VPS
]);

function buildImageJsx(displayTitle: string, displaySubtitle: string, isCjk: boolean, isPin = false) {
  if (isPin) {
    // Pinterest 2:3 vertical pin — scannable, number-forward layout
    return (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundImage: "linear-gradient(160deg, #0c4a6e 0%, #0369a1 60%, #0ea5e9 100%)",
          fontFamily: `${FONT_FAMILY}, sans-serif`,
          color: "white",
        }}
      >
        {/* Top brand bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "52px 64px 44px",
            borderBottom: "3px solid rgba(255,255,255,0.25)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "52px",
                height: "52px",
                background: "white",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#0ea5e9",
                fontSize: "28px",
                fontWeight: 900,
              }}
            >
              T
            </div>
            <div style={{ fontSize: "30px", fontWeight: 700, opacity: 0.95 }}>Toolify365</div>
          </div>
          <div
            style={{
              fontSize: "20px",
              fontWeight: 700,
              border: "2px solid rgba(255,255,255,0.6)",
              borderRadius: "6px",
              padding: "8px 18px",
              opacity: 0.9,
            }}
          >
            FREE TOOL
          </div>
        </div>

        {/* Center: main title */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "60px 64px",
          }}
        >
          <div
            style={{
              width: "72px",
              height: "6px",
              backgroundColor: "#38bdf8",
              borderRadius: "3px",
              marginBottom: "52px",
            }}
          />
          <div
            style={{
              fontSize: isCjk ? "64px" : "72px",
              fontWeight: 900,
              lineHeight: 1.1,
              textAlign: "center",
              letterSpacing: "-0.02em",
            }}
          >
            {displayTitle}
          </div>
          <div
            style={{
              marginTop: "44px",
              fontSize: "30px",
              opacity: 0.85,
              textAlign: "center",
              lineHeight: 1.5,
            }}
          >
            {displaySubtitle}
          </div>
          <div
            style={{
              width: "72px",
              height: "6px",
              backgroundColor: "#38bdf8",
              borderRadius: "3px",
              marginTop: "52px",
            }}
          />
        </div>

        {/* Bottom CTA bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#38bdf8",
            padding: "44px 64px",
          }}
        >
          <div
            style={{
              color: "#0c4a6e",
              fontSize: "30px",
              fontWeight: 800,
              letterSpacing: "0.01em",
            }}
          >
            Free · No Signup · toolify365.com
          </div>
        </div>
      </div>
    );
  }

  // Standard 1200×630 layout
  return (
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
        fontFamily: `${FONT_FAMILY}, sans-serif`,
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
        <div style={{ fontSize: "32px", fontWeight: 700, opacity: 0.9 }}>Toolify365</div>
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
          {displayTitle}
        </div>
        <div style={{ fontSize: "26px", opacity: 0.85, lineHeight: 1.4 }}>{displaySubtitle}</div>
      </div>
    </div>
  );
}

// Minimal 1×1 transparent PNG (base64) — last-resort fallback when satori crashes completely
// Returns 200 so nginx never sees a 502
const BLANK_PNG_B64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

/**
 * Force-render an ImageResponse to a fully-buffered PNG Response.
 *
 * `new ImageResponse(...)` only constructs a *streaming* body — the actual satori
 * rendering happens lazily as the stream is consumed (piped to nginx).  Wrapping
 * `new ImageResponse()` in try-catch therefore does NOT catch satori GSUB errors;
 * they surface later as "failed to pipe response" 502.
 *
 * Calling `await img.arrayBuffer()` forces the stream to be fully consumed *here*,
 * so any satori exception is thrown synchronously and caught by the outer try-catch.
 */
async function renderOgImage(
  title: string,
  subtitle: string,
  isCjk: boolean,
  isPin = false,
): Promise<Response> {
  const img = new ImageResponse(buildImageJsx(title, subtitle, isCjk, isPin), {
    ...(isPin ? PIN_SIZE : SIZE),
    fonts: loadFonts(),
  });
  // arrayBuffer() eagerly drains the stream — satori errors become catchable here
  const buf = await img.arrayBuffer();
  return new Response(buf, {
    status: 200,
    headers: { "Content-Type": "image/png" },
  });
}

/**
 * /api/og?title=...&subtitle=...&locale=...
 *
 * Edge-runtime で動的にOG画像を生成。
 * 各ツールページの buildMetadata から呼び出される（既定動作）。
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = (searchParams.get("title") ?? "Toolify365").slice(0, 80);
  const subtitle = (searchParams.get("subtitle") ?? "Free, fast, ad-supported online tools").slice(0, 140);
  const locale = searchParams.get("locale") ?? "en";
  const isPin = searchParams.get("format") === "pin";
  const isCjk = locale === "ja" || locale.startsWith("zh") || locale === "ko" || locale === "th";

  // Complex scripts crash satori's font shaper — use safe English fallback text
  const usesFallback = COMPLEX_SCRIPT_LOCALES.has(locale);
  const displayTitle = usesFallback ? "Toolify365" : title;
  const displaySubtitle = usesFallback
    ? "Free online tools — calculators, converters & more"
    : subtitle;

  // First attempt: render with (possibly fallback) locale text.
  // Uses renderOgImage() which eagerly buffers the stream so satori errors are catchable.
  try {
    return await renderOgImage(displayTitle, displaySubtitle, isCjk, isPin);
  } catch {
    // satori GSUB substFormat:3 or other font-shaper error — fall through to ASCII retry
  }

  // Second attempt: guaranteed ASCII-only English text
  try {
    return await renderOgImage(
      "Toolify365",
      "Free online tools — calculators, converters & more",
      false,
      isPin,
    );
  } catch {
    // All rendering failed — return 1×1 transparent PNG so nginx gets 200, not 502
  }

  // Last resort: static 1×1 transparent PNG
  const bytes = Uint8Array.from(atob(BLANK_PNG_B64), (c) => c.charCodeAt(0));
  return new Response(bytes, {
    status: 200,
    headers: { "Content-Type": "image/png" },
  });
}
