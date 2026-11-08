import { sanitizePageViewUrl } from "./pageview-url";

export type PageViewPayload = ReturnType<typeof sanitizePageViewUrl> & {
  page_title: string;
};

export type PageViewSnapshot = {
  ready: boolean;
  href: string;
  title: string;
  emit?: (payload: PageViewPayload) => void;
};

/**
 * One successful page_view per mounted pathname.
 * Only the consent-configured GA bootstrap may make the sender ready.
 * No query string, hash or tool-share state is ever included in the payload.
 */
export function createPageViewSender(snapshot: () => PageViewSnapshot): () => boolean {
  let sent = false;
  return () => {
    if (sent) return false;
    const current = snapshot();
    if (!current.ready || !current.emit) return false;
    const safe = sanitizePageViewUrl(current.href);
    current.emit({
      ...safe,
      page_title: current.title,
    });
    sent = true;
    return true;
  };
}
