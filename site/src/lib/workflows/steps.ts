export const WORKFLOWS = [
  { id: "data", emoji: "🧹", tools: ["csv-json-converter", "json-formatter", "json-to-yaml-converter"] },
  { id: "writing", emoji: "✍️", tools: ["word-counter", "case-converter", "slug-generator"] },
  { id: "shopping", emoji: "🛒", tools: ["discount-calculator", "sales-tax-calculator", "unit-price-calculator"] },
  { id: "scheduling", emoji: "📅", tools: ["date-calculator", "workdays-calculator", "timezone-converter"] },
] as const;

export type WorkflowId = (typeof WORKFLOWS)[number]["id"];

/**
 * Resolve a useful follow-up without cookies, URL state or user-entered data.
 * All 12 slugs are unique across the curated journeys.
 */
export function getWorkflowContinuation(slug: string):
  | { workflow: WorkflowId; nextSlug: string; nextStep: number }
  | undefined {
  for (const workflow of WORKFLOWS) {
    const index = workflow.tools.findIndex((value: string) => value === slug);
    if (index < 0 || index + 1 >= workflow.tools.length) continue;
    const nextSlug = workflow.tools[index + 1];
    if (nextSlug) return { workflow: workflow.id, nextSlug, nextStep: index + 2 };
  }
  return undefined;
}



/** Match only fixed curated journey context: no user input, no open redirects. */
export function getWorkflowContext(search: string, slug: string):
  | { workflow: WorkflowId; step: number }
  | undefined {
  const q = new URLSearchParams(search);
  // Duplicate parameters are ambiguous and should not be attributed.
  if (q.getAll("wf").length !== 1 || q.getAll("ws").length !== 1) return undefined;
  const id = q.get("wf");
  const rawStep = q.get("ws");
  if (!rawStep || !/^[1-3]$/.test(rawStep)) return undefined;
  const step = Number(rawStep);
  const flow = WORKFLOWS.find((item) => item.id === id);
  return flow?.tools[step - 1] === slug ? { workflow: flow.id, step } : undefined;
}
