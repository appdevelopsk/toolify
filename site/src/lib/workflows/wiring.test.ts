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

  it("retains main's mobile-first tool layout and shows the next step before share controls", () => {
    const frame = file("../../components/tools/ToolFrame.tsx");
    const crumbs = file("../../components/layout/Breadcrumbs.tsx");
    const workspace = frame.indexOf('<section className="tool-workspace');
    const guide = frame.indexOf("<WorkflowNextStep");
    const mobileShare = frame.indexOf('<div className="sm:hidden">');
    expect(frame).toContain("hideCurrentOnMobile");
    expect(crumbs).toContain("hideCurrentOnMobile?: boolean");
    expect(frame).toContain("line-clamp-2");
    expect(frame).toContain('<div className="hidden sm:block">');
    expect([workspace, guide, mobileShare].every((v) => v >= 0)).toBe(true);
    expect(workspace).toBeLessThan(guide);
    expect(guide).toBeLessThan(mobileShare);
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
    expect(desktop).toContain("workflowNav={workflow.nav}");
    expect(mobile).toContain("workflowNav: string");
    expect(mobile).not.toContain("workflowCopy");
    expect(sitemap).not.toContain('"/workflows"');
    expect(page).toContain('path: "/workflows"');
    expect(page).toContain("noindex: true");
    expect(page).toContain("getTool(slug)");
  });

  it("links all twelve steps back to their journey including terminal steps", () => {
    const source = file("../../components/workflows/WorkflowNextStep.tsx");
    expect(source).toContain("WORKFLOWS.find");
    expect(source).toContain("if (!journey) return null");
    expect(source).toContain("const currentStep =");
    expect(source).toContain("{followUp && (");
    expect(source).toContain("href={`/workflows#${journey.id}`}");
    // Terminal steps have a return link, never a false 'completed' signal.
    expect(source).not.toContain("trackWorkflowCompletion(");
    expect(source).not.toContain("{copy.completed}");
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
