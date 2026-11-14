/**
 * Delivery for early, deliberate user actions while Next.js loads GA4.
 *
 * The tracking stub can mount after users start typing/clicking. Dropping
 * those events biases engagement rates and makes early destination clicks
 * impossible to attribute. Keep only a small, short-lived, IN-MEMORY queue;
 * never write events or raw tool inputs to storage.
 *
 * Consent Mode defaults and GA4 config must already be initialized before
 * any event is forwarded (see gtag.tsx). Embedded third-party widgets don't
 * load GA4, so no events are forwarded from those documents.
 */
type QueuedEvent = { name: string; params: Record<string, unknown>; at: number };
type ReadyWindow = Window & { __toolifyGa4Ready?: boolean };
const MAX_EVENTS = 24;
const MAX_AGE_MS = 15_000;
let queued: QueuedEvent[] = [];
let listeningOn: ReadyWindow | null = null;

function ready(w: ReadyWindow): boolean {
  return w.__toolifyGa4Ready === true && typeof w.gtag === "function";
}

function stopListening() {
  if (!listeningOn) return;
  listeningOn.removeEventListener("toolify:ga4-ready", onReady);
  listeningOn = null;
}

function flush(w: ReadyWindow) {
  if (!ready(w)) return;
  stopListening();
  const now = Date.now();
  const items = queued;
  queued = [];
  for (const item of items) {
    if (now >= item.at && now - item.at <= MAX_AGE_MS) {
      w.gtag?.("event", item.name, item.params);
    }
  }
}

function onReady() {
  if (typeof window === "undefined") return;
  flush(window as ReadyWindow);
}

/**
 * Returns true only when a GA4-configured top-level page accepted the event
 * for delivery, not when gtag sent a network request or GA4 recorded a user.
 */
export function dispatchGa4Event(name: string, params: Record<string, unknown>): boolean {
  if (typeof window === "undefined") return false;
  const w = window as ReadyWindow;

  // The /embed pages intentionally have no GA4 script or cookie/consent UI.
  // They should not build up event data while framed on third-party sites.
  try {
    if (w.self !== w.top) return false;
  } catch {
    return false;
  }

  if (ready(w)) {
    flush(w);
    w.gtag?.("event", name, params);
    return true;
  }

  // No persistence, user text, query, calculation result, or identity included.
  if (queued.length >= MAX_EVENTS) queued.shift();
  queued.push({ name, params, at: Date.now() });
  if (listeningOn !== w) {
    stopListening();
    w.addEventListener("toolify:ga4-ready", onReady);
    listeningOn = w;
  }
  return true;
}
