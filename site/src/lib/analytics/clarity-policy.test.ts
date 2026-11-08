import { describe, expect, it } from "vitest";
import { canLoadClarity } from "./clarity-policy";

describe("Clarity privacy activation policy", () => {
  it("stays disabled even with a project ID when review is missing", () => {
    expect(canLoadClarity("project-123", undefined)).toBe(false);
    expect(canLoadClarity("project-123", "")).toBe(false);
    expect(canLoadClarity("project-123", "true")).toBe(false);
    expect(canLoadClarity("project-123", "pending")).toBe(false);
  });

  it("does not allow blank project IDs even with explicit review", () => {
    expect(canLoadClarity("", "confirmed")).toBe(false);
    expect(canLoadClarity("  ", "confirmed")).toBe(false);
  });

  it("requires both a real project ID and the exact reviewed flag", () => {
    expect(canLoadClarity("project-123", "confirmed")).toBe(true);
    expect(canLoadClarity("  project-123  ", "confirmed")).toBe(true);
    expect(canLoadClarity("project-123", "CONFIRMED")).toBe(false);
  });
});
