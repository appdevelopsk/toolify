import { describe, expect, it } from "vitest";
import { LOCALES } from "@/lib/i18n/locales";
import { JOURNEY_NEXT_STEP_COPY, journeyNextStepCopyFor } from "./journeyNextStepCopy";

describe("translated next-tool navigation", () => {
  it("covers every active locale without unsupported entries", () => {
    expect(Object.keys(JOURNEY_NEXT_STEP_COPY).sort()).toEqual([...LOCALES].sort());
    for (const locale of LOCALES) {
      const copy = journeyNextStepCopyFor(locale);
      expect(copy.ariaLabel.trim().length).toBeGreaterThan(2);
      expect(copy.progressLabel.trim().length).toBeGreaterThan(3);
      expect(copy.nextToolLabel.trim().length).toBeGreaterThan(2);
      expect(copy.privacyNote.trim().length).toBeGreaterThan(10);
    }
  });

  it("localizes the next-step CTA for real overseas audiences", () => {
    expect(journeyNextStepCopyFor("es").nextToolLabel).toContain("herramienta");
    expect(journeyNextStepCopyFor("ar").nextToolLabel).toContain("الأداة");
    expect(journeyNextStepCopyFor("pt-BR").nextToolLabel).toContain("ferramenta");
    expect(journeyNextStepCopyFor("fr").nextToolLabel).toContain("Outil");
  });

  it("keeps original English and Japanese text and safe fallback", () => {
    expect(journeyNextStepCopyFor("en").nextToolLabel).toBe("Next tool: ");
    expect(journeyNextStepCopyFor("ja").nextToolLabel).toBe("次に使う：");
    expect(journeyNextStepCopyFor("unsupported")).toEqual(JOURNEY_NEXT_STEP_COPY.en);
  });
});
