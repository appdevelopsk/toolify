import { describe, expect, it } from "vitest";
import { safePageViewUrl } from "./pageview-url";

describe("GA4 SPA page view URL privacy", () => {
  it("never sends browser OpenSearch terms or user tool state", () => {
    const input = "https://toolify365.com/fr/tools?q=jean%40example.com&s=private-state#private";
    const result = safePageViewUrl("/fr/tools", input);
    expect(result).toEqual({
      page_path: "/fr/tools",
      page_location: "https://toolify365.com/fr/tools",
    });
    expect(JSON.stringify(result)).not.toContain("private");
    expect(JSON.stringify(result)).not.toContain("jean");
  });
  it("retains bounded social campaign UTMs without exposing arbitrary parameters", () => {
    const input = "https://toolify365.com/en/tools?q=hello&utm_source=telegram&utm_medium=social&utm_campaign=tool_share&utm_term=private";
    expect(safePageViewUrl("/en/tools", input)).toEqual({
      page_path: "/en/tools",
      page_location: "https://toolify365.com/en/tools?utm_source=telegram&utm_medium=social&utm_campaign=tool_share",
    });
  });
  it("rejects untrusted campaign strings, repeated keys and URL fragments", () => {
    const raw = "https://toolify365.com/en/tools?utm_source=good&utm_source=bad&utm_medium=bad%20spaces&utm_campaign=" + "a".repeat(100) + "#secret";
    expect(safePageViewUrl("/en/tools", raw)).toEqual({
      page_path: "/en/tools",
      page_location: "https://toolify365.com/en/tools",
    });
  });
  it("does not create a new page location solely when the private search changes", () => {
    const a = safePageViewUrl("/en/tools", "https://toolify365.com/en/tools?q=first");
    const b = safePageViewUrl("/en/tools", "https://toolify365.com/en/tools?q=second");
    expect(a.page_location).toBe(b.page_location);
  });
});
