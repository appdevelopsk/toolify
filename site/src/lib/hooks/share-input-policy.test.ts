import { describe, expect, it } from "vitest";
import { isShareableInputType, isShareableField, isSharePayloadWithinLimit, isValidRestoredFieldValue } from "./share-input-policy";

describe("generic share URL input policy", () => {
  it("never serializes credentials or invisible inputs", () => {
    for (const type of ["password", "hidden", "file", "submit", "button", "reset", "image", "PASSWORD", "email", "tel"]) {
      expect(isShareableInputType(type)).toBe(false);
    }
  });
  it("keeps ordinary useful calculation fields", () => {
    for (const type of ["text", "number", "checkbox", "radio", "date", "range"]) {
      expect(isShareableInputType(type)).toBe(true);
    }
  });
  it("excludes sensitive autofill fields and explicit private annotations", () => {
    for (const autocomplete of [
      "email", "section-payment cc-number", "name", "given-name",
      "family-name", "street-address", "postal-code", "tel-national",
      "username", "one-time-code", "bday-year",
    ]) {
      expect(isShareableField("text", autocomplete)).toBe(false);
    }
    expect(isShareableField("text", "off", true)).toBe(false);
    expect(isShareableField("number", "off", true)).toBe(false);
    expect(isShareableField("text", "off")).toBe(false);
    expect(isShareableField("number")).toBe(true);
    expect(isShareableField("select", "country")).toBe(false);
    expect(isShareableField("textarea", "street-address")).toBe(false);
  });

  it("requires reviewed explicit opt-in for free-form text while retaining numeric fields", () => {
    for (const type of ["text", "textarea", "search", "url"]) {
      expect(isShareableField(type)).toBe(false);
      expect(isShareableField(type, "off", false, "notes", true)).toBe(true);
    }
    expect(isShareableField("text", "email", false, "notes", true)).toBe(false);
    expect(isShareableField("text", "off", true, "notes", true)).toBe(false);
    expect(isShareableField("number")).toBe(true);
    expect(isShareableField("checkbox")).toBe(true);
  });

  it("excludes sensitive name/id identifiers even without autocomplete", () => {
    for (const identifier of [
      "apiKey", "user-password", "refresh_token", "creditCard",
      "cardNumber", "cvv", "billingEmail", "contactPhone", "postalCode",
      "secret", "privateKey", "socialSecurity",
    ]) {
      expect(isShareableField("text", "off", false, identifier, true)).toBe(false);
    }
    for (const identifier of ["amount", "result", "valueA", "percentage", "angleC"]) {
      expect(isShareableField("number", "off", false, identifier)).toBe(true);
    }
  });

  it("validates decoded input types instead of coercing untrusted URL data", () => {
    expect(isValidRestoredFieldValue("checkbox", true)).toBe(true);
    expect(isValidRestoredFieldValue("checkbox", "true")).toBe(false);
    expect(isValidRestoredFieldValue("radio", "mode-a")).toBe(true);
    expect(isValidRestoredFieldValue("radio", false)).toBe(false);
    for (const value of ["2.5", "-3", "1e3", ""]) {
      expect(isValidRestoredFieldValue("number", value)).toBe(true);
    }
    for (const value of ["NaN", "Infinity", "12abc", true, 10, "1".repeat(1801)]) {
      expect(isValidRestoredFieldValue("number", value)).toBe(false);
    }
    expect(isValidRestoredFieldValue("textarea", "text")).toBe(true);
    expect(isValidRestoredFieldValue("textarea", null)).toBe(false);
  });

  it("rejects oversized or invalid encoded payload sizes", () => {
    expect(isSharePayloadWithinLimit("abc", 3)).toBe(true);
    expect(isSharePayloadWithinLimit("abcd", 3)).toBe(false);
    expect(isSharePayloadWithinLimit("", 0)).toBe(false);
  });
});
