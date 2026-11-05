import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("./useAutoShareableState.ts", import.meta.url), "utf8");
const manual = readFileSync(new URL("./useShareableState.ts", import.meta.url), "utf8");

describe("share policy integration", () => {
  it("uses the PII-aware policy for inputs, textareas and selects", () => {
    expect(source).toContain("isShareableField(el.type, el.autocomplete, privateField)");
    expect(source).toContain('isShareableField("textarea", el.autocomplete, privateField)');
    expect(source).toContain('isShareableField("select", el.getAttribute("autocomplete") ?? "", privateField)');
    expect(source).toContain('el.closest("[data-private], [data-share=\\\"off\\\"]")');
  });
  it("retains payload size limits in both sharing hooks", () => {
    expect(source).toContain("isSharePayloadWithinLimit(raw, MAX_ENCODED)");
    expect(source).toContain("isSharePayloadWithinLimit(encoded, MAX_ENCODED)");
    expect(manual).toContain("raw.length > MAX_SHARED_STATE_LENGTH");
    expect(manual).toContain("encoded.length > MAX_SHARED_STATE_LENGTH");
  });
});
