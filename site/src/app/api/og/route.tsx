import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

const SIZE = { width: 1200, height: 630 };

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
]);

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

  // Complex scripts crash satori's font shaper — use safe English fallback text
  const usesFallback = COMPLEX_SCRIPT_LOCALES.has(locale);
  const displayTitle = usesFallback ? "Toolify" : title;
  const displaySubtitle = usesFallback
    ? "Free online tools — calculators, converters & more"
    : subtitle;

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
            {displayTitle}
          </div>
          <div style={{ fontSize: "26px", opacity: 0.85, lineHeight: 1.4 }}>{displaySubtitle}</div>
        </div>
      </div>
    ),
    { ...SIZE },
  );
}
