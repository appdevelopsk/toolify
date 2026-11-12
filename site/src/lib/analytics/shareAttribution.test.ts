import { describe, expect, it } from "vitest";
import { escapeEmbedHtml, socialShareUrl } from "./shareAttribution";

describe("socialShareUrl", () => {
  it("attributes a localized tool URL without modifying the input", () => {
    const canonical = "https://toolify365.com/es/tools/json-formatter";
    const result = new URL(socialShareUrl(canonical, "telegram"));
    expect(result.pathname).toBe("/es/tools/json-formatter");
    expect(result.searchParams.get("utm_source")).toBe("telegram");
    expect(result.searchParams.get("utm_medium")).toBe("social");
    expect(result.searchParams.get("utm_campaign")).toBe("tool_share");
    expect(canonical).toBe("https://toolify365.com/es/tools/json-formatter");
  });

  it("preserves existing share state and avoids duplicate UTM keys", () => {
    const result = new URL(socialShareUrl("https://toolify365.com/en/tools/uuid-generator?s=abc&utm_source=old#result", "linkedin"));
    expect(result.searchParams.get("s")).toBe("abc");
    expect(result.searchParams.getAll("utm_source")).toEqual(["linkedin"]);
    expect(result.hash).toBe("#result");
  });

  it("rejects unsafe schemes", () => {
    expect(() => socialShareUrl("javascript:alert(1)", "x")).toThrow();
  });
});

describe("escapeEmbedHtml", () => {
  it("escapes hostile title and text special characters", () => {
    expect(escapeEmbedHtml('<Tool & "Calc" \'Test\'>')).toBe("&lt;Tool &amp; &quot;Calc&quot; &#39;Test&#39;&gt;");
  });
});
