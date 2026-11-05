import { describe, expect, it } from "vitest";
import { isShareableInputType, isSharePayloadWithinLimit } from "./share-input-policy";

describe("generic share URL input policy", () => {
  it("never serializes credentials or invisible inputs", () => {
    for (const type of ["password", "hidden", "file", "submit", "button", "reset", "image", "PASSWORD"]) {
      expect(isShareableInputType(type)).toBe(false);
    }
  });
  it("keeps ordinary useful calculation fields", () => {
    for (const type of ["text", "number", "checkbox", "radio", "date", "range"]) {
      expect(isShareableInputType(type)).toBe(true);
    }
  });
  it("rejects oversized or invalid encoded payload sizes", () => {
    expect(isSharePayloadWithinLimit("abc", 3)).toBe(true);
    expect(isSharePayloadWithinLimit("abcd", 3)).toBe(false);
    expect(isSharePayloadWithinLimit("", 0)).toBe(false);
  });
});
