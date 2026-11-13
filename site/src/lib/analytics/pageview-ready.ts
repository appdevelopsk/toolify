/**
 * A browser may mount the SPA tracker before Next's afterInteractive GA4
 * initialization. Only send when Toolify's own config has been queued.
 * The URL is sanitized separately by safePageViewUrl.
 */
export function shouldSendPageView(
  ready: boolean | undefined,
  gtag: unknown,
  pageLocation: string,
  lastPageLocation: string,
): boolean {
  return ready === true &&
    typeof gtag === "function" &&
    pageLocation.length > 0 &&
    pageLocation !== lastPageLocation;
}
