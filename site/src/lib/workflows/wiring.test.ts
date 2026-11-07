import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const file = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

describe("workflow entrypoint & task-completion wiring", () => {
  it("shows work first, contextual next step before related & ads", () => {
    const source = file("../../components/tools/ToolFrame.tsx");
    const workspace = source.indexOf("<ToolInteractionTracker");
    const workflow = source.indexOf("<WorkflowNextStep");
    const related = source.indexOf("{related.length > 0");
    const ads = source.indexOf("<AdBelowResult");
    expect([workspace, workflow, related, ads].every((x) => x >= 0)).toBe(true);
    expect(workspace).toBeLessThan(workflow);
    expect(workflow).toBeLessThan(related);
    expect(related).toBeLessThan(ads);
  });

  it("has search, mobile and homepage entrypoints without duplicating tools", () => {
    const home = file("../../app/[locale]/page.tsx");
    const desktop = file("../../components/layout/Header.tsx");
    const mobile = file("../../components/layout/MobileMenu.tsx");
    const sitemap = file("../../app/sitemap.ts");
    const page = file("../../app/[locale]/workflows/page.tsx");
    expect(home).toContain('href="/workflows"');
    expect(home).toContain("WORKFLOWS.map");
    expect(desktop).toContain('href="/workflows"');
    expect(mobile).toContain('href="/workflows"');
    expect(sitemap).not.toContain('"/workflows"');
    expect(page).toContain('path: "/workflows"');
    expect(page).toContain("noindex: true");
    expect(page).toContain("getTool(slug)");
  });

  it("attributes meaningful input without sending entered values", () => {
    const track = file("../../components/tools/ToolInteractionTracker.tsx");
    const events = file("../analytics/events.ts");
    const link = file("../../components/workflows/WorkflowToolLink.tsx");
    expect(link).toContain("wf=${workflow}&ws=${step}");
    expect(track).toContain("getWorkflowContext(window.location.search, slug)");
    expect(track).toContain("if (!e.isTrusted");
    expect(track).toContain("attributeWorkflowUse(hasResult)");
    const event = events.slice(events.indexOf("export function trackWorkflowCalculate("));
    expect(event).toContain('"workflow_calculate"');
    expect(event).toContain("workflow_id");
    expect(event).toContain("step_number");
    expect(event).toContain("tool_slug");
    expect(event).not.toContain("input_count");
    expect(event).not.toContain("link_url");
    expect(event).not.toContain("window.location");
  });
});
