/**
 * On-demand, fragment-only sharing for tool result inputs.
 *
 * Browser URLs are not rewritten on every keystroke. A result link is
 * assembled only for an explicit "Copy result link" action.
 * URL fragments are not sent in HTTP requests or HTTP referrer headers.
 * Third-party scripts may still inspect fragments; do not include secrets.
 */
export const RESULT_LINK_REQUEST = "toolify:result-link-request";
export const RESULT_LINK_AVAILABILITY_REQUEST = "toolify:result-link-availability-request";
export const RESULT_LINK_CAPABILITY_CHANGED = "toolify:result-link-capability-changed";

export type ResultLinkRequest = {
  slug: string;
  respond: (url: string | null) => void;
};

export type ResultLinkAvailabilityRequest = {
  slug: string;
  respond: (available: boolean) => void;
};

export function readResultShareState(href: string): string | null {
  const url = new URL(href);
  // New links use #s=..., but existing ?s=... links still restore.
  const fragment = url.hash.startsWith("#s=") ? url.hash.slice(3) : null;
  return fragment || url.searchParams.get("s");
}

export function createResultShareLink(href: string, encoded: string, maxLength: number): string | null {
  if (!encoded || maxLength < 1 || encoded.length > maxLength || !/^[A-Za-z0-9_-]+$/.test(encoded)) {
    return null;
  }
  const url = new URL(href);
  // Never copy unrelated query parameters (?token, ?email, ?utm_*, etc.)
  // into a user-visible result link. Only the fixed, two-key workflow
  // context is retained so guided 3-step task navigation still works.
  const workflow = url.searchParams.getAll("wf");
  const step = url.searchParams.getAll("ws");
  const validWorkflow = workflow.length === 1
    && ["data", "writing", "shopping", "scheduling"].includes(workflow[0] ?? "");
  const validStep = step.length === 1 && /^[1-3]$/.test(step[0] ?? "");
  url.search = "";
  if (validWorkflow && validStep) {
    url.searchParams.set("wf", workflow[0]!);
    url.searchParams.set("ws", step[0]!);
  }
  url.hash = `s=${encoded}`;
  return url.toString();
}

/**
 * Convert old ?s= links to #s= after hydration without dropping attribution
 * parameters. Existing links still hit the server once on first navigation.
 */
export function migrateLegacyShareQuery(href: string): string | null {
  const url = new URL(href);
  const raw = url.searchParams.get("s");
  if (raw === null) return null;
  url.searchParams.delete("s");
  // Never carry arbitrary invalid query values into a new shared fragment.
  if (!url.hash.startsWith("#s=") && /^[A-Za-z0-9_-]+$/.test(raw)) url.hash = `s=${raw}`;
  return url.toString();
}

/** Discard obsolete shared values after a user edits a restored result. */
export function clearStaleResultShareState(href: string): string | null {
  const url = new URL(href);
  const containsQuery = url.searchParams.has("s");
  const containsFragment = url.hash.startsWith("#s=");
  if (!containsQuery && !containsFragment) return null;
  url.searchParams.delete("s");
  if (containsFragment) url.hash = "";
  return url.toString();
}


/**
 * Distinguish the first hydration-driven state update from subsequent edits.
 * A restored value exactly matching the serialized shared state is not an edit.
 * If the tool normalizes/ignores the restored state, a later different value
 * is treated as an edit and the obsolete fragment is removed.
 */
export function classifyRestoredShareChange(
  previous: string | null,
  current: string,
  expectedRestored: string | null,
): { clearStale: boolean; nextExpected: string | null } {
  if (expectedRestored !== null && current === expectedRestored) {
    return { clearStale: false, nextExpected: null };
  }
  if (previous === null || previous === current) {
    return { clearStale: false, nextExpected: expectedRestored };
  }
  return { clearStale: true, nextExpected: null };
}
