import { describe, expect, it } from "vitest";
import { LOCALES } from "@/lib/i18n/locales";
import { getTool } from "@/lib/tools/registry";
import { WORKFLOWS, workflowCopy, getWorkflowContinuation } from "./catalog";
import { getWorkflowContext } from "./steps";

describe("goal-based workflows", () => {
  it("has four three-step journeys with real, unique tools", () => {
    expect(WORKFLOWS).toHaveLength(4);
    const ids = new Set<string>();
    for (const journey of WORKFLOWS) {
      expect(ids.has(journey.id)).toBe(false);
      ids.add(journey.id);
      expect(journey.tools).toHaveLength(3);
      expect(new Set(journey.tools).size).toBe(journey.tools.length);
      for (const slug of journey.tools) expect(getTool(slug)).toBeTruthy();
    }
  });

  it("provides all on-page labels in every supported locale", () => {
    expect(LOCALES).toHaveLength(17);
    for (const locale of LOCALES) {
      const copy = workflowCopy(locale);
      for (const value of [copy.nav, copy.heading, copy.description, copy.step, copy.open, copy.privacy]) {
        expect(value.trim().length).toBeGreaterThan(0);
      }
      for (const flow of WORKFLOWS) expect(copy.title(flow.id).trim().length).toBeGreaterThan(0);
    }
  });


  it("points each non-terminal step to the exact next tool", () => {
    for (const journey of WORKFLOWS) {
      journey.tools.forEach((slug, index) => {
        const result = getWorkflowContinuation(slug);
        if (index === journey.tools.length - 1) {
          expect(result).toBeUndefined();
        } else {
          expect(result).toEqual({
            workflow: journey.id,
            nextSlug: journey.tools[index + 1],
            nextStep: index + 2,
          });
        }
      });
    }
    expect(getWorkflowContinuation("unknown-tool")).toBeUndefined();
    expect(getWorkflowContinuation("__proto__")).toBeUndefined();
  });


  it("accepts only a valid workflow query pointing to its current tool", () => {
    for (const flow of WORKFLOWS) for (const [index, slug] of flow.tools.entries()) {
      expect(getWorkflowContext(`?wf=${flow.id}&ws=${index + 1}`, slug)).toEqual({
        workflow: flow.id, step: index + 1,
      });
      expect(getWorkflowContext(`?wf=${flow.id}&ws=${index + 1}`, "different-tool")).toBeUndefined();
    }
    expect(getWorkflowContext("?wf=data&ws=999", "csv-json-converter")).toBeUndefined();
    expect(getWorkflowContext("?wf=data&wf=writing&ws=1", "csv-json-converter")).toBeUndefined();
    expect(getWorkflowContext("?wf=data&ws=1&ws=2", "csv-json-converter")).toBeUndefined();
    expect(getWorkflowContext("?wf=__proto__&ws=1", "csv-json-converter")).toBeUndefined();
  });

  it("does not depend on user data and has a predictable fallback", () => {
    expect(workflowCopy("unknown").heading).toBe(workflowCopy("en").heading);
    expect(WORKFLOWS.every(({ tools }) => tools.every((slug) => !/[?&#/]/.test(slug)))).toBe(true);
  });
});
