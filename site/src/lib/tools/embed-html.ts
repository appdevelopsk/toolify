/** Escape text embedded into HTML markup, including quoted attributes. */
export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case "&": return "&amp;";
      case "<": return "&lt;";
      case ">": return "&gt;";
      case '"': return "&quot;";
      default: return "&#39;";
    }
  });
}

/** Reject active or opaque URL schemes even after HTML attribute escaping. */
function safeEmbedUrl(value: string, fallback: string): string {
  // WHATWG URL parsing trims some controls; reject them before parsing.
  if (/[\u0000-\u001f\u007f]/.test(value) || value.trim() !== value) return fallback;
  try {
    const parsed = new URL(value);
    // Userinfo in copied embed snippets risks leaking credentials.
    if (parsed.username || parsed.password) return fallback;
    const localDev = parsed.protocol === "http:" &&
      (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1");
    if (parsed.protocol === "https:" || localDev) return value;
  } catch {
    // Relative and malformed inputs must not be emitted as iframe/link URLs.
  }
  return fallback;
}

/** Keep snippet assembly isolated and testable outside React. */
export function buildToolEmbedSnippet(title: string, embedUrl: string, toolUrl: string): string {
  const safeTitle = escapeHtml(title);
  const safeEmbedSrc = escapeHtml(safeEmbedUrl(embedUrl, 'about:blank'));
  const safeToolUrl = escapeHtml(safeEmbedUrl(toolUrl, 'https://toolify365.com'));
  return `<iframe src="${safeEmbedSrc}" width="100%" height="520" style="border:1px solid #e2e8f0;border-radius:12px" loading="lazy" title="${safeTitle}"></iframe>\n<p style="font:13px/1.6 system-ui,-apple-system,sans-serif;text-align:center;margin:6px 0;color:#64748b">Free <a href="${safeToolUrl}" target="_blank" rel="noopener">${safeTitle}</a> by <a href="https://toolify365.com" target="_blank" rel="noopener">toolify365</a></p>`;
}
