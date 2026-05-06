import { describe, it, expect } from "vitest";
import {
  organizationJsonLd,
  websiteJsonLd,
  softwareAppJsonLd,
  howToJsonLd,
  faqJsonLd,
  breadcrumbJsonLd,
} from "./structured-data";

describe("structured-data", () => {
  it("organizationJsonLd has @context and @type", () => {
    const ld = organizationJsonLd() as Record<string, unknown>;
    expect(ld["@context"]).toBe("https://schema.org");
    expect(ld["@type"]).toBe("Organization");
    expect(ld.url).toMatch(/^https?:\/\//);
  });

  it("websiteJsonLd includes locale-specific URL and inLanguage", () => {
    const ld = websiteJsonLd("en") as Record<string, unknown>;
    expect(ld["@type"]).toBe("WebSite");
    expect(ld.inLanguage).toBe("en");
    expect(ld.url).toMatch(/\/en$/);
  });

  it("softwareAppJsonLd produces valid offer", () => {
    const ld = softwareAppJsonLd({
      name: "BMI Calculator",
      description: "Calculate BMI",
      url: "https://example.com/en/tools/bmi",
      applicationCategory: "HealthApplication",
      inLanguage: "en",
    }) as Record<string, unknown>;
    expect(ld["@type"]).toBe("SoftwareApplication");
    expect(ld.name).toBe("BMI Calculator");
    expect((ld.offers as Record<string, unknown>).price).toBe("0");
  });

  it("howToJsonLd numbers steps starting at 1", () => {
    const ld = howToJsonLd({
      name: "Use BMI",
      steps: [
        { name: "First", text: "Step 1" },
        { name: "Second", text: "Step 2" },
      ],
      inLanguage: "en",
    }) as Record<string, unknown>;
    const steps = ld.step as Array<Record<string, unknown>>;
    expect(steps).toHaveLength(2);
    expect(steps[0]!.position).toBe(1);
    expect(steps[1]!.position).toBe(2);
  });

  it("faqJsonLd wraps questions in mainEntity", () => {
    const ld = faqJsonLd([{ q: "Q1", a: "A1" }, { q: "Q2", a: "A2" }], "en") as Record<string, unknown>;
    expect(ld["@type"]).toBe("FAQPage");
    const items = ld.mainEntity as Array<Record<string, unknown>>;
    expect(items).toHaveLength(2);
    expect(items[0]!.name).toBe("Q1");
    expect((items[0]!.acceptedAnswer as Record<string, unknown>).text).toBe("A1");
  });

  it("breadcrumbJsonLd numbers items starting at 1", () => {
    const ld = breadcrumbJsonLd([
      { name: "Home", url: "https://example.com/" },
      { name: "Tools", url: "https://example.com/tools" },
    ]) as Record<string, unknown>;
    expect(ld["@type"]).toBe("BreadcrumbList");
    const items = ld.itemListElement as Array<Record<string, unknown>>;
    expect(items[0]!.position).toBe(1);
    expect(items[1]!.position).toBe(2);
  });
});
